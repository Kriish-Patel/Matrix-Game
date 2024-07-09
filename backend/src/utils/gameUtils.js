// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');
const JurorScore = require('../../models/JurorScores.model');
const Headline = require('../../models/headlines.model');
const Player = require('../../models/player.model');

const lobbies = {};

const createLobby = () => {
  const lobbyId = uuidv4();
  // lobbies[lobbyId] = { players: [], roles: {}, host: null, gameState: 'waiting', headlines: [], jurorScores: {} };
  return lobbyId;
};

const saveHeadline = async (socketId, headlineText) => {
// find player by socketid
  const player = await Player.findOne({ socketId });

  if (!player) {
    throw new Error('Player not found');
  }


  const headline = new Headline({
    player: player._id,
    headline: headlineText,
    accepted: false 
  });

//save headline to db
  const savedHeadline = await headline.save();
  return savedHeadline;
};

const submitJurorScore = async (headlineId, socketId, score) => {

  const jurorScore = new JurorScore({
    headline: headlineId,
    socketId,
    score
  });


  await jurorScore.save();

// get headline
  const scores = await JurorScore.find({ headline: headlineId });
// median calc
  if (scores.length >= 3) {
    // Calculate the median
    const sortedScores = scores.map(s => s.score).sort((a, b) => a - b);
    const median = sortedScores[Math.floor(sortedScores.length / 2)];
    
    // Update the headline with the median score
    const headline = await Headline.findById(headlineId);
    headline.medianScore = median;

    const randomNumber = Math.floor(Math.random() * 101);

    console.log(`Random number generated for headline ID ${headlineId} is ${randomNumber}`);
    console.log(`Median score for headline ID ${headlineId} is ${median}`);

    let accepted = false;
    if (randomNumber < median) {
      headline.accepted = true;
      accepted = true;
      console.log(`Headline ID ${headlineId} accepted based on random number`);
    }

    await headline.save();

    return { headline, accepted };
  }

  return { headline: null, accepted: false };
};

const updateHeadlineAcceptance = async (headlineId, accepted) => {
  const headline = await Headline.findById(headlineId);
  
  if (!headline) {
    throw new Error('Headline not found');
  }
  
  headline.accepted = accepted;
  await headline.save();

  return headline;
};



const assignRole = async (socketId, role) => {
  // Find the player by socketId
  const player = await Player.findOne({ socketId });

  if (!player) {
    throw new Error('Player not found');
  }

  // Assign the role
  player.role = role;

  // Save the updated player
  await player.save();

  return player;
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
  submitJurorScore,
  saveHeadline,
  assignRole,
  updateHeadlineAcceptance
  
};
