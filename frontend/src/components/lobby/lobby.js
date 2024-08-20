import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import '../../styles/Lobby.css';
import socket from '../../socket';

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('players');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });
  const [playerCount, setPlayerCount] = useState(0);
  const [host, setHost] = useState('');
  const [hostSocketId, setHostSocketId] = useState('');
  const [name, setName] = useState(location.state ? location.state.name : '');
  const [actualPlayersCount, setActualPlayersCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [initialJoin, setInitialJoin] = useState(false);
  const [roles, setRoles] = useState({});

  useEffect(() => {
    const sessionID = localStorage.getItem('sessionID');
    if (sessionID) {
      socket.auth = { sessionID };
      socket.connect();
      console.log(`sessionID and we have reconnected: ${sessionID}`);
    }

    if (!location.state || !location.state.name) {
      navigate(`/join-lobby/${lobbyId}`);
      return;
    }

    const joinLobby = (userName) => {
      if (userName && !hasJoined) {
        setHasJoined(true);
        socket.emit('join-lobby', { name: userName });
      }
    };

    if (!initialJoin && location.state && location.state.name) {
      joinLobby(location.state.name);
      setInitialJoin(true);
    } else if (!initialJoin && !location.state) {
      joinLobby(name);
      setInitialJoin(true);
    }

    socket.on('host-info', ({ hostName, hostSocketId }) => {
      setHost(hostName);
      setHostSocketId(hostSocketId);
    });

    socket.on('updatePlayerList', ({ players }) => {
      setPlayers(players);
      setPlayerCount(players.length);
      localStorage.setItem('players', JSON.stringify(players));
      const currentPlayer = players.find(player => player.id === socket.sessionID);
      console.log(`lets see if sessionID shows on front end: ${socket.sessionID}`)
      if (currentPlayer && currentPlayer.role === 'host') {
        console.log("host has been set")
        setHostSocketId(socket.sessionID);
      }
    });

    socket.on('roundStarted', () => {
      const finalActualPlayerCount = players.filter(player => player.role === 'player').length;
      setActualPlayersCount(finalActualPlayerCount);
      navigate(`/game/${lobbyId}`, { state: { role: roles[socket.sessionID], actualPlayersCount: finalActualPlayerCount } });
      socket.emit('to-game-manager');
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
  }, [location.state, lobbyId, hasJoined, initialJoin, name, roles, navigate, players]);

  const handleAssignRole = (playerId, role) => {
    if (socket.sessionID === hostSocketId && playerId !== hostSocketId) {
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
            {socket.sessionID === hostSocketId && player.id !== hostSocketId && (
              <div>
                <button onClick={() => handleAssignRole(player.id, 'umpire')}>Assign Umpire</button>
                <button onClick={() => handleAssignRole(player.id, 'player')}>Assign Player</button>
                <button onClick={() => handleAssignRole(player.id, 'juror')}>Assign Juror</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {socket.sessionID === hostSocketId && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {socket.sessionID === hostSocketId && (
        <button onClick={copyLink}>Copy lobby link</button>
      )}
    </div>
  );
};

export default Lobby;
