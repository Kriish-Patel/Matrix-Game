import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import SelectPlanet from '../selectPlanet';
import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';

import socket from '../../socket';
import '../../App.css'; 


const GameManager = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState('')
  const [currentPlayerName, setCurrentPlayerName] = useState(null);
  const [currentPlayerPlanet, setCurrentPlayerPlanet] = useState(null);
  const { planet } = location.state
  const navigate = useNavigate();

  useEffect(() => {
   
    socket.on('updatePlayerList', ({players}) => {
      setPlayers(players);
      // console.log(`players from gameMan: ${JSON.stringify(players)}`);
      const currentPlayer = players.find(player => player.id === socket.id);
      
      if (currentPlayer) {
        setRole(currentPlayer.role);
        setCurrentPlayerName(currentPlayer.name)
      }
    });

    socket.on('navigate:selectPlanet', () => {
      //navigate only players to selectPlanet.js
      if (role === 'player'){
      navigate(`/select-planet/${lobbyId}`, { state: { name: currentPlayerName} });
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
    </div>
  );
};

export default GameManager;
