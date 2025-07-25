const mongoose = require('mongoose');
const Score = require('./models/Score');
const express = require('express');
const app = express();
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://omer:omer@capital-scores.2ixqfil.mongodb.net/?retryWrites=true&w=majority&appName=capital-scores';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check route
app.get('/', (req, res) => {
  res.send('Quiz API is running');
});

// POST /api/score — save user score
app.post('/api/score', async (req, res) => {
  try {
    const { username, mode, continent, score, total } = req.body;
    if (!username || !mode || !score || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const saved = await Score.create({
      username,
      mode,
      continent,
      score,
      total
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving score' });
  }
});

// GET /api/leaderboard — return top scores, or demo data if empty
app.get('/api/leaderboard', async (req, res) => {
  try {
    let scores = await Score.find().sort({ score: -1, date: 1 }).limit(10).lean();
    if (!scores || scores.length === 0) {
      // Demo data if DB is empty
      scores = [
        { username: 'Alice', score: 8, total: 10, mode: 1 },
        { username: 'Bob', score: 7, total: 10, mode: 2 },
        { username: 'Charlie', score: 6, total: 10, mode: 1 },
        { username: 'Dana', score: 9, total: 10, mode: 2 },
      ];
    }
    res.json(scores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Quiz API server running on port ${PORT}`);
});
