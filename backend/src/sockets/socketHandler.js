const {
  
  saveHeadline,
  submitJurorScore,
  updateHeadlineAcceptance,
  
} = require('../utils/gameUtils');

let Player = require('../../models/player.model')

let hostSocketId = null;
let hostName = null;
let players = {}  // {id: [name, role, hostStatus, planet]}
let availablePlanets = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto'
];

const handleSocketConnection = (socket, io) => {


  //LOBBY SOCKETS
  socket.on('create-lobby', ({name}) => {
    if (hostSocketId) 
    {
      socket.emit('error', { message: 'Lobby already created' });
      return;
    }
    const playerData = [name, '', true, 'none'];
    players[socket.id] = playerData;
    hostSocketId = socket.id;
    hostName = name;
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
    
    io.to('game-room').emit('host-info', { hostName: name, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: Object.keys(players).map(id => ({
        id,
        name: players[id][0],
        role: players[id][1],
        isHost: players[id][2]
      }))
    });
    
  });

  socket.on('join-lobby', ({ name }) => {
    if (!hostSocketId) {
      socket.emit('error', { message: 'Lobby has not been created yet' });
      return;
    }
    const playerData = [name, '', false, ''];
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

  socket.on('selectPlanet', ({planet, playerId}) => {

    if (availablePlanets.includes(planet)) {
      availablePlanets = availablePlanets.filter((p) => p !== planet);
      players[playerId][3] = planet
        
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
  });

  socket.on('assignRole', ({playerId, role }) => {

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

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Handle host disconnection
    if (socket.id === hostSocketId) {
      hostSocketId = null;
      console.log(`Host disconnected: ${socket.id}`);
    }
  });    
});

  //GAME SOCKETS

  socket.on('startGame', ({ lobbyId }) => {

    console.log(`startGame event received for lobby ${lobbyId}`);
    
    const unassignedPlayers = Object.values(players).filter(player => player[1] === '');
  
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
        isHost: players[id][2]
      }))
    });
    io.to('game-room').emit('navigate:selectPlanet');
  });
  
  socket.on('submitHeadline', async ({ socketId, headline }) => {
    try {
      const savedHeadline = await saveHeadline(socketId, headline);
      console.log(`Headline submitted: ${headline} from socket ID: ${socketId}`);

      io.to('game-room').emit('sendJurorHeadline', { headlineId: savedHeadline._id, headline: savedHeadline.headline });
    } catch (error) {
      console.error('Error submitting headline:', error);
      socket.emit('error', { message: 'Failed to submit headline' });
    }
  });


  socket.on('submitScore', async ({ headlineId, score }) => {
    try {
      const { headline, accepted } = await submitJurorScore(headlineId, socket.id, score);
      console.log(`Score submitted: ${score} for headline ID: ${headlineId} from socket ID: ${socket.id}`);

      if (headline && accepted) {
        io.to('game-room').emit('umpireReview', { headlineId: headline._id, headline: headline.headline });
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      socket.emit('error', { message: 'Failed to submit score' });
    }
  });


  socket.on('umpireDecision', async ({ headlineId, accepted }) => {
    try {
      await updateHeadlineAcceptance(headlineId, accepted);
      console.log(`Umpire decision for headline ID ${headlineId}: accepted=${accepted}`);
    } catch (error) {
      console.error('Error updating headline:', error);
      socket.emit('error', { message: 'Failed to update headline' });
    }
  });
  

 
};

module.exports = handleSocketConnection;