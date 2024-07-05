const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  playerName: {
    type: String,
    required: true,
    trim: true
  },
  playerID: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
