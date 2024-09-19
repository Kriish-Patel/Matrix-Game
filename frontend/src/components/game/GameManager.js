import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import Player from './Player/Player';
import Juror from './Juror';

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

  const [acceptedHeadlines, setAcceptedHeadlines] = useState(() => {
    const storedHeadlines = sessionStorage.getItem('acceptedHeadlines');
    return storedHeadlines
      ? JSON.parse(storedHeadlines)
      : [
          { headline: 'Driverless Taxi trial blamed for spike in road deaths', currentYear: 2025, plausibility: 60 },
          { headline: 'AI Curator debuts exhibition at Venice Biennale', currentYear: 2025, plausibility: 80 },
          { headline: 'AI improves weather forecasting accuracy from 90% to 93%', currentYear: 2025, plausibility: 70 },
          { headline: 'AI eSports tournaments are the new Formula 1', currentYear: 2025, plausibility: 75 },
          { headline: 'Rishi Sunak appointed chair of UK AI Ethics Board', currentYear: 2025, plausibility: 85 },
          { headline: 'AI Healthcare Insurance Advisor reduces costs by 20%', currentYear: 2025, plausibility: 75 },
          { headline: 'Century-old Maths Problem solved by AI with ‘elegant proof', currentYear: 2025, plausibility: 30 },
          { headline: 'AI Composer’s Symphony premieres at Carnegie Hall', currentYear: 2025, plausibility: 95 },
          { headline: 'Stock Market ‘flash crash’ averted by AI monitoring', currentYear: 2025, plausibility: 88 }
        ];
  });

  useEffect(() => {

    socket.on('acceptedHeadline', ({ headline, currentYear, plausibility }) => {
      setAcceptedHeadlines(prevHeadlines => {
        const updatedHeadlines = [{ headline, currentYear, plausibility }, ...prevHeadlines];
    
        // Save the updated headlines to sessionStorage
        sessionStorage.setItem('acceptedHeadlines', JSON.stringify(updatedHeadlines));
    
        return updatedHeadlines;
      });
    });
   
    socket.on('updatePlayerList', ({players}) => {
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
    
    socket.on('showLeaderboard', ({ players}) => {
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
      socket.off('acceptedHeadline');
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

      {role === 'player' && <Player planet={planet} acceptedHeadlines = {acceptedHeadlines} />}
      {role === 'juror' && <Juror acceptedHeadlines = {acceptedHeadlines} />}
      {/* {role === 'umpire' && <Umpire acceptedHeadlines = {acceptedHeadlines} />} */}
      {role === 'host' && <Host lobbyId = {lobbyId} acceptedHeadlines = {acceptedHeadlines} />}
    </div>
  );
};

export default GameManager;
