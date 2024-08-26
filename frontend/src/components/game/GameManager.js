import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';
import Host from './Host'; 
import GameTimer from './GameTimer';

import socket from '../../socket';
import '../../styles/App.css';

const GameManager = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [players, setPlayers] = useState(() => {
    const savedPlayers = sessionStorage.getItem('players');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });

  const [role, setRole] = useState(() => {
    const savedRole = sessionStorage.getItem('role');
    return savedRole || '';
  });

  const [currentPlayerName, setCurrentPlayerName] = useState(() => {
    const savedName = sessionStorage.getItem('currentPlayerName');
    return savedName || null;
  });

  const { planet, actualPlayersCount } = location.state || {};

  useEffect(() => {
    socket.on('updatePlayerList', ({ players }) => {
      setPlayers(players);
      sessionStorage.setItem('players', JSON.stringify(players));

      const currentPlayer = players.find(player => player.id === socket.sessionID);
      
      if (currentPlayer) {
        setRole(currentPlayer.role);
        setCurrentPlayerName(currentPlayer.name);
        sessionStorage.setItem('role', currentPlayer.role);
        sessionStorage.setItem('currentPlayerName', currentPlayer.name);
      }
    });
    
    socket.on('showLeaderboard', ({ players, acceptedHeadlines }) => {
      console.log(`results: ${JSON.stringify(players, null, 2)}`);
      // Redirect to LeaderBoard when game ends
      navigate(`/endGameScreen/${lobbyId}`, { state: { players, acceptedHeadlines } });
    });

    socket.on('navigate:selectPlanet', () => {
      // Navigate only players to selectPlanet.js
      if (role === 'player') {
        navigate(`/select-planet/${lobbyId}`, { state: { name: currentPlayerName, actualPlayersCount } });
      }
    });

    return () => {
      socket.off('updatePlayerList');
      socket.off('showLeaderboard');
      socket.off('navigate:selectPlanet');
    };
  }, [role, currentPlayerName, actualPlayersCount, navigate, lobbyId]);

  return (
    <div className="container">
      <div className="info-container">
        <div className="timer-container">
          <GameTimer />
        </div>
        <div className="role-container">
          <h2>Your role: {role}</h2>
        </div>
        {role === 'player' && (
          <div className="player-planet-container">
            <h2>Your planet: {planet}</h2>
          </div>
        )}
      </div>

      {role === 'player' && <Player lobbyId={lobbyId} planet={planet} />}
      {role === 'juror' && <Juror lobbyId={lobbyId} />}
      {role === 'umpire' && <Umpire lobbyId={lobbyId} />}
      {role === 'host' && <Host lobbyId={lobbyId} />}
    </div>
  );
};

export default GameManager;
