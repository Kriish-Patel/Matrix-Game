// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');
const Headline = require('../../models/headlines.model');
const Player = require('../../models/player.model');

const jurorQueues = {}; // { jurorSocketId: [headlineId1, headlineId2, ...] }

const createLobby = () => {
  const lobbyId = uuidv4();
  // lobbies[lobbyId] = { players: [], roles: {}, host: null, gameState: 'waiting', headlines: [], jurorScores: {} };
  return lobbyId;
};
const assignHeadlineToJuror = (headlineId, headline, io) => {
  // Find the juror with the least number of headlines in their queue
  let leastLoadedJuror = null;
  let minQueueSize = Infinity;

  for (const jurorSocketId in jurorQueues) {
    const queueSize = jurorQueues[jurorSocketId].length;
    console.log(`jurorSocketId: ${jurorSocketId}, queueSize: ${queueSize}`)
    if (queueSize < minQueueSize) {
      minQueueSize = queueSize;
      leastLoadedJuror = jurorSocketId;
    }
  }

  // Assign the headline to this juror
  if (leastLoadedJuror) {
    jurorQueues[leastLoadedJuror].push(headlineId);
    io.to(leastLoadedJuror).emit('newHeadline', { headlineId, headline });
    console.log(`Assigned headline ID ${headlineId} to juror ${leastLoadedJuror}`);
  } else {
    console.error('No jurors available to assign headline');
  }
};

const registerJuror = (jurorSocketId) => {
  if (!jurorQueues[jurorSocketId]) {
    jurorQueues[jurorSocketId] = [];
  }
};
const saveHeadline = async (socketId, headlineText) => {
// find player by socketid
  const player = await Player.findOne( {socketId} );

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

const processDiceRoll = async (headlineId, socketId, plausibilityScore, diceRollNumber) => {

  console.log(`Plausibility score for headline ID ${headlineId} is ${plausibilityScore}`);
  console.log(`Dice Roll from processDiceRoll: ${diceRollNumber}`);

  const headline = await Headline.findById(headlineId).populate('player');

  headline.plausabilityScore = plausibilityScore;

  if (diceRollNumber < plausibilityScore) {
    headline.accepted = true;
    console.log(`Headline ID ${headlineId} accepted based on random number`);
  }

  await headline.save();
  removeHeadlineFromJurorQueue(socketId, headlineId);
  return { headline, accepted: headline.accepted };
};

const removeHeadlineFromJurorQueue = (jurorSocketId, headlineId) => {
  if (jurorQueues[jurorSocketId]) {


    // Use filter method with ObjectId comparison
    jurorQueues[jurorSocketId] = jurorQueues[jurorSocketId].filter(id => {
      return !id.equals(headlineId);
    });

    console.log(`Updated queue:`, jurorQueues[jurorSocketId]);
  }
};


const assignRole = async (socketId, role) => {
  const player = await Player.findOne({ socketId });

  if (!player) {
    throw new Error('Player not found');
  }

  if (player.role === 'host') {
    throw new Error('Cannot assign a role to the host');
  }

  player.role = role;
  await player.save();

  return player;
};



const deregisterJuror = (jurorSocketId) => {
  delete jurorQueues[jurorSocketId];
};
const processJurorReview = async (headlineId, isConsistent, jurorScore, plausabilityScore) => {
  try {
    // Find the headline and the juror's score
    const headline = await Headline.findById(headlineId).populate('player');
    if (!headline) {
      throw new Error('Headline not found');
    }
    let combinedScore;

    if (isConsistent) {
      // Calculate juror's score based on -log(p/100)
      headline.plausabilityScore = plausabilityScore;
      headline.logicallyConsistent = true;
      const CalculatedPlausibilityScore = -6 * Math.log(plausabilityScore / 100);

      // Round the result to 1 decimal place
      const roundedPlausabilityScore = Math.round(CalculatedPlausibilityScore * 10) / 10;
    
      console.log(`juror score: ${headline.jurorScore}, calculated score: ${roundedPlausabilityScore}`)
      
      // Calculate the combined score
      combinedScore = roundedPlausabilityScore + jurorScore;

      // Update the headline
      
      headline.combinedScore = combinedScore;

      // Update the player's running total score
      const player = await Player.findById(headline.player);
      if (player) {
        console.log(`player found, player score is ${player.Score}`)
        if (player.Score === null){
          console.log(`player score is null`)
          player.Score = combinedScore;
        }
        else{
          player.Score += combinedScore;
        }
        await player.save();
        console.log(`player score: ${player.Score}`);
      }
    } else {
      headline.logicallyConsistent = false;
      headline.combinedScore = 0;
      combinedScore = 0;
    }

    await headline.save();
    console.log(`player ID: ${headline.player}`);
    return { success: true, playerId: headline.player.socketId, combinedScore: combinedScore, headline: headline.headline, plausibility: headline.plausabilityScore };
  } catch (error) {
    console.error('Error processing juror review:', error);
    return { success: false, error };
  }
};

module.exports = {
  createLobby,
  processDiceRoll,
  saveHeadline,
  assignRole,
  assignHeadlineToJuror,
  registerJuror,
  deregisterJuror,
  processJurorReview
  
};
