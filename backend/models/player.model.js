// models/playerModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  playerName: {
    type: String,
    required: true,
    trim: true
  },
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['player', 'juror','host'],
    default: null 
  },
  Score: {
    type: Number,
    default: null
  },
  Planet: {
    type: String,
    enum: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'PlanetX'],
    default : null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
