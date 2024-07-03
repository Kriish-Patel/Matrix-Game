const mongoose = require('mongoose');

// Define the Headline Schema
const headlineSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player', // Assuming there is a Player model, otherwise you can use String type if Player is not a separate collection
    required: true
  },
  headline: {
    type: String,
    required: true
  },
  accepted: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set the current date if not provided
    required: true
  }
});

const Headline = mongoose.model('Headline', headlineSchema);

module.exports = Headline;
