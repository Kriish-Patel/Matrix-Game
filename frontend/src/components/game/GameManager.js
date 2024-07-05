import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';

import socket from '../../socket';
import '../../App.css'; 


const GameManager = () => {
  const { lobbyId } = useParams();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState('')

  useEffect(() => {
   
    socket.on('updatePlayerList', ({players}) => {
      
      setPlayers(players);
      // console.log(`players from gameMan: ${JSON.stringify(players)}`);
      const currentPlayer = players.find(player => player.id === socket.id);
      
      if (currentPlayer) {
        setRole(currentPlayer.role);
      }
    });
  });

  
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
