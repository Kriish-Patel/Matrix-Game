const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { handleCreateLobby } = require('./src/controllers/gameController');
const handleSocketConnection = require('./src/sockets/socketHandler');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: "https://headlines-game-frontend.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = socketIo(server, {
  connectionStateRecovery: {maxDisconnectionDuration: 2 * 60 * 1000},
  cors: corsOptions
});

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error: ", err));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Route to create a new lobby
app.get('/create-lobby', handleCreateLobby);

io.on('connection', (socket) => {
  console.log(`Client connected, id: ${socket.id}`);
  handleSocketConnection(socket, io);
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});