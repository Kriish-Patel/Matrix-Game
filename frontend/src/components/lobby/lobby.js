import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useLobby from '../../hooks/useLobby.js'; // Adjust the import path as necessary
import '../../styles/Lobby.css';
import socket from '../../socket';

const Lobby = () => {
  console.log(`Component rendered from id: ${socket.id}`);

  const location = useLocation();
  const [name, setName] = useState(location.state ? location.state.name : '');
 
  const {
    players,
    playerCount,
    host,
    hostSocketId,
    lobbyId
  } = useLobby(name);

  const handleAssignRole = (playerId, role) => {
    if (socket.id === hostSocketId && playerId !== hostSocketId) {
      socket.emit('assignRole', { playerId, role });
    } else if (playerId === hostSocketId) {
      alert('As the host, you cannot assign a role to yourself.');
    }
  };

  const handleStartGame = () => {
    socket.emit('startGame', { lobbyId });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lobby link copied to clipboard');
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>{host ? `${host}'s Lobby` : 'Lobby'}</h1>
        <h3 className="player-count">Player Count: {playerCount}</h3>
      </div>
      <h3>Waiting for players...</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            {player.name} ({player.role || 'No role assigned'})
            {socket.id === hostSocketId && player.id !== hostSocketId && (
              <div>
                <button onClick={() => handleAssignRole(player.id, 'umpire')}>Assign Umpire</button>
                <button onClick={() => handleAssignRole(player.id, 'player')}>Assign Player</button>
                <button onClick={() => handleAssignRole(player.id, 'juror')}>Assign Juror</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {socket.id === hostSocketId && (
        <>
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={copyLink}>Copy lobby link</button>
        </>
      )}
    </div>
  );
};

export default Lobby;
