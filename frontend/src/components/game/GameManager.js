// frontend/src/components/game/GameManager.js
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';
import io from 'socket.io-client';
import socket from '../../socket';
import '../../App.css'; // Ensure correct path


const GameManager = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState('')

  useEffect(() => {
   

    socket.on('updatePlayerList', ({players}) => {
      
      setPlayers(players);
      console.log(`players from gameMan: ${JSON.stringify(players)}`);

      const currentPlayer = players.find(player => player.id === socket.id);
      console.log(currentPlayer.role)
      if (currentPlayer) {
        setRole(currentPlayer.role);
      }
      
    });

  }, );



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
