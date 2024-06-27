import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../App.css';

const socket = io('http://localhost:5001');

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [host, setHost] = useState(null);
  const [name, setName] = useState(location.state ? location.state.name : '');
  const [hasJoined, setHasJoined] = useState(false);
  const [initialJoin, setInitialJoin] = useState(false);
  const [roles, setRoles] = useState({});

  useEffect(() => {
    const joinLobby = (userName) => {
      if (userName && !hasJoined) {
        socket.emit('joinLobby', { name: userName, lobbyId });
        setHasJoined(true);
      }
    };

    if (!initialJoin && location.state && location.state.name) {
      joinLobby(location.state.name);
      setInitialJoin(true);
    } else if (!initialJoin && !location.state) {
      joinLobby(name);
      setInitialJoin(true);
    }

    socket.on('updatePlayerList', ({ players, count, host }) => {
      setPlayers(players);
      setPlayerCount(count);
      setHost(host);
      players.forEach(player => {
        console.log(`Player ${player.name} is in the lobby with role ${roles[player.id] || 'No role assigned'}`);
      });
    });

    socket.on('updateRoles', ({ roles }) => {
      setRoles(roles);
      const player = players.find(player => player.id === socket.id);
      if (player) {
        console.log(`${player.name} was assigned the role of ${roles[socket.id]}`);
      }
    });

    socket.on('roundStarted', ({ roles }) => {
      if (roles) {
        const userRole = roles[socket.id];
        navigate(`/game/${lobbyId}`, { state: { role: userRole } });
      } else {
        console.error('Roles are undefined');
      }
    });

    socket.on('assignRole', ({ role }) => {
      console.log(`Role assigned: ${role}`);
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('updatePlayerList');
      socket.off('updateRoles');
      socket.off('roundStarted');
      socket.off('assignRole');
      socket.off('error');
    };
  }, [location.state, lobbyId, hasJoined, initialJoin, name, roles, navigate]);

  const handleJoinLobby = () => {
    if (name && !hasJoined) {
      socket.emit('joinLobby', { name, lobbyId });
      setHasJoined(true);
    }
  };

  const handleAssignRole = (playerId, role) => {
    socket.emit('assignRole', { lobbyId, playerId, role });
  };

  const handleStartGame = () => {
    socket.emit('startGame', { lobbyId });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lobby link copied to clipboard');
  };

  const hostName = players.find(player => player.id === host)?.name || '';

  return (
    <div className="container">
      <div className="lobby-header">
        <h1>{hostName ? `${hostName}'s Lobby` : 'Lobby'}</h1>
        <h3 className="player-count">Player Count: {playerCount}</h3>
      </div>
      <h3>Waiting for players...</h3>
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
    </div>
  );
};

export default Lobby;
