// backend/src/utils/players.js

const Player = require('../../models/player.model');

class Players {
  constructor() {
    this.players = {};
  }

  async addPlayer(socketId, name, role = null, isHost = false, planet = 'none', score = 0) {
    const player = new Player({
      playerName: name,
      socketId,
      role,
      isHost,
      planet,
      score
    });
    this.players[socketId] = player;
    await player.save();
    return player;
  }

  removePlayer(socketId) {
    delete this.players[socketId];
  }

  // async updatePlayer(socketId, updates) {
  //   if (this.players[socketId]) {
  //     Object.assign(this.players[socketId], updates);
  //     await this.players[socketId].save();
  //   }
  // }

  getPlayer(socketId) {
    return this.players[socketId];
  }

  getAllPlayers() {
    return Object.values(this.players);
  }

  getPlayersArray() {
    return Object.values(this.players).map(player => player.toObject());
  }

  getHost() {
    return Object.values(this.players).find(player => player.isHost);
  }
}

module.exports = new Players();
