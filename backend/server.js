import express from 'express';
import cors from 'cors';
import {
  initDb,
  findUserByEmail,
  createUser,
  getProblems,
  toggleProblemCompletion,
  getUserCompletedList,
  getUserCompletions,
  getUserActivityMap
} from './db-json.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize Database on startup
initDb();

function getLocalYMD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to calculate current active streak
function calculateStreak(activityMap) {
  const dates = Object.keys(activityMap).sort((a, b) => new Date(b) - new Date(a));
  if (dates.length === 0) return 0;

  const todayStr = getLocalYMD(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalYMD(yesterday);

  // If there's no activity today and no activity yesterday, the streak is broken
  if (!activityMap[todayStr] && !activityMap[yesterdayStr]) {
    return 0;
  }

  let streak = 0;
  let checkDate = activityMap[todayStr] ? new Date() : yesterday;

  while (true) {
    const checkStr = getLocalYMD(checkDate);
    if (activityMap[checkStr]) {
      streak++;
      // Move to the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const user = createUser(name.trim(), email.trim());
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Problems List API (with search, filter, and user completion status)
app.get('/api/problems', (req, res) => {
  const { search, difficulty, company, userId } = req.query;

  try {
    let list = getProblems();

    // Attach completion status if userId is provided
    if (userId) {
      const completedList = getUserCompletedList(userId);
      const completedSet = new Set(completedList.map(String));
      list = list.map(prob => ({
        ...prob,
        completed: completedSet.has(String(prob.id))
      }));
    } else {
      list = list.map(prob => ({ ...prob, completed: false }));
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      list = list.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Filter by company
    if (company && company !== 'All') {
      list = list.filter(p => p.companies.some(c => c.name.toLowerCase() === company.toLowerCase()));
    }

    // Filter by search query (id or title)
    if (search) {
      const query = search.toLowerCase().trim();
      list = list.filter(p => p.id.includes(query) || p.title.toLowerCase().includes(query));
    }

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Single Problem Details API
app.get('/api/problems/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const problems = getProblems();
    const problem = problems.find(p => String(p.id) === String(id));
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    let completed = false;
    if (userId) {
      const completedList = getUserCompletedList(userId);
      completed = completedList.map(String).includes(String(id));
    }

    return res.json({ ...problem, completed });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Toggle Completion API
app.post('/api/problems/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const isCompleted = toggleProblemCompletion(userId, id);
    return res.json({ completed: isCompleted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// User Dashboard Data API (Solved stats, difficulty distribution, activity map, streak)
app.get('/api/user/dashboard', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const problems = getProblems();
    const completedList = getUserCompletedList(userId);
    const activityMap = getUserActivityMap(userId);
    const streak = calculateStreak(activityMap);

    const totalCount = problems.length;
    const solvedCount = completedList.length;

    // Difficulty breakdown
    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const totalByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };

    problems.forEach(p => {
      const diff = p.difficulty; // 'Easy', 'Medium', 'Hard'
      if (totalByDifficulty[diff] !== undefined) {
        totalByDifficulty[diff]++;
      }
      if (completedList.map(String).includes(String(p.id))) {
        if (solvedByDifficulty[diff] !== undefined) {
          solvedByDifficulty[diff]++;
        }
      }
    });

    // Extract unique companies from data
    const allCompanies = new Set();
    problems.forEach(p => {
      p.companies.forEach(c => allCompanies.add(c.name));
    });

    // Fetch details of solved history with completion dates
    const rawCompletions = getUserCompletions(userId);
    const solvedHistory = rawCompletions.map(c => {
      const p = problems.find(prob => String(prob.id) === String(c.problemId));
      return {
        id: c.problemId,
        title: p ? p.title : 'Unknown Problem',
        difficulty: p ? p.difficulty : 'Medium',
        completedAt: c.completedAt
      };
    });
    // Sort descending by completion time (newest solved first)
    solvedHistory.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    return res.json({
      solvedCount,
      totalCount,
      solvedByDifficulty,
      totalByDifficulty,
      activityMap,
      streak,
      companiesList: Array.from(allCompanies).sort(),
      solvedHistory
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Start Express App
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
