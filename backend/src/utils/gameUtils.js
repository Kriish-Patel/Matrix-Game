// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');
const Headline = require('../../models/headlines.model');
const Player = require('../../models/player.model');
const players = require('./Players.js')
// const { bufferOrEmitMessage } = require('./sharedUtil.js');

const jurorQueues = {}; // { jurorSocketId: [headlineId1, headlineId2, ...] }

const createLobby = () => {
  const lobbyId = uuidv4();
  // lobbies[lobbyId] = { players: [], roles: {}, host: null, gameState: 'waiting', headlines: [], jurorScores: {} };
  return lobbyId;
};
const assignHeadlineToJuror = (headlineId, headline, io, bufferOrEmitMessage) => {
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
    // io.to(userSessions[leastLoadedJuror]).emit('newHeadline', { headlineId, headline });
    bufferOrEmitMessage(leastLoadedJuror, 'newHeadline', { headlineId, headline });
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
  const player = players.getPlayer(socketId);

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

const processDiceRoll = async (headlineId, socketId, diceRollNumber) => {

  // Find the headline by the headlineID
  const headline = await Headline.findById(headlineId).populate('player');
    
  headline.diceRoll = diceRollNumber;
  
  await headline.save();
  console.log(`3. Stored dice roll of ${diceRollNumber} for headline ID ${headlineId}`);

  if (diceRollNumber < headline.plausibilityScore || headline.forceAccept) {
    headline.accepted = true;
    if (headline.forceAccept) {
        console.log(`Headline ID ${headlineId} accepted based on force accept`);
    } else {
        console.log(`Headline ID ${headlineId} accepted based on random number`);
    }
}
  
  await headline.save();
  removeHeadlineFromJurorQueue(socketId, headlineId);
  return { headline: headline, accepted: headline.accepted };
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

const processPlayerScores = async (io, socket, headlineId, bufferOrEmitToAll) => {
  try {
    console.log(`Starting processPlayerScores for headline ID: ${headlineId}`);
    
    // Find the headline and the juror's score
    const headline = await Headline.findById(headlineId).populate('player');
    
    if (!headline) {
      throw new Error('Headline not found');
    }
    
    let combinedScore = 0;
    
    
    if (headline.isConsistent) {
      
      // Calculate juror's score based on -log(p/100)
      const CalculatedPlausibilityScore = -6 * Math.log(headline.plausibilityScore / 100);

      // Round the result to 1 decimal place
      const roundedPlausabilityScore = Math.round(CalculatedPlausibilityScore * 10) / 10;
    
      console.log(`juror score: ${headline.jurorScore}, calculated score: ${roundedPlausabilityScore}`);
      
      // Calculate the combined score
      combinedScore = roundedPlausabilityScore + headline.jurorScore;

      // Update average score across all players
      bufferOrEmitToAll('updateAverageScore', { score: combinedScore });

      // Update the player's running total score
      const player = players.getPlayer(headline.player.socketId);
      if (player) {
        console.log(`player found, player score is ${player.Score}`)
        await player.incrementScore(combinedScore);

        // Save the player document first, then the headline document
        await player.save();
        // Send score to frontend
        io.to(headline.player.socketId.toString()).emit('updatePlayerScore', { score: player.Score });
        console.log(`Player score updated to: ${player.Score}`);
      } else {
        console.error(`Player not found for headline ID: ${headlineId}`);
      }
    } else {
      console.log(`Headline ID ${headlineId} is not consistent, no score calculated.`);
    }

  } catch (error) {
    console.error(`Error processing player scores for headline ID "${headlineId}":`, error);
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
  processPlayerScores
  
};
