// backend/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleCreateLobby } = require('./src/controllers/gameController');
const {handleSocketConnection} = require('./src/sockets/socketHandler');
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const sessionStore = require('./sessionStore.js')

// const corsOptions = {
//   connectionStateRecovery: {maxDisconnectionDuration: 2 * 60 * 1000},
//   origin: "https://headlines-game-frontend.onrender.com",
//   methods: ["GET", "POST"],
//   credentials: true
// };



const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  connectionStateRecovery: {maxDisconnectionDuration: 2 * 60 * 1000},
  cors: {
    origin: "http://localhost:3000", // Allow the frontend URL
    methods: ["GET", "POST"]
  }
});

// const io = socketIo(server, {
//   connectionStateRecovery: {maxDisconnectionDuration: 2 * 60 * 1000},
//   cors: corsOptions
// });
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

/const uri = "mongodb+srv://zcabaak:TEgYhDg7cQ0zX5WK@headline-game.8ctvsgm.mongodb.net/?retryWrites=true&w=majority&appName=Headline-Game"   //process.env.ATLAS_URI;
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open',() => {
  console.log("Mongoose connected");
})

// Catch-all route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  console.log(`sessionID in the auth thing: ${socket.handshake.auth.sessionID}`)
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    console.log(`tf is up with this session: ${session}`)
    if (session) {
      console.log('found a session')
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      return next();
    }
  }
  // create new session
  socket.sessionID = uuidv4();
  socket.userID = uuidv4();
  next();
});


// Route to create a new lobby
app.get('/create-lobby', handleCreateLobby);

io.on('connection', (socket) => {

  socket.join('game-room');

  console.log(`Client connected, id: ${socket.id}`);


  handleSocketConnection(socket, io);
});


  

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
