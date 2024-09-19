import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../socket';

const useLobby = (name) => {
  const { lobbyId: routeLobbyId } = useParams();
  const navigate = useNavigate();

  // Initialize states from sessionStorage or default values
  const [lobbyId, setLobbyId] = useState(() => sessionStorage.getItem('lobbyId') || routeLobbyId);
  const [players, setPlayers] = useState(() => JSON.parse(sessionStorage.getItem('players')) || []);
  const [playerCount, setPlayerCount] = useState(() => Number(sessionStorage.getItem('playerCount')) || 0);
  const [host, setHost] = useState(() => sessionStorage.getItem('host') || '');
  const [hostSocketId, setHostSocketId] = useState(() => sessionStorage.getItem('hostSocketId') || '');
  const [actualPlayersCount, setActualPlayersCount] = useState(() => Number(sessionStorage.getItem('actualPlayersCount')) || 0);
  const [roles, setRoles] = useState(() => JSON.parse(sessionStorage.getItem('roles')) || {});
  const [mySessionId, setMySessionId] = useState(() => {
    const savedSessionId = sessionStorage.getItem('sessionID');
    console.log("Initial mySessionId from sessionStorage:", savedSessionId);
    return savedSessionId || undefined;
  });

  useEffect(() => {
    console.log(`this is the useLobby socket ID${socket.id}`)
    if (!name) {
      navigate(`/join-lobby/${lobbyId}`);
      return;
    }

    socket.on('host-info', ({ hostName, hostSocketId }) => {
      setHost(hostName);
      setHostSocketId(hostSocketId);
      sessionStorage.setItem('host', hostName);
      sessionStorage.setItem('hostSocketId', hostSocketId);
      console.log('host-info is being called')
    });

    socket.on('updatePlayerList', ({ players }) => {
      setPlayers(players);
      setPlayerCount(players.length);
      sessionStorage.setItem('players', JSON.stringify(players));
      sessionStorage.setItem('playerCount', players.length);

      const currentPlayer = players.find(player => player.id === mySessionId);
      if (currentPlayer && currentPlayer.role === 'host') {
        setHostSocketId(mySessionId);
        sessionStorage.setItem('hostSocketId', mySessionId);
      }
    });

    socket.on('roundStarted', () => {
      const finalActualPlayerCount = players.filter(player => player.role === 'player').length;
      setActualPlayersCount(finalActualPlayerCount);
      sessionStorage.setItem('actualPlayersCount', finalActualPlayerCount);
      
      navigate(`/game/${lobbyId}`, {
        state: { role: roles[mySessionId], actualPlayersCount: finalActualPlayerCount },
      });
      socket.emit('to-game-manager');
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('host-info');
      socket.off('updatePlayerList');
      socket.off('roundStarted');
      socket.off('error');
    };
  }, [name, lobbyId, navigate, players, roles]);

  // Update roles state and save it in sessionStorage
  useEffect(() => {
    sessionStorage.setItem('roles', JSON.stringify(roles));
    if (lobbyId) sessionStorage.setItem('lobbyId', lobbyId);
  }, [roles]);

  return {
    players,
    playerCount,
    host,
    hostSocketId,
    actualPlayersCount,
    roles,
    lobbyId,
    mySessionId,
    setHost,
    setPlayers,
    setPlayerCount,
    setHostSocketId,
    setLobbyId,
    setMySessionId
  };
};

export default useLobby;
