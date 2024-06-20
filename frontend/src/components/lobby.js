// frontend/src/components/Lobby.js
import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [host, setHost] = useState(null);
  const [name, setName] = useState(location.state ? location.state.name : '');
  const [hasJoined, setHasJoined] = useState(false);
  const [initialJoin, setInitialJoin] = useState(false);
  const [role, setRole] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roles, setRoles] = useState({});

  useEffect(() => {
    console.log('useEffect: lobbyId or name changed', { lobbyId, name, hasJoined });

    const joinLobby = (userName) => {
      console.log('joinLobby called', { userName, lobbyId, hasJoined });
      if (userName && !hasJoined) {
        socket.emit('joinLobby', { name: userName, lobbyId });
        setHasJoined(true);
        console.log('joinLobby emitted', { userName, lobbyId });
      }
    };

    if (!initialJoin && location.state && location.state.name) {
      joinLobby(location.state.name);
      setInitialJoin(true);
    }

    socket.on('updatePlayerList', ({ players, count, host }) => {
      console.log('updatePlayerList event received', players);
      setPlayers(players);
      setPlayerCount(count);
      setHost(host);
    });

    socket.on('updateRoles', ({ roles }) => {
      console.log('updateRoles event received', roles);
      setRoles(roles);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('assignRole', ({ role }) => {
      setRole(role);
      console.log(`Role assigned: ${role}`);
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('updatePlayerList');
      socket.off('updateRoles');
      socket.off('gameStarted');
      socket.off('assignRole');
      socket.off('error');
    };
  }, [location.state, lobbyId, hasJoined, initialJoin, name]);

  const handleJoinLobby = () => {
    console.log('handleJoinLobby called', { name });
    if (name && !hasJoined) {
      socket.emit('joinLobby', { name, lobbyId });
      setHasJoined(true);
    }
  };

  const handleAssignRole = (playerId, role) => {
    console.log('handleAssignRole called', { playerId, role });
    socket.emit('assignRole', { lobbyId, playerId, role });
  };

  const handleStartGame = () => {
    console.log('handleStartGame called');
    socket.emit('startGame', { lobbyId });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lobby link copied to clipboard');
  };

  return (
    <div>
      <h1>Lobby: {lobbyId}</h1>
      {!hasJoined && (
        <div>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your name" 
          />
          <button onClick={handleJoinLobby}>Join Lobby</button>
        </div>
      )}
      <h3>Waiting for players... (Current Count: {playerCount})</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            {player.name} ({roles[player.id] || 'No role assigned'})
            {socket.id === host && (
              <div>
                <button onClick={() => handleAssignRole(player.id, 'umpire')}>Assign Umpire</button>
                <button onClick={() => handleAssignRole(player.id, 'player')}>Assign Player</button>
                <button onClick={() => handleAssignRole(player.id, 'juror')}>Assign Juror</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {socket.id === host && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      <button onClick={copyLink}>Copy lobby link</button>
      {gameStarted && role && (
        <h2>{`You are a ${role}`}</h2>
      )}
    </div>
  );
};

export default Lobby;
