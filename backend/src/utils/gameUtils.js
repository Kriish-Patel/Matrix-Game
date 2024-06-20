// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');

const lobbies = {};

const createLobby = () => {
  const lobbyId = uuidv4();
  lobbies[lobbyId] = { players: [], roles: {}, host: null };
  return lobbyId;
};

const addPlayerToLobby = (lobbyId, player) => {
  if (lobbies[lobbyId]) {
    lobbies[lobbyId].players.push(player);
    if (!lobbies[lobbyId].host) {
      lobbies[lobbyId].host = player.id;
    }
    return { players: lobbies[lobbyId].players, host: lobbies[lobbyId].host };
  }
  throw new Error('Lobby does not exist');
};

const assignRole = (lobbyId, playerId, role) => {
  if (lobbies[lobbyId]) {
    lobbies[lobbyId].roles[playerId] = role;
  }
};

const removePlayerFromLobby = (lobbyId, playerId) => {
  if (lobbies[lobbyId]) {
    lobbies[lobbyId].players = lobbies[lobbyId].players.filter(player => player.id !== playerId);
    delete lobbies[lobbyId].roles[playerId];
    if (lobbies[lobbyId].host === playerId) {
      lobbies[lobbyId].host = lobbies[lobbyId].players.length > 0 ? lobbies[lobbyId].players[0].id : null;
    }
    return { players: lobbies[lobbyId].players, host: lobbies[lobbyId].host };
  }
};

const getLobbyPlayers = (lobbyId) => {
  if (lobbies[lobbyId]) {
    return lobbies[lobbyId].players;
  }
  throw new Error('Lobby does not exist');
};

const getLobbyHost = (lobbyId) => {
  if (lobbies[lobbyId]) {
    return lobbies[lobbyId].host;
  }
  throw new Error('Lobby does not exist');
};

const getLobbyRoles = (lobbyId) => {
  if (lobbies[lobbyId]) {
    return lobbies[lobbyId].roles;
  }
  throw new Error('Lobby does not exist');
};

module.exports = {
  createLobby,
  addPlayerToLobby,
  assignRole,
  removePlayerFromLobby,
  getLobbyPlayers,
  getLobbyHost,
  getLobbyRoles,
  lobbies,
};
