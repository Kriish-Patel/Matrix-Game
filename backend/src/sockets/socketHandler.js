const {
  
  saveHeadline,
  assignHeadlineToJuror,
  processUmpireReview,
  registerJuror,
  deregisterJuror,
  processPlayerScores,
  processDiceRoll,
  assignRole,
} = require('../utils/gameUtils');

let Headline = require('../../models/headlines.model')
let Player = require('../../models/player.model');
const headlinesModel = require('../../models/headlines.model');
const players = require('../utils/Players.js')
const sessionStore = require('../../sessionStore.js')
const messageBuffers = {};
let userSessions ={};


let currentYear;
let hostSocketId = null;
let hostName = null;
// let players = {}  // {id: [name, role, hostStatus, planet]}
let acceptedHeadlines = {}


let availablePlanets = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'PlanetX'
];





const handleSocketConnection = (socket, io) => {
  userSessions[socket.sessionID] = socket.id
  console.log(`the current sessionID: ${socket.sessionID}`)

  messageBuffers[socket.sessionID] = messageBuffers[socket.sessionID] || [];

  if (messageBuffers[socket.sessionID].length > 0) {
    messageBuffers[socket.sessionID].forEach((message) => {
      socket.emit(message.event, message.data);
    });
    messageBuffers[socket.sessionID] = []; // Clear the buffer after sending
  }

  // socket.emit("session", {
  //   sessionID: socket.sessionID,
  //   userID: socket.userID,
    
  // });




  //LOBBY SOCKETS

  socket.on('create-lobby', ({name}) => {
    if (hostSocketId) 
    {
      socket.emit('error', { message: 'Lobby already created' });
      return;
    }
    // const playerData = [name, 'host', true, 'none',0];
    // players[socket.id] = playerData;
    console.log(`the host socket session ID: ${socket.sessionID}.`)
    hostSocketId = socket.sessionID;
    hostName = name;
    // const newPlayer = new Player({
    //   playerName: name,
    //   socketId: socket.id,
    //   role: 'host'
    // });
    // newPlayer.save()
    // .then((savedPlayer) => {
    //   console.log('Host created:', savedPlayer);
    //   return savedPlayer;
    // })
    // .catch((error) => {
    //   console.error('Error creating host:', error);
    // });
    
    try {
      players.addPlayer(socket.sessionID, name, 'host', true);
  } catch (error) {
      console.error('Error adding player:', error);
      // Optionally, you can add more error handling logic here, such as sending a response to the client
      // socket.emit('error', { message: 'Failed to add player' });
  }
  

    socket.join('game-room');
    const room = io.sockets.adapter.rooms.get('game-room');
    console.log(`Room 'game-room' now contains: ${JSON.stringify([...room])}, ${JSON.stringify(room)}`);
    
    // io.to('game-room').emit('host-info', { hostName: name, hostSocketId: hostSocketId });
    // io.to('game-room').emit('updatePlayerList', {
    //   players: players.getPlayersArray().map(player => ({
    //     id: player.socketId,
    //     name: player.playerName,
    //     role: player.role,
    //     isHost: player.isHost,
    //     planet: player.Planet
    //   }))
    //   // players: players.getPlayersArray()
    // });

    io.to('game-room').emit('host-info', { hostName: name, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: Object.keys(players).map(id => ({
        id,
        name: players[id][0],
        role: players[id][1],
        isHost: players[id][2],
        planet: players[id][3]
      }))
    });
  });


  socket.on('join-lobby', ({ name }) => {
    if (!hostSocketId) {
      socket.emit('error', { message: 'Lobby has not been created yet' });
      return;
    }
    // const playerData = [name, '', false, '',0];
    // players[socket.id] = playerData;
    // const newPlayer = new Player({
    //   playerName: name,
    //   socketId: socket.id
    // });
    // newPlayer.save()
    // .then((savedPlayer) => {
    //   console.log('Player created:', savedPlayer);
    //   return savedPlayer;
    // })
    // .catch((error) => {
    //   console.error('Error creating player:', error);
    // });
    if (socket.sessionID != hostSocketId){
      console.log(`adding an extra player: ${socket.sessionID}`)
      players.addPlayer(socket.sessionID, name);
    }
    // io.to('game-room').emit('host-info', { hostName: hostName, hostSocketId: hostSocketId });
    // io.to('game-room').emit('updatePlayerList', {
    //   players: players.getPlayersArray().map(player => ({
    //     id: player.socketId,
    //     name: player.playerName,
    //     role: player.role,
    //     isHost: player.isHost,
    //     planet: player.Planet
    //   }))
    //   // players: players.getPlayersArray()
    // });

    bufferOrEmitToAll('host-info', { hostName: hostName, hostSocketId: hostSocketId });
    bufferOrEmitToAll('updatePlayerList', {
        players: players.getPlayersArray().map(player => ({
            id: player.socketId,
            name: player.playerName,
            role: player.role,
            isHost: player.isHost,
            planet: player.Planet
        }))
    });

  });



  socket.on('togglePause', ({ lobbyId, isPaused }) => {
    if (socket.sessionID === hostSocketId) {
      // io.to('game-room').emit('gamePaused', { isPaused });
      bufferOrEmitToAll('gamePaused', { isPaused });
    } else {
      socket.emit('error', { message: 'Only the host can pause/resume the game' });
    }
  });

  socket.on('selectPlanet', async ({planet, playerId}) => {

    if (availablePlanets.includes(planet)) {
      availablePlanets = availablePlanets.filter((p) => p !== planet);
      // players[playerId][3] = planet
      // const player = await Player.findOne({socketId: playerId})
      // player.Planet = planet
      // player.save()
      const player = players.getPlayer(socket.sessionID);
      player.setPlanet(planet);
        
      // io.to('game-room').emit('planetSelected', planet);
      // io.to('game-room').emit('updatePlayerList', {
      //   players: players.getPlayersArray().map(player => ({
      //     id: player.socketId,
      //     name: player.playerName,
      //     role: player.role,
      //     isHost: player.isHost,
      //     planet: player.Planet
      //   }))
      //   // players: players.getPlayersArray()
      // });

      bufferOrEmitToAll('planetSelected', planet);
      bufferOrEmitToAll('updatePlayerList', {
          players: players.getPlayersArray().map(player => ({
              id: player.socketId,
              name: player.playerName,
              role: player.role,
              isHost: player.isHost,
              planet: player.Planet
          }))
      });

    }
  });

  socket.on('registerJuror', () => {
    registerJuror(socket.sessionID);
    console.log(`Juror registered: ${socket.sessionID}`);
  });

  socket.on('deregisterJuror', () => {
    deregisterJuror(socket.sessionID);
    console.log(`Juror deregistered: ${socket.sessionID}`);
  });

  socket.on('assignRole', async ({playerId, role }) => {
    if (socket.sessionID === hostSocketId) {
      // if (playerId === hostSocketId) {
      //   socket.emit('error', { message: 'Host cannot assign a role to themselves' });
      //   return;
      // }
      await assignRole(playerId, role);
      // players[playerId][1] = role;
      // io.to('game-room').emit('updatePlayerList', {
      //   players: players.getPlayersArray().map(player => ({
      //     id: player.socketId,
      //     name: player.playerName,
      //     role: player.role,
      //     isHost: player.isHost,
      //     planet: player.Planet
      //   }))

      bufferOrEmitToAll('updatePlayerList', {
        players: players.getPlayersArray().map(player => ({
            id: player.socketId,
            name: player.playerName,
            role: player.role,
            isHost: player.isHost,
            planet: player.Planet
        }))
    
        // players: players.getPlayersArray()

      });
    } else {
      socket.emit('error', { message: 'Only the host can assign roles' });
    }
  });

  socket.on('disconnect', () => {

      // notify other users
    socket.broadcast.emit("user disconnected", socket.userID);
    // update the connection status of the session
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: false,
    });

    console.log(`Client disconnected: ${socket.id}`);

    // Handle host disconnection
    if (socket.id === hostSocketId) {
      console.log(`Host disconnected: ${socket.id}`);
    }
  });



  //GAME SOCKETS

  socket.on('startGame', ({ lobbyId }) => {

    console.log(`startGame event received for lobby ${lobbyId}`);
    

    const actualPlayers = players.getPlayersArray().filter(player => player.role === 'player');
    const unassignedPlayers = players.getPlayersArray().filter(player => player.role === '');

    // io.in('game-room').emit('actualPlayersCount', {actualPlayers})
    bufferOrEmitToAll('actualPlayersCount', {actualPlayers});
  
    if (unassignedPlayers.length > 0) {
      socket.emit('error', 'All players must have assigned roles before starting the game');
      return;
    }
    // io.in('game-room').emit('roundStarted');
    bufferOrEmitToAll('roundStarted');
    
  });

  socket.on('to-game-manager', () => {
    bufferOrEmitToAll('navigate:selectPlanet');
    // io.to('game-room').emit('updatePlayerList', {
    //   players: players.getPlayersArray().map(player => ({
    //     id: player.socketId,
    //     name: player.playerName,
    //     role: player.role,
    //     isHost: player.isHost,
    //     planet: player.Planet
    //   }))
    //   // players: players.getPlayersArray()
    // });
    // io.to('game-room').emit('navigate:selectPlanet');

    // Buffer or emit the updatePlayerList event to the game-room
    bufferOrEmitToAll('updatePlayerList', {
      players: players.getPlayersArray().map(player => ({
          id: player.socketId,
          name: player.playerName,
          role: player.role,
          isHost: player.isHost,
          planet: player.Planet
      }))
    });

  // Buffer or emit the navigate:selectPlanet event to the game-room
  });
  
  socket.on('submitHeadline', async ({ socketId, headline }) => {
    try {
      const newHeadline = await saveHeadline(socketId, headline);
      console.log(`1. Headline received: ${headline}, socket ID: ${socketId}, headline id: ${newHeadline._id}`);
  
      // Buffer or emit the 'getHeadlineID' message
      bufferOrEmitMessage(socketId, 'getHeadlineID', { headlineID: newHeadline._id });
      console.log(`2. Headline ID sent to front`);
  
      // Buffer or emit the 'updatePlayerStatus' message
      bufferOrEmitMessage(socketId, 'updatePlayerStatus', { headline: newHeadline.headline, status: 'with Juror, pending' });
  
      // Assign the headline to the least-loaded juror
      assignHeadlineToJuror(newHeadline._id, newHeadline.headline, io);
  
    } catch (error) {
      console.error('Error submitting headline:', error);
  
      // Buffer or emit the 'error' message
      bufferOrEmitMessage(socketId, 'error', { message: 'Failed to submit headline' });
    }
  });
  



  socket.on('registerJuror', () => {
    registerJuror(socket.sessionID);
    console.log(`Juror registered: ${socket.sessionID}`);
  });

  socket.on('deregisterJuror', () => {
    deregisterJuror(socket.sessionID);
    console.log(`Juror deregistered: ${socket.sessionID}`);
  });

  socket.on('updateCurrentYear', ({ currentYear: year }) => {
    currentYear = year;
  });

  socket.on('submitJurorReview', async ({ headlineId, isConsistent, plausibilityScore, grammaticallyCorrect, narrativeBuilding, jurorScore, forceAccept }) => {
    try {
      const currHeadline = await Headline.findById(headlineId).populate('player');
      
      if (!currHeadline) {
        console.error(`Headline not found for ID: ${headlineId}`);
        return;
      }
  
      // Store the juror scores in the database
      currHeadline.isConsistent = isConsistent;
      currHeadline.plausibilityScore = plausibilityScore;
      currHeadline.grammaticallyCorrect = grammaticallyCorrect;
      currHeadline.narrativeBuilding = narrativeBuilding;
      currHeadline.jurorScore = jurorScore;
      currHeadline.forceAccept = forceAccept;
      
      // Save the changes to the database
      await currHeadline.save();
  
      // Find the sessionID associated with the player's socketId from the userSessions dictionary
      const playerSessionID = Object.keys(userSessions).find(key => userSessions[key] === currHeadline.player.socketId.toString());
  
      if (!playerSessionID) {
        console.error(`Player session not found for socket ID: ${currHeadline.player.socketId}`);
        return;
      }
  
      // Buffer or emit the 'sendHeadlinePlausibilityScore' message
      bufferOrEmitMessage(playerSessionID, 'sendHeadlinePlausibilityScore', { 
        plausibility: plausibilityScore, 
        headline: currHeadline.headline 
      });
  
      // Notify the player to roll the dice
      bufferOrEmitMessage(playerSessionID, 'updatePlayerStatus', { 
        headline: currHeadline.headline, 
        status: 'Roll the dice!' 
      });
  
    } catch (error) {
      console.error(`Error saving juror review for headline ID "${headlineId}":`, error);
    }
  });
  
  
  socket.on('RollDice', async ({ diceRollNumber, headlineID }) => {
    try {
      const { headline, accepted } = await processDiceRoll(headlineID, socket.sessionID, diceRollNumber);// issue with session ID because it looks for jurorbut acc gets player
      
      if (!headline) {
        console.error(`Headline not found for ID: ${headlineID}`);
        return;
      }
  
      // Find the sessionID associated with the player's socketId from the userSessions dictionary
      const playerSessionID = userSessions[headline.player.socketId.toString()];
  
      if (!playerSessionID) {
        console.error(`Player session not found for socket ID: ${headline.player.socketId}`);
        return;
      }
  
      // Check if the headline is consistent
      if (headline.isConsistent) {
        if (accepted) {
          acceptedHeadlines[headline.headline] = currentYear;
          
          // Buffer or emit the 'updatePlayerStatus' message with success status
          bufferOrEmitMessage(playerSessionID, 'updatePlayerStatus', {
            headline: headline.headline,
            status: 'success'
          });
  
          // Emit accepted headline to all players
          bufferOrEmitToAll('acceptedHeadline', {
            headline: headline.headline,
            currentYear,
            plausibility: headline.plausibility
          });
        } else {
          // Buffer or emit the 'updatePlayerStatus' message with failed status
          bufferOrEmitMessage(playerSessionID, 'updatePlayerStatus', {
            headline: headline.headline,
            status: 'failed'
          });
        }
      } else {
        // If the headline is not consistent, notify the player of failure
        bufferOrEmitMessage(playerSessionID, 'updatePlayerStatus', {
          socketId: playerSessionID,
          headlineId: headlineID,
          headline: headline.headline,
          status: 'failed'
        });
      }
  
      // Process player scores
      processPlayerScores(io, socket, headlineID, bufferOrEmitToAll);
  
    } catch (error) {
      console.error(`Error processing dice roll for headline ID "${headlineID}":`, error);
    }
  });
  
      
  socket.on('endGame', ()=>{

    const playersArray = players.getPlayersArray();

    const filteredPlayers = playersArray
      .filter(player => player.role && player.role.toLowerCase() === "player")
      .map(player => ({
        id: player.socketId,
        name: player.playerName,
        score: player.Score
      }));
    // const array = Object.keys(players)
    // .filter(id => players[id][1].toLowerCase() === "player")
    // .map(id => ({
    //   id,
    //   name: players[id][0],
    //   score: players[id][4]
    // }))
    console.log(`inside socket: ${filteredPlayers}`)
    
    // io.emit('showLeaderboard', {players: Object.keys(players)
    //   .filter(id => players[id][1].toLowerCase() === "player")
    //   .map(id => ({
    //     id,
    //     name: players[id][0],
    //     score: players[id][4],
    //     planet: players[id][3]
    //   })), acceptedHeadlines})
    // io.emit('showLeaderboard', { players: filteredPlayers, acceptedHeadlines });
    bufferOrEmitToAll('showLeaderboard', { players: filteredPlayers, acceptedHeadlines });
      
      
  //  io.to('game-room').emit('finalTimeline', {acceptedHeadlines});
    
    
    
  })

    // Helper function to buffer or emit a message
  function bufferOrEmitMessage(sessionID, event, data) {
    if (userSessions[sessionID] && io.sockets.sockets.get(userSessions[sessionID])) {

      console.log(`this message is being sent to ${userSessions[sessionID]} with this message ${JSON.stringify(event)}||||| ${JSON.stringify(data)}`)
      io.to(userSessions[sessionID]).emit(event, data);
    } else {
      messageBuffers[sessionID] = messageBuffers[sessionID] || [];
      messageBuffers[sessionID].push({ event, data });
    }
  }

  // function bufferOrEmitToRoom(room, event, data) {
  //   const clients = io.sockets.adapter.rooms.get('game-room');
  //   console.log(`players in function: ${JSON.stringify(clients)}`)
    
  //   if (clients) {
  //       clients.forEach((socketID) => {
  //           const sessionID = Object.keys(userSessions).find(key => userSessions[key] === socketID);
  //           if (sessionID) {
  //               bufferOrEmitMessage(sessionID, event, data);
  //           }
  //       });
  //   }
  // }

  function bufferOrEmitToAll(event, data) {
    Object.keys(userSessions).forEach((sessionID) => {
        bufferOrEmitMessage(sessionID, event, data);
    });
  }
}

module.exports = {
  handleSocketConnection, // Exporting the main connection handler // Exporting the helper function
};