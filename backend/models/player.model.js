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
    // unique: true
  },
  role: {
    type: String,
    enum: ['player', 'juror','host'],
    default: null 
  },
  Score: {
    type: Number,
    default: 0
  },
  Planet: {
    type: String,
    enum: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'PlanetX'],
    default: null
  }
}, {
  timestamps: true
});

// Instance method to set the role
playerSchema.methods.setRole = function(role) {
  this.role = role;
  return this.save();
};

// Instance method to increment the score
playerSchema.methods.incrementScore = function(points) {
  this.Score = (this.Score || 0) + points;
  return this.save();
};

// Instance method to set the planet
playerSchema.methods.setPlanet = function(planet) {
  this.Planet = planet;
  return this.save();
};

module.exports = mongoose.model('Player', playerSchema);
