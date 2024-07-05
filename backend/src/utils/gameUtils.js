// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');

const lobbies = {};

const createLobby = () => {
  const lobbyId = uuidv4();
  // lobbies[lobbyId] = { players: [], roles: {}, host: null, gameState: 'waiting', headlines: [], jurorScores: {} };
  return lobbyId;
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
  
};
