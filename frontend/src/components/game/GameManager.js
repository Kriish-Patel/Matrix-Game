import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';
import Host from './Host'; 

import socket from '../../socket';
import '../../styles/App.css';


const GameManager = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState('')
  const [currentPlayerName, setCurrentPlayerName] = useState(null);
  const { planet, actualPlayersCount } = location.state
  
  const navigate = useNavigate();

  useEffect(() => {
   
    socket.on('updatePlayerList', ({players}) => {
      setPlayers(players);
      
      const currentPlayer = players.find(player => player.id === socket.id);
      
      if (currentPlayer) {
        setRole(currentPlayer.role);
        setCurrentPlayerName(currentPlayer.name)
      }
    });

    socket.on('navigate:selectPlanet', () => {
      //navigate only players to selectPlanet.js
      if (role === 'player'){
      navigate(`/select-planet/${lobbyId}`, { state: { name: currentPlayerName, actualPlayersCount} });
      }
    });
  });

  return (
    <div className="container">
      <h1>Game: {lobbyId}</h1>
      <h2>Your role: {role}</h2>
      {role === 'player' && <Player lobbyId={lobbyId} planet={planet} />}
      {role === 'juror' && <Juror lobbyId={lobbyId} />}
      {role === 'umpire' && <Umpire lobbyId={lobbyId} />}
      {role === 'host' && <Host lobbyId={lobbyId} />}
    </div>
  );
};

export default GameManager;
