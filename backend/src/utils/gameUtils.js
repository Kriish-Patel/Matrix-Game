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


const registerJuror = (jurorSocketId) => {
  if (!jurorQueues[jurorSocketId]) {
    jurorQueues[jurorSocketId] = [];
  }
};

const deregisterJuror = (jurorSocketId) => {
  delete jurorQueues[jurorSocketId];
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

const submitJurorScore = async (headlineId, socketId, score) => {

  const randomNumber = Math.floor(Math.random() * 101);
  console.log(`Random number generated for headline ID ${headlineId} is ${randomNumber}`);
  console.log(`Score for headline ID ${headlineId} is ${score}`);

  const headline = await Headline.findById(headlineId).populate('player');

  headline.jurorScore = score;

  if (randomNumber < score) {
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

// const updateHeadlineAcceptance = async (headlineId, accepted) => {
//   const headline = await Headline.findById(headlineId);
  
//   if (!headline) {
//     throw new Error('Headline not found');
//   }
  
//   headline.accepted = accepted;
//   await headline.save();

//   return headline;
// };



const assignRole = async (socketId, role) => {
  // const player = await Player.findOne({ socketId });
  const player = players.getPlayer(socketId)
  console.log(`socket id of the player you are assigning a role to: ${socketId}`)

  if (!player) {
    throw new Error('Player not found');
  }

  if (player.role === 'host') {
    throw new Error('Cannot assign a role to the host');
  }

  player.role = role;
  await player.save();

  return;
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

const processUmpireReview = async (headlineId, isConsistent, umpireScore) => {
  try {
    // Find the headline and the juror's score
    const headline = await Headline.findById(headlineId).populate('player');
    if (!headline) {
      throw new Error('Headline not found');
    }
    let combinedScore;

    if (isConsistent) {
      // Calculate juror's score based on -log(p/100)
      const jurorScore = headline.jurorScore;
      const jurorCalculatedScore = -6 * Math.log(jurorScore / 100);

      // Round the result to 1 decimal place
      const roundedResult = Math.round(jurorCalculatedScore * 10) / 10;
      
      console.log(roundedResult);    
      console.log(`juror score: ${headline.jurorScore}, calculated score: ${roundedResult}`)
      console.log(`umpire Score: ${umpireScore}`)

      // Calculate the combined score
      combinedScore = roundedResult + umpireScore;

      // Update the headline
      headline.logicallyConsistent = true;
      headline.umpireScore = umpireScore;
      headline.combinedScore = combinedScore;

      // Update the player's running total score
      const player = players.getPlayer(headline.player.socketId);
      if (player) {
        console.log(`player found, player score is ${player.Score}`)
        await player.incrementScore(combinedScore);

        // Save the player document first, then the headline document
        await player.save();
        console.log(`player score: ${player.Score}`);
      }
    } else {
      headline.logicallyConsistent = false;
      headline.umpireScore = null;
      headline.combinedScore = 0;
      combinedScore = 0;
    }

    // Save the headline document after the player document has been saved
    await headline.save();
    console.log(`player ID: ${headline.player}`);
    return { success: true, playerId: headline.player.socketId, combinedScore: combinedScore, headline: headline.headline, plausibility: headline.jurorScore };
  } catch (error) {
    console.error('Error processing umpire review:', error);
    return { success: false, error };
  }
};


module.exports = {
  createLobby,
  submitJurorScore,
  saveHeadline,
  assignRole,
  registerJuror,
  deregisterJuror,
  // updateHeadlineAcceptance,
  assignHeadlineToJuror,
  processUmpireReview
  
};
