// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import Home from './components/lobby/home.js';
import Lobby from './components/lobby/lobby.js';
import GameManager from './components/game/GameManager';
import JoinLobby from './components/lobby/joinLobby.js';
import SelectPlanet from './components/lobby/selectPlanet.js';
import EndGameScreen from './components/game/EndGameScreen.js'
import socket from './socket';

import './styles/App.css';

function App() {

  useEffect(() => {
    socket.on('session', ({ sessionID, userID }) => {
      console.log("waterfall")
      console.log(`session socket received, sessionID: ${sessionID}`)
      // Attach the session ID to the next reconnection attempts
      socket.auth = { sessionID };
      // Store it in the localStorage
      localStorage.setItem('sessionID', sessionID);
      // Save the ID of the user
      socket.sessionID = sessionID;
    });
    const sessionID = localStorage.getItem('sessionID');
    console.log(`sessionID before reconnection ${sessionID}`);
    if (sessionID) {
      socket.auth = { sessionID };
      socket.connect();
      console.log(`sessionID and we have reconnected: ${sessionID}`);
    }
    else{
      console.log('arbonara')
      socket.connect();
    }
  }, []); // Empty dependency array ensures this runs only once when the app starts





  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/join-lobby/:lobbyId" element={<JoinLobby />} />
        <Route path="/select-planet/:lobbyId" element={<SelectPlanet />} />
        <Route path="/game/:lobbyId" element={<GameManager />} />
        <Route path="/endGameScreen/:lobbyId" element={<EndGameScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
