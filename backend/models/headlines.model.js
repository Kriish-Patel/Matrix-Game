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
  accepted: {
    type: Boolean,
    required: true,
    default: false
  },
  jurorScore: {
    type: Number,
    default: null
  },
  umpireScore: {
    type: Number,
    default: null
  },
  isConsistent: {
    type: Boolean,
    required: true,
    default: false
  },
  year: {
    type: Number,
    defualt: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Headline', headlineSchema);
