// Import required modules
const express = require('express');          // Web framework
const cors = require('cors');                // Enable Cross-Origin Resource Sharing
const fs = require('fs');                    // File system access
const csv = require('csv-parser');           // To parse CSV files

const app = express();
const PORT = 5000;

app.use(cors());                             // Allow requests from frontend (different origin)
app.use(express.json());                    // Parse incoming JSON payloads


const mongoose = require('mongoose');

// Replace with your own connection string
const MONGODB_URI = 'mongodb+srv://omer:omer@capital-scores.2ixqfil.mongodb.net/?retryWrites=true&w=majority&appName=capital-scores';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log(' Connected to MongoDB');
}).catch((err) => {
  console.error(' MongoDB connection error:', err);
});




// Store parsed country-capital-continent tuples
let pairs = [];

// Read CSV file on server startup
fs.createReadStream('Data.csv')   // Adjust this path to match your structure
  .pipe(csv())
  .on('data', (row) => {
    // Check required columns exist
    if (row['CountryName'] && row['CapitalName'] && row['ContinentName']) {
      // Push cleaned data to pairs array
      pairs.push({
        country: row['CountryName'].trim(),
        capital: row['CapitalName'].trim(),
        continent: row['ContinentName'].trim(),
        lat: parseFloat(row['Latitude']),
        lng: parseFloat(row['Longitude'])        
      });
    }
  }) 
  .on('end', () => {
    console.log('CSV loaded. Total entries:', pairs.length);
    //yooooooooooooooooo
    //otoro
  });


// Utility: Shuffle array like Python's random.sample
function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// === ROUTES ===

// Get all shuffled pairs (Mode 1)
app.get('/api/mode1', (req, res) => {
  const shuffled = shuffle(pairs);             // Return randomized list
  res.json(shuffled);
});

// Get filtered and shuffled pairs by continent (Mode 2)
app.get('/api/mode2', (req, res) => {
  const continent = req.query.continent;       // Get continent from query param

  // If no continent provided, return all
  if (!continent) {
    return res.json(shuffle(pairs));
  }

  // Filter by continent
  const filtered = pairs.filter(
    p => p.continent.toLowerCase() === continent.toLowerCase()
  );

  if (filtered.length === 0) {
    return res.status(404).json({ message: `No data found for continent: ${continent}` });
  }

  res.json(shuffle(filtered));
});


// --- SCORE MODEL & ROUTES ---
const Score = require('./score');

// Save user score
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

// Get leaderboard (top scores)
app.get('/api/leaderboard', async (req, res) => {
  try {
    let scores = await Score.find().sort({ score: -1, date: 1 }).limit(10).lean();
    if (!scores || scores.length === 0) {
      // Demo data if DB is empty
     
    }
    res.json(scores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Health check (optional)
app.get('/', (req, res) => {
  res.send('Country-Capital Quiz Backend is running 🚀');
});

// Start server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
