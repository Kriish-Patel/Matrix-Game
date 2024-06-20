// backend/src/sockets/socketHandlers.js
const {
  addPlayerToLobby,
  assignRole,
  removePlayerFromLobby,
  getLobbyPlayers,
  getLobbyHost,
  getLobbyRoles,
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
    const hostId = getLobbyHost(lobbyId);
    if (hostId === socket.id) {
      const players = getLobbyPlayers(lobbyId);
      players.forEach(player => {
        const role = getLobbyRoles(lobbyId)[player.id] || 'player';
        io.to(player.id).emit('assignRole', { role });
      });
      io.in(lobbyId).emit('gameStarted');
    } else {
      socket.emit('error', 'Only the host can start the game');
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
