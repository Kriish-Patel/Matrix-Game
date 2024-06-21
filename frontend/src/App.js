// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import Lobby from './components/lobby';
import Game from './components/game';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/game/:lobbyId" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
