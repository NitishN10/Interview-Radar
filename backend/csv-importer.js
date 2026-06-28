import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { initDb, saveProblems } from './db-json.js';
import { POPULAR_PROBLEMS_DETAILS, getGenericDetails } from './seed-data.js';

// Read data from extracted temp master folder
const DATA_DIR = "c:\\Users\\Nitish.N\\Desktop\\DSA Probs\\extracted_temp\\LeetCode-Questions-CompanyWise-master";

// Read and parse a single CSV file
function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) {
      return resolve([]);
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Handle potential column whitespace or casing discrepancies
        const cleanData = {};
        for (const key in data) {
          cleanData[key.trim()] = data[key] ? data[key].trim() : '';
        }
        results.push(cleanData);
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function runImporter() {
  initDb();
  console.log('Starting CSV Import...');

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Data directory does not exist: ${DATA_DIR}`);
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.csv'));
  console.log(`Found ${files.length} CSV files to process.`);

  const mergedProblems = {};

  for (const file of files) {
    // Extract company name from file, e.g. "adobe_1year.csv" -> "Adobe"
    const companyRaw = file.split('_')[0];
    const companyName = companyRaw
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const filePath = path.join(DATA_DIR, file);
    const rows = await parseCsvFile(filePath);

    for (const row of rows) {
      const id = String(row['ID'] || row['id'] || '');
      if (!id) continue;

      const title = row['Title'] || row['title'] || 'Untitled Problem';
      const acceptance = row['Acceptance'] || row['acceptance'] || '50.00%';
      const difficulty = row['Difficulty'] || row['difficulty'] || 'Medium';
      const frequencyVal = parseFloat(row['Frequency'] || row['frequency'] || '0.0');
      const link = row['Leetcode Question Link'] || row['leetcode_link'] || '';

      if (!mergedProblems[id]) {
        // Retrieve seeded templates/descriptions or create generic ones
        const details = POPULAR_PROBLEMS_DETAILS[id] || getGenericDetails(title, id);

        mergedProblems[id] = {
          id,
          title,
          acceptance,
          difficulty,
          leetcodeLink: link,
          description: details.description,
          examples: details.examples,
          constraints: details.constraints || [],
          templates: details.templates,
          testCaseRunner: details.testCaseRunner,
          companies: [] // List of { name, frequency }
        };
      }

      // Add this company to the question ensuring uniqueness
      const existingCompany = mergedProblems[id].companies.find(c => c.name === companyName);
      if (existingCompany) {
        existingCompany.frequency = Math.max(existingCompany.frequency, frequencyVal);
      } else {
        mergedProblems[id].companies.push({
          name: companyName,
          frequency: frequencyVal
        });
      }
    }
  }

  // Finalize details and sort
  const problemsList = Object.values(mergedProblems);
  problemsList.forEach(prob => {
    // Set an overall frequency score (maximum frequency across all companies)
    const maxFreq = Math.max(...prob.companies.map(c => c.frequency), 0);
    prob.frequency = maxFreq;
    
    // Sort companies by frequency desc
    prob.companies.sort((a, b) => b.frequency - a.frequency);
  });

  // Normalize all frequencies against the global maximum frequency (0.0 to 1.0 scale)
  const maxGlobalFreq = Math.max(...problemsList.map(p => p.frequency), 1);
  problemsList.forEach(prob => {
    prob.frequency = prob.frequency / maxGlobalFreq;
    prob.companies.forEach(c => {
      c.frequency = c.frequency / maxGlobalFreq;
    });
  });

  // Sort overall problems list: highest frequency first, then by ID
  problemsList.sort((a, b) => b.frequency - a.frequency || parseInt(a.id) - parseInt(b.id));

  saveProblems(problemsList);
  console.log(`Successfully merged and saved ${problemsList.length} problems to database!`);
}

runImporter().catch(err => {
  console.error('Import failed:', err);
});
