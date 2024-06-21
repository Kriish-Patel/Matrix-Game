// backend/src/utils/gameUtils.js
const { v4: uuidv4 } = require('uuid');

const lobbies = {};

const createLobby = () => {
  const lobbyId = uuidv4();
  lobbies[lobbyId] = { players: [], roles: {}, host: null, gameState: 'waiting', headlines: [], jurorScores: {} };
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

const startRound = (lobbyId) => {
  if (lobbies[lobbyId]) {
    lobbies[lobbyId].gameState = 'headlineSubmission';
    lobbies[lobbyId].headlines = [];
    lobbies[lobbyId].jurorScores = {};
  }
};

const submitHeadline = (lobbyId, playerId, headline) => {
  if (lobbies[lobbyId]) {
    lobbies[lobbyId].headlines.push({ playerId, headline, status: 'pending' });
  }
};

const submitJurorScores = (lobbyId, jurorId, scores) => {
  if (lobbies[lobbyId]) {
    lobbies[lobbyId].jurorScores[jurorId] = scores;
  }
};

const calculateMedianScore = (scores) => {
  const sortedScores = scores.slice().sort((a, b) => a - b);
  const middle = Math.floor(sortedScores.length / 2);

  if (sortedScores.length % 2 === 0) {
    return (sortedScores[middle - 1] + sortedScores[middle]) / 2;
  } else {
    return sortedScores[middle];
  }
};

const processHeadlines = (lobbyId) => {
  if (lobbies[lobbyId]) {
    const { headlines, jurorScores } = lobbies[lobbyId];
    headlines.forEach(headline => {
      const scores = Object.values(jurorScores).map(juror => juror[headline.headline]);
      const medianScore = calculateMedianScore(scores);
      const diceRoll = Math.floor(Math.random() * 100) + 1;
      headline.status = diceRoll <= medianScore ? 'passed' : 'failed';
    });
  }
};

module.exports = {
  createLobby,
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
};
