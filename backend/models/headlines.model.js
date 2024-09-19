// models/headlineModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const headlineSchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  headline: {
    type: String,
    required: true,
    trim: true
  },
  diceRoll: {
    type: Number,
  },
  accepted: {
    type: Boolean,
    required: true,
    default: false
  },
  plausibilityScore: {
    type: Number,
    default: null
  },
  grammarScore:{
    type: Number,
    default: null
  },
  planetAlignmentScore:{
    type: Number,
    default: null
  },
  narrativeScore:{
    type: Number,
    default: null
  },
  
  isConsistent: {
    type: Boolean,
    required: true,
    default: false
  },
  jurorScore:{
    type: Number,
    default: null
  },
  forceAccept: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Headline', headlineSchema);
