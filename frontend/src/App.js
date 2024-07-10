// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/home';
import Lobby from './components/lobby';
import GameManager from './components/game/GameManager';
import JoinLobby from './components/joinLobby';
import SelectPlanet from './components/selectPlanet';

import './App.css';


function App() {

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/join-lobby/:lobbyId" element={<JoinLobby />} />
        <Route path="/select-planet/:lobbyId" element={<SelectPlanet />} />
        <Route path="/game/:lobbyId" element={<GameManager />} />
      </Routes>
    </Router>
  );
}

export default App;
