const {
  
  saveHeadline,
  submitJurorScore,
  assignHeadlineToJuror,
  registerJuror,
  deregisterJuror,
  processJurorReview,
  processDiceRoll,
  assignRole,
} = require('../utils/gameUtils');

let Headline = require('../../models/headlines.model')
let Player = require('../../models/player.model');
const headlinesModel = require('../../models/headlines.model');

let currentYear;
let hostSocketId = null;
let hostName = null;
let players = {}  // {id: [name, role, hostStatus, planet]}
let acceptedHeadlines = {}
let diceRolls = {}; // {}

let availablePlanets = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'PlanetX'
];

const handleSocketConnection = (socket, io) => {
  //LOBBY SOCKETS

  socket.on('create-lobby', ({name}) => {
    if (hostSocketId) 
    {
      socket.emit('error', { message: 'Lobby already created' });
      return;
    }
    const playerData = [name, 'host', true, 'none',0];
    players[socket.id] = playerData;
    hostSocketId = socket.id;
    hostName = name;
    const newPlayer = new Player({
      playerName: name,
      socketId: socket.id,
      role: 'host'
    });
    newPlayer.save()
    .then((savedPlayer) => {
      console.log('Host created:', savedPlayer);
      return savedPlayer;
    })
    .catch((error) => {
      console.error('Error creating host:', error);
    });
    
    socket.join('game-room');
    
    io.to('game-room').emit('host-info', { hostName: name, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: Object.keys(players).map(id => ({
        id,
        name: players[id][0],
        role: players[id][1],
        isHost: players[id][2],
        planet: players[id][3]
      }))
    });
  });


  socket.on('join-lobby', ({ name }) => {
    if (!hostSocketId) {
      socket.emit('error', { message: 'Lobby has not been created yet' });
      return;
    }
    const playerData = [name, '', false, '',0];
    players[socket.id] = playerData;
    const newPlayer = new Player({
      playerName: name,
      socketId: socket.id
    });
    newPlayer.save()
    .then((savedPlayer) => {
      console.log('Player created:', savedPlayer);
      return savedPlayer;
    })
    .catch((error) => {
      console.error('Error creating player:', error);
    });

    socket.join('game-room'); // Join the single room
    io.to('game-room').emit('host-info', { hostName: hostName, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: Object.keys(players).map(id => ({
        id,
        name: players[id][0],
        role: players[id][1],
        isHost: players[id][2],
        planet: players[id][3]
      }))
    });

  });

  socket.on('togglePause', ({ lobbyId, isPaused }) => {
    if (socket.id === hostSocketId) {
      io.to('game-room').emit('gamePaused', { isPaused });
    } else {
      socket.emit('error', { message: 'Only the host can pause/resume the game' });
    }
  });

  socket.on('selectPlanet', async ({planet, playerId}) => {

    if (availablePlanets.includes(planet)) {
      availablePlanets = availablePlanets.filter((p) => p !== planet);
      players[playerId][3] = planet
      const player = await Player.findOne({socketId: playerId})
      player.Planet = planet
      player.save()
        
      io.to('game-room').emit('planetSelected', planet);
      io.to('game-room').emit('updatePlayerList', {
        players: Object.keys(players).map(id => ({
          id,
          name: players[id][0],
          role: players[id][1],
          isHost: players[id][2],
          planet: players[id][3]
        }))
      });
    }
  });3

  socket.on('assignRole', async ({playerId, role }) => {
    if (socket.id === hostSocketId) {
      if (playerId === hostSocketId) {
        socket.emit('error', { message: 'Host cannot assign a role to themselves' });
        return;
      }
      await assignRole(playerId, role);
      players[playerId][1] = role;
      io.to('game-room').emit('updatePlayerList', {
        players: Object.keys(players).map(id => ({
          id,
          name: players[id][0],
          role: players[id][1],
          isHost: players[id][2],
          planet: players[id][3]
        }))
      });
    } else {
      socket.emit('error', { message: 'Only the host can assign roles' });
    }
  });

  socket.on('disconnect', () => {
    deregisterJuror(socket.id);
    console.log(`Client disconnected: ${socket.id}`);

    // Handle host disconnection
    if (socket.id === hostSocketId) {
      hostSocketId = null;
      console.log(`Host disconnected: ${socket.id}`);
    }
  });



  //GAME SOCKETS

  socket.on('startGame', ({ lobbyId }) => {

    console.log(`startGame event received for lobby ${lobbyId}`);
    
    const actualPlayers = Object.values(players).filter(player => player[1] === 'player');
    const unassignedPlayers = Object.values(players).filter(player => player[1] === '');

    io.in('game-room').emit('actualPlayersCount', {actualPlayers})
  
    if (unassignedPlayers.length > 0) {
      socket.emit('error', 'All players must have assigned roles before starting the game');
      return;
    }
    io.in('game-room').emit('roundStarted');
    
  });

  socket.on('to-game-manager', () => {
    io.to('game-room').emit('updatePlayerList', {
      players: Object.keys(players).map(id => ({
        id,
        name: players[id][0],
        role: players[id][1],
        isHost: players[id][2],
        planet: players[id][3]
      }))
    });
    io.to('game-room').emit('navigate:selectPlanet');
  });
  
  socket.on('submitHeadline', async ({ socketId, headline }) => {
    try {
      const newHeadline = await saveHeadline(socketId, headline);
      
      console.log(`1. Headline received: ${headline},socket ID: ${socketId}, headline id: ${newHeadline._id}`);
      socket.emit('getHeadlineID', {headlineID: newHeadline._id})
      console.log(`2. Headline ID sent to front`);

      socket.emit('updatePlayerStatus', { socketId: socketId, headlineId: newHeadline._id, headline: newHeadline.headline, status: 'with Juror, pending' })
      assignHeadlineToJuror(newHeadline._id, newHeadline.headline, io);
      
    } catch (error) {
      console.error('Error submitting headline:', error);
      socket.emit('error', { message: 'Failed to submit headline' });
    }
  });

  socket.on('submitDiceRoll', async ({ socketId, randomNumber, headlineID }) => {
    
  
    try {
      // Find the headline by the headlineID
      const headlineDoc = await Headline.findById(headlineID);
  
      if (!headlineDoc) {
        console.error(`Headline not found for ID:"${headlineID}"`);
        return;
      }
  
      // Store the dice roll in the headline document
      headlineDoc.diceRoll = randomNumber;
      await headlineDoc.save();
  
      console.log(`3. Stored dice roll of ${randomNumber} for headline ID ${headlineID}`);
    } catch (error) {
      console.error(`Error storing dice roll for headlineID "${headlineID}":`, error);
    }
  });

  socket.on('registerJuror', () => {
    registerJuror(socket.id);
    console.log(`Juror registered: ${socket.id}`);
  });

  socket.on('deregisterJuror', () => {
    deregisterJuror(socket.id);
    console.log(`Juror deregistered: ${socket.id}`);
  });

  socket.on('updateCurrentYear', ({ currentYear: year }) => {
    currentYear = year;
  });

  socket.on('submitJurorReview', async ({ headlineId, isConsistent, jurorScore, plausibilityScore}) => {
    const headlineDoc = await Headline.findById(headlineId);

    if (!headlineDoc) {
        console.error(`Headline not found for ID: ${headlineId}`);
        return;
    }
    // Access the dice roll number from the headline document
    const diceRollNumber = headlineDoc.diceRoll;

    if (diceRollNumber === undefined || diceRollNumber === null) {
        console.error(`Dice roll not found for headline ID: ${headlineId}`);
        return;
    }
    console.log(`Dice Roll from submitJurorReview: ${diceRollNumber}`);

    const { headline, accepted } = await processDiceRoll(headlineId, socket.id, plausibilityScore, diceRollNumber);
    const result = await processJurorReview(headlineId, isConsistent, jurorScore, plausibilityScore);
    socket.to(headline.player.socketId.toString()).emit('sendHeadlinePlausibilityScore', { plausibility: plausibilityScore, headline: headline.headline})

    
    if (result.success) {
      console.log(`is it consistent?: ${isConsistent}`)
      // Emit an event to notify the player of the updated score if the headline is consistent
      if (isConsistent) {

        if (headline && accepted) {
          
          acceptedHeadlines[result.headline] = currentYear;
       
          socket.to(result.playerId.toString()).emit('updatePlayerScore', { score: result.combinedScore});
          io.emit('updateAverageScore', {score: result.combinedScore})

          io.emit('sendPlayerCount', { playerCount: Object.keys(players)
            .filter(id => players[id][1].toLowerCase() === "player")
            .length})
          
          players[result.playerId][4] = result.combinedScore
          io.emit('acceptedHeadline', {headline: result.headline, currentYear, plausibility: result.plausibility})
          
          socket.to(result.playerId.toString()).emit('updatePlayerStatus', { socketId: result.playerId, headlineId, headline: result.headline, status: 'success' });
          
        }

        if (headline && !accepted) {
          // Emit changeStatus
          console.log(`Emitting changeStatus with status: 'failed'`);
          socket.to(headline.player.socketId).emit('updatePlayerStatus', { socketId: headline.player.socketId, headlineId: headline._id, headline: headline.headline, status: 'failed' })
        }
      }
      else {
        socket.to(result.playerId.toString()).emit('updatePlayerStatus', { socketId: result.playerId, headlineId, headline: result.headline, status: 'failed' });
      }
      console.log('Juror review submitted and player score updated');
    } else {
      console.error('Error processing Juror review:', result.error);
    }
  });


  socket.on('endGame', ()=>{

    const array = Object.keys(players)
    .filter(id => players[id][1].toLowerCase() === "player")
    .map(id => ({
      id,
      name: players[id][0],
      score: players[id][4]
    }))
    console.log(`inside socket: ${array}`)
    
    io.emit('showLeaderboard', {players: Object.keys(players)
      .filter(id => players[id][1].toLowerCase() === "player")
      .map(id => ({
        id,
        name: players[id][0],
        score: players[id][4],
        planet: players[id][3]
      })), acceptedHeadlines})
  })

};

module.exports = handleSocketConnection;