// backend/src/controllers/gameController.js
const { createLobby } = require('../utils/gameUtils');

const handleCreateLobby = (req, res) => {
  try {
    const lobbyId = createLobby();
    res.send({ lobbyId });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  handleCreateLobby,
};
