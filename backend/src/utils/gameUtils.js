// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');
const JurorScore = require('../models/jurorScoreModel');
const Headline = require('../models/headlineModel');

const lobbies = {};

const createLobby = () => {
  const lobbyId = uuidv4();
  // lobbies[lobbyId] = { players: [], roles: {}, host: null, gameState: 'waiting', headlines: [], jurorScores: {} };
  return lobbyId;
};

// utils/gameUtils.js

const submitJurorScore = async (headlineId, socketId, score) => {
  // Save the juror's score
  const jurorScore = new JurorScore({ headlineId, socketId, score });
  await jurorScore.save();

  // Fetch all scores for this headline
  const scores = await JurorScore.find({ headlineId });

  // Check if we have 3 scores
  if (scores.length >= 3) {
    // Calculate the median
    const sortedScores = scores.map(s => s.score).sort((a, b) => a - b);
    const median = sortedScores[Math.floor(sortedScores.length / 2)];

    // Update the headline with the median score
    await Headline.findByIdAndUpdate(headlineId, { medianScore: median });
    await JurorScore.deleteMany({ headlineId });
  }
};





// const submitJurorScores = (lobbyId, jurorId, scores) => {
//   if (lobbies[lobbyId]) {
//     lobbies[lobbyId].jurorScores[jurorId] = scores;
//   }
// };

// const calculateMedianScore = (scores) => {
//   const sortedScores = scores.slice().sort((a, b) => a - b);
//   const middle = Math.floor(sortedScores.length / 2);

//   if (sortedScores.length % 2 === 0) {
//     return (sortedScores[middle - 1] + sortedScores[middle]) / 2;
//   } else {
//     return sortedScores[middle];
//   }
// };

// const processHeadlines = (lobbyId) => {
//   if (lobbies[lobbyId]) {
//     const { headlines, jurorScores } = lobbies[lobbyId];
//     headlines.forEach(headline => {
//       const scores = Object.values(jurorScores).map(juror => juror[headline.headline]);
//       const medianScore = calculateMedianScore(scores);
//       const diceRoll = Math.floor(Math.random() * 100) + 1;
//       headline.status = diceRoll <= medianScore ? 'passed' : 'failed';
//     });
//   }
// };

module.exports = {
  createLobby,
  submitJurorScore
  
};
