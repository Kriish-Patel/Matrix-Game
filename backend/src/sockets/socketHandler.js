const {
  
  getLobbyPlayers,
  getLobbyRoles,
  submitHeadline,
  submitJurorScores,
  processHeadlines,
  lobbies,
} = require('../utils/gameUtils');

let Player = require('../../models/player.model')

let hostSocketId = null;
let hostName = null;
let players = {}  // {id: [name, role, hostStatus]}

const handleSocketConnection = (socket, io) => {


  //LOBBY SOCKETS
  socket.on('create-lobby', ({name}) => {
    if (hostSocketId) 
    {
      socket.emit('error', { message: 'Lobby already created' });
      return;
    }
    const playerData = [name, '', true];
    players[socket.id] = playerData;
    hostSocketId = socket.id;
    hostName = name;
    const newPlayer = new Player({
      playerName: name,
      playerID: socket.id
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
    const playerData = [name, '', false];
    players[socket.id] = playerData;

    socket.join('game-room'); // Join the single room
    io.to('game-room').emit('host-info', { hostName: hostName, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: Object.keys(players).map(id => ({
        id,
        name: players[id][0],
        role: players[id][1],
        isHost: players[id][2]
      }))
    });

  });

  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Handle host disconnection
    if (socket.id === hostSocketId) {
      hostSocketId = null;
      console.log(`Host disconnected: ${socket.id}`);
    }
  });

  socket.on('assignRole', ({ lobbyId, playerId, role }) => {

      players[playerId][1] = role;
      io.in(lobbyId).emit('updateRole', {newRole: role});
      
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
  });
  
  socket.on('submitHeadline', ({ socketId, headline }) => {

    console.log(`backend sent: ${headline}`);
    io.to('game-room').emit('sendJurorHeadline', {headline});

  });

  

  // socket.on('submitJurorScores', ({ lobbyId, scores }) => {
  //   const jurorId = socket.id;
  //   submitJurorScores(lobbyId, jurorId, scores);
  //   const allJurorsSubmitted = Object.keys(lobbies[lobbyId].jurorScores).length === getLobbyPlayers(lobbyId).filter(player => getLobbyRoles(lobbyId)[player.id] === 'juror').length;
  //   if (allJurorsSubmitted) {
  //     processHeadlines(lobbyId);
  //     io.in(lobbyId).emit('headlinesProcessed', { headlines: lobbies[lobbyId].headlines });
  //   }
  // });

 
};

module.exports = handleSocketConnection;