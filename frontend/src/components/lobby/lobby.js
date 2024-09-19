import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useLobby from '../../hooks/useLobby.js'; // Adjust the import path as necessary
import '../../styles/Lobby.css';
import socket from '../../socket';

const Lobby = () => {
  console.log(`Component rendered from id: ${socket.id}`);

  const location = useLocation();
  
  // Retrieve name from sessionStorage if available, otherwise use location state
  const [name, setName] = useState(() => sessionStorage.getItem('name') || (location.state ? location.state.name : ''));

  // Save name to sessionStorage whenever it changes
  useEffect(() => {
    if (name) {
      sessionStorage.setItem('name', name);
    }
  }, [name]);

  const {
    players,
    playerCount,
    host,
    hostSocketId,
    lobbyId,
    mySessionId,
    setHost,
    setPlayers,
    setPlayerCount,
    setHostSocketId,
    setLobbyId,
    setMySessionId
  } = useLobby(name);

  // Store host, players, playerCount, hostSocketId, and lobbyId in sessionStorage for persistence
  useEffect(() => {
    if (host) sessionStorage.setItem('host', host);
    if (players.length > 0) sessionStorage.setItem('players', JSON.stringify(players));
    if (playerCount) sessionStorage.setItem('playerCount', playerCount);
    if (hostSocketId) sessionStorage.setItem('hostSocketId', hostSocketId);
    if (lobbyId) sessionStorage.setItem('lobbyId', lobbyId);
    if (mySessionId) sessionStorage.setItem('sessionID',mySessionId)
  }, [host, players, playerCount, hostSocketId, lobbyId,mySessionId]);

  // Retrieve data from sessionStorage in case of reload
  useEffect(() => {
    const savedHost = sessionStorage.getItem('host');
    const savedPlayers = JSON.parse(sessionStorage.getItem('players')) || [];
    const savedPlayerCount = sessionStorage.getItem('playerCount');
    const savedHostSocketId = sessionStorage.getItem('hostSocketId');
    const savedLobbyId = sessionStorage.getItem('lobbyId');
    const savedMySessionId = sessionStorage.getItem('sessionID')
    
    if (savedMySessionId){
      setMySessionId(savedMySessionId)
    }

    if (savedHost) {
      setHost(savedHost);
    }

    if (savedPlayers.length > 0) {
      setPlayers(savedPlayers);
    }

    if (savedPlayerCount) {
      setPlayerCount(Number(savedPlayerCount));
    }

    if (savedHostSocketId) {
      setHostSocketId(savedHostSocketId);
    }

    if (savedLobbyId) {
      setLobbyId(savedLobbyId);
    }
  }, [mySessionId]);

  const handleAssignRole = (playerId, role) => {
    if (mySessionId=== hostSocketId && playerId !== hostSocketId) {
      console.log(`player ID is: ${playerId}`)
      socket.emit('assignRole', { playerId: playerId , role:role });
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
            {mySessionId === hostSocketId && player.id !== hostSocketId && (
              <div>
                <button onClick={() => handleAssignRole(player.id, 'player')}>Assign Player</button>
                <button onClick={() => handleAssignRole(player.id, 'juror')}>Assign Juror</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {mySessionId === hostSocketId && (
        <>
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={copyLink}>Copy lobby link</button>
        </>
      )}
    </div>
  );
};

export default Lobby;

