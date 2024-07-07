const {
  
  getLobbyPlayers,
  saveHeadline,
  submitJurorScore,
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
    const playerData = [name, '', false];
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
      await submitJurorScore(headlineId, socket.id, score);
      console.log(`Score submitted: ${score} for headline ID: ${headlineId} from socket ID: ${socket.id}`);
    } catch (error) {
      console.error('Error submitting score:', error);
      socket.emit('error', { message: 'Failed to submit score' });
    }
  });

  // socket.on('assignRole', async ({ socketId, role }) => {
  //   try {
  //     const updatedPlayer = await assignRole(socketId, role);
  //     console.log(`Role ${role} assigned to player with socket ID: ${socketId}`);

  //     // io.to('game-room').emit('roleAssigned', { socketId, role });
  //   } catch (error) {
  //     console.error('Error assigning role:', error);
  //     socket.emit('error', { message: 'Failed to assign role' });
  //   }
  // });

  

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