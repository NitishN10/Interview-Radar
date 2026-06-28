import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('db.json');

// Initialize database with default structure if it doesn't exist
export function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      problems: [],
      completions: [] // Array of { userId, problemId, completedAt (ISO String) }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Read database
function readDb() {
  initDb();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, resetting...', err);
    return { users: [], problems: [], completions: [] };
  }
}

// Write database
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// User Operations
export function findUserByEmail(email) {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(name, email) {
  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

// Problem Operations
export function getProblems() {
  const db = readDb();
  return db.problems;
}

export function saveProblems(problems) {
  const db = readDb();
  db.problems = problems;
  writeDb(db);
}

// Completion operations
export function toggleProblemCompletion(userId, problemId) {
  const db = readDb();
  const index = db.completions.findIndex(
    c => c.userId === userId && String(c.problemId) === String(problemId)
  );

  let isCompleted = false;
  if (index !== -1) {
    // Remove completion (toggle off)
    db.completions.splice(index, 1);
  } else {
    // Add completion (toggle on)
    db.completions.push({
      userId,
      problemId: String(problemId),
      completedAt: new Date().toISOString()
    });
    isCompleted = true;
  }

  writeDb(db);
  return isCompleted;
}

export function getUserCompletedList(userId) {
  const db = readDb();
  return db.completions
    .filter(c => c.userId === userId)
    .map(c => c.problemId);
}

export function getUserCompletions(userId) {
  const db = readDb();
  return db.completions.filter(c => c.userId === userId);
}

// Activity heat map metrics
export function getUserActivityMap(userId) {
  const db = readDb();
  const userCompletions = db.completions.filter(c => c.userId === userId);
  
  const activityMap = {};
  userCompletions.forEach(c => {
    const date = new Date(c.completedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  });

  return activityMap;
}
