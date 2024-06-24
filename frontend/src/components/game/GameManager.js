// frontend/src/components/game/GameManager.js
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';
import io from 'socket.io-client';
import '../../App.css'; // Ensure correct path

const socket = io('http://localhost:5001');

const GameManager = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [role, setRole] = useState(location.state ? location.state.role : '');

  useEffect(() => {
    socket.on('roundStarted', () => {
      setRole(location.state.role);
    });
  }, [location.state.role]);

  if (!role) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Game: {lobbyId}</h1>
      <h2>Your role: {role}</h2>
      {role === 'player' && <Player lobbyId={lobbyId} />}
      {role === 'juror' && <Juror lobbyId={lobbyId} />}
      {role === 'umpire' && <Umpire lobbyId={lobbyId} />}
    </div>
  );
};

export default GameManager;
