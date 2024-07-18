// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/lobby/home.js';
import Lobby from './components/lobby/lobby.js';
import GameManager from './components/game/GameManager';
import JoinLobby from './components/lobby/joinLobby.js';
import SelectPlanet from './components/lobby/selectPlanet.js';
import EndGameScreen from './components/game/EndGameScreen.js'

import './styles/App.css';


function App() {

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/join-lobby/:lobbyId" element={<JoinLobby />} />
        <Route path="/select-planet/:lobbyId" element={<SelectPlanet />} />
        <Route path="/game/:lobbyId" element={<GameManager />} />
        <Route path="/endGame/:lobbyId" element={<EndGameScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
