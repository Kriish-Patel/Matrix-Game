// models/jurorScores.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jurorScoreSchema = new Schema({
  headlineId: {
    type: Schema.Types.ObjectId,
    ref: 'Headline',
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JurorScore', jurorScoreSchema);
