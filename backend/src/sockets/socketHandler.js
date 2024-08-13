const {
  
  saveHeadline,
  submitJurorScore,
  updateHeadlineAcceptance,
  assignHeadlineToJuror,
  processUmpireReview,
  registerJuror,
  deregisterJuror,
  
  assignRole,
} = require('../utils/gameUtils');
let Headline = require('../../models/headlines.model')
let Player = require('../../models/player.model');
const headlinesModel = require('../../models/headlines.model');
const players = require('../utils/Players.js')
const sessionStore = require('../../sessionStore.js')


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

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });




  //LOBBY SOCKETS

  socket.on('create-lobby', ({name}) => {
    if (hostSocketId) 
    {
      socket.emit('error', { message: 'Lobby already created' });
      return;
    }
    // const playerData = [name, 'host', true, 'none',0];
    // players[socket.id] = playerData;
    console.log(`the host socket session ID: ${socket.sessionID}`)
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
    
    players.addPlayer(socket.sessionID, name, 'host', true);

    socket.join('game-room');
    
    io.to('game-room').emit('host-info', { hostName: name, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: players.getPlayersArray().map(player => ({
        id: player.socketId,
        name: player.playerName,
        role: player.role,
        isHost: player.isHost,
        planet: player.Planet
      }))
      // players: players.getPlayersArray()
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
    players.addPlayer(socket.sessionID, name);

    socket.join('game-room'); // Join the single room
    io.to('game-room').emit('host-info', { hostName: hostName, hostSocketId: hostSocketId });
    io.to('game-room').emit('updatePlayerList', {
      players: players.getPlayersArray().map(player => ({
        id: player.socketId,
        name: player.playerName,
        role: player.role,
        isHost: player.isHost,
        planet: player.Planet
      }))
      // players: players.getPlayersArray()
    });

  });



  socket.on('togglePause', ({ lobbyId, isPaused }) => {
    if (socket.sessionID === hostSocketId) {
      io.to('game-room').emit('gamePaused', { isPaused });
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
        
      io.to('game-room').emit('planetSelected', planet);
      io.to('game-room').emit('updatePlayerList', {
        players: players.getPlayersArray().map(player => ({
          id: player.socketId,
          name: player.playerName,
          role: player.role,
          isHost: player.isHost,
          planet: player.Planet
        }))
        // players: players.getPlayersArray()
      });
    }
  });

  socket.on('registerJuror', () => {
    registerJuror(socket.id);
    console.log(`Juror registered: ${socket.id}`);
  });

  socket.on('deregisterJuror', () => {
    deregisterJuror(socket.id);
    console.log(`Juror deregistered: ${socket.id}`);
  });

  socket.on('assignRole', async ({playerId, role }) => {
    if (socket.sessionID === hostSocketId) {
      // if (playerId === hostSocketId) {
      //   socket.emit('error', { message: 'Host cannot assign a role to themselves' });
      //   return;
      // }
      await assignRole(socket.sessionID, role);
      // players[playerId][1] = role;
      io.to('game-room').emit('updatePlayerList', {
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

    io.in('game-room').emit('actualPlayersCount', {actualPlayers})
  
    if (unassignedPlayers.length > 0) {
      socket.emit('error', 'All players must have assigned roles before starting the game');
      return;
    }
    io.in('game-room').emit('roundStarted');
    
  });

  socket.on('to-game-manager', () => {
    io.to('game-room').emit('updatePlayerList', {
      players: players.getPlayersArray().map(player => ({
        id: player.socketId,
        name: player.playerName,
        role: player.role,
        isHost: player.isHost,
        planet: player.Planet
      }))
      // players: players.getPlayersArray()
    });
    io.to('game-room').emit('navigate:selectPlanet');
  });
  
  socket.on('submitHeadline', async ({ socketId, headline }) => {
    try {
      const savedHeadline = await saveHeadline(socket.sessionID, headline);
      console.log(`Headline submitted: ${headline} from socket ID: ${socket.sessionID}`);

      // Assign the headline to a juror
      assignHeadlineToJuror(savedHeadline._id, savedHeadline.headline, io);
      socket.emit('updatePlayerStatus', { socketId: socket.sessionID, headlineId: savedHeadline._id, headline: savedHeadline.headline, status: 'with Juror, pending' })
    } catch (error) {
      console.error('Error submitting headline:', error);
      socket.emit('error', { message: 'Failed to submit headline' });
    }
  });

  socket.on('submitScore', async ({ headlineId, score }) => {
    try {
      const { headline, accepted } = await submitJurorScore(headlineId, socket.id, score);
      console.log(`Score submitted: ${score} for headline ID: ${headlineId} from Juror: ${socket.id}`);

      if (headline && accepted) {
        console.log(`user planet: ${headline.player.Planet}`)
        io.to('game-room').emit('umpireReview', { headlineId: headline._id, headline: headline.headline, planet: headline.player.Planet});

        // Emit changeStatus
        console.log(`Emitting to ${headline.player.socketId}, changeStatus with status: 'with Umpire, pending'`);
        socket.to(headline.player.socketId.toString()).emit('updatePlayerStatus', { socketId: headline.player.socketId, headlineId: headline._id, headline: headline.headline, status: 'with Umpire, pending' })
        socket.to(headline.player.socketId.toString()).emit('sendHeadlineScore', { plausibility: score, headline: headline.headline})
      }
      if (headline && !accepted) {
        // Emit changeStatus
        console.log(`Emitting changeStatus with status: 'failed'`);
        socket.to(headline.player.socketId).emit('updatePlayerStatus', { socketId: headline.player.socketId, headlineId: headline._id, headline: headline.headline, status: 'failed' })
        socket.to(headline.player.socketId.toString()).emit('sendHeadlineScore', { plausibility: score, headline: headline.headline})
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      socket.emit('error', { message: 'Failed to submit score' });
    }
  });

  socket.on('updateCurrentYear', ({ currentYear: year }) => {
    currentYear = year;
    
  });

 
  socket.on('submitUmpireReview', async ({ headlineId, isConsistent, umpireScore }) => {
    const result = await processUmpireReview(headlineId, isConsistent, umpireScore);

    if (result.success) {
      console.log(`is it consistent?: ${isConsistent}`)
      // Emit an event to notify the player of the updated score if the headline is consistent
      if (isConsistent) {
        
        acceptedHeadlines[result.headline] = currentYear;
       
        
        socket.to(result.playerId.toString()).emit('updatePlayerScore', { score: result.combinedScore});
        io.emit('updateAverageScore', {score: result.combinedScore})

        io.emit('sendPlayerCount', { playerCount: players.getPlayersArray()
          .filter(player => player.role === 'player')
          .length})
        
        // players[result.playerId][4] = result.combinedScore
        io.emit('acceptedHeadline', {headline: result.headline, currentYear, plausibility: result.plausibility})
        
        socket.to(result.playerId.toString()).emit('updatePlayerStatus', { socketId: result.playerId, headlineId, headline: result.headline, status: 'success' });
        
      }
      else {
        socket.to(result.playerId.toString()).emit('updatePlayerStatus', { socketId: result.playerId, headlineId, headline: result.headline, status: 'failed' });
      }
      console.log('Umpire review submitted and player score updated');
    } else {
      console.error('Error processing umpire review:', result.error);
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
    io.emit('showLeaderboard', { players: filteredPlayers, acceptedHeadlines });
      
      
  //  io.to('game-room').emit('finalTimeline', {acceptedHeadlines});
    
    
    
  })

};

module.exports = handleSocketConnection;