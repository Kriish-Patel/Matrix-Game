// backend/src/sockets/socketHandlers.js
const {
  addPlayerToLobby,
  assignRole,
  removePlayerFromLobby,
  getLobbyPlayers,
  getLobbyHost,
  getLobbyRoles,
  startRound,
  submitHeadline,
  submitJurorScores,
  processHeadlines,
  lobbies,
} = require('../utils/gameUtils');

const handleSocketConnection = (socket, io) => {
  console.log('New client connected');

  socket.on('joinLobby', ({ name, lobbyId }) => {
    try {
      const updatedLobby = addPlayerToLobby(lobbyId, { name, id: socket.id });
      socket.join(lobbyId);
      io.in(lobbyId).emit('updatePlayerList', {
        players: updatedLobby.players,
        count: updatedLobby.players.length,
        host: updatedLobby.host,
      });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('assignRole', ({ lobbyId, playerId, role }) => {
    const hostId = getLobbyHost(lobbyId);
    if (hostId === socket.id) {
      assignRole(lobbyId, playerId, role);
      io.in(lobbyId).emit('updateRoles', { roles: getLobbyRoles(lobbyId) });
    } else {
      socket.emit('error', 'Only the host can assign roles');
    }
  });

  socket.on('startGame', ({ lobbyId }) => {
    console.log(`startGame event received for lobby ${lobbyId}`);
    const hostId = getLobbyHost(lobbyId);
    if (hostId === socket.id) {
      const roles = getLobbyRoles(lobbyId);
      const players = getLobbyPlayers(lobbyId);
      const unassignedPlayers = players.filter(player => !roles[player.id]);
    
    if (unassignedPlayers.length > 0) {
      socket.emit('error', 'All players must have assigned roles before starting the game');
      return;
    }
      startRound(lobbyId);
      io.in(lobbyId).emit('roundStarted');
      console.log(`Round started for lobby ${lobbyId}`);
    } else {
      socket.emit('error', 'Only the host can start the game');
    }
  });

  socket.on('submitHeadline', ({ lobbyId, headline }) => {
    const playerId = socket.id;
    submitHeadline(lobbyId, playerId, headline);
    const allPlayersSubmitted = lobbies[lobbyId].headlines.length === getLobbyPlayers(lobbyId).length;
    if (allPlayersSubmitted) {
      io.in(lobbyId).emit('headlinesSubmitted', { headlines: lobbies[lobbyId].headlines });
    }
  });

  socket.on('submitJurorScores', ({ lobbyId, scores }) => {
    const jurorId = socket.id;
    submitJurorScores(lobbyId, jurorId, scores);
    const allJurorsSubmitted = Object.keys(lobbies[lobbyId].jurorScores).length === getLobbyPlayers(lobbyId).filter(player => getLobbyRoles(lobbyId)[player.id] === 'juror').length;
    if (allJurorsSubmitted) {
      processHeadlines(lobbyId);
      io.in(lobbyId).emit('headlinesProcessed', { headlines: lobbies[lobbyId].headlines });
    }
  });

  socket.on('disconnect', () => {
    for (const lobbyId in lobbies) {
      const updatedLobby = removePlayerFromLobby(lobbyId, socket.id);
      io.in(lobbyId).emit('updatePlayerList', {
        players: updatedLobby.players,
        count: updatedLobby.players.length,
        host: updatedLobby.host,
      });
    }
    console.log('Client disconnected');
  });
};

module.exports = handleSocketConnection;
