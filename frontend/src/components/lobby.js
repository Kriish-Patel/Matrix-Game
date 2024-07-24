import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import '../App.css';
import socket from '../socket'

const Lobby = () => {

  console.log(`Component rendered from id: ${socket.id}`);

  
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [host, setHost] = useState('');
  const [hostSocketId, setHostSocketId] = useState('');

  const [name, setName] = useState(location.state ? location.state.name : '');
  const [hasJoined, setHasJoined] = useState(false);
  const [initialJoin, setInitialJoin] = useState(false);
  const [roles, setRoles] = useState({});
  
  useEffect(() => {

    // if user hasnt joined, send them to joinLobby.js
    if (!location.state || !location.state.name) {
      navigate(`/join-lobby/${lobbyId}`);
      return;
    }

    const joinLobby = (userName) => {
      if (userName && !hasJoined) {
        setHasJoined(true);
        socket.emit('jo', { name: userName});
      }
    };

    if (!initialJoin && location.state && location.state.name) {
      
      joinLobby(location.state.name);
      setInitialJoin(true);
    } else if (!initialJoin && !location.state) {
      joinLobby(name);
      setInitialJoin(true);
    }

    socket.on('host-info', ({hostName, hostSocketId}) => {
      
      setHost(hostName);
      setHostSocketId(hostSocketId);
      
    });

    socket.on('updatePlayerList', ({players}) => {
      setPlayers(players);
      setPlayerCount(players.length);
      console.log(players);
    });


    socket.on('roundStarted', () => {
      
      navigate(`/game/${lobbyId}`, { state: { role: roles[socket.id] } });
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
    socket.emit('assignRole', {playerId, role });
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === playerId ? { ...player, role} : player
      )
    );
  };

  const handleStartGame = () => {
    
    socket.emit('startGame', { lobbyId });
   
  };  

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lobby link copied to clipboard');
  };


  return (
    <div className="container">
      <div className="lobby-header">
        <h1>{host ? `${host}'s Lobby` : 'Lobby'}</h1>
        <h3 className="player-count">Player Count: {playerCount}</h3>
      </div>
      <h3>Waiting for players...</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            {player.name} ({player.role || 'No role assigned'})
            {socket.id === hostSocketId && (
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
        <button onClick={handleStartGame}>Start Game</button>
      )}
      <button onClick={copyLink}>Copy lobby link</button>
    </div>
  );
};

export default Lobby;
