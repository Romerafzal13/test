const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  username: { type: String, default: 'Anonymous' },
  mode: Number,
  continent: String, // 1 or 2
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
