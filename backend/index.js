// backend/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleCreateLobby } = require('./src/controllers/gameController');
const handleSocketConnection = require('./src/sockets/socketHandler');
const mongoose = require('mongoose')
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow the frontend URL
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
// mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open',() => {
  console.log("Mongoose connected");
})

// Route to create a new lobby
app.get('/create-lobby', handleCreateLobby);



io.on('connection', (socket) => {

  console.log(`Client connected, id: ${socket.id}`);

  
  handleSocketConnection(socket, io);
});
  
  


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
