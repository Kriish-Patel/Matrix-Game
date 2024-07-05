const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Headline schema
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
    required: true
  }
}, {
  timestamps: true 
});

const Headline = mongoose.model('Headline', headlineSchema);
module.exports = Headline;
