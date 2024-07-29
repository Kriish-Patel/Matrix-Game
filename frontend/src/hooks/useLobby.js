import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../socket';

const useLobby = (name) => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [host, setHost] = useState('');
  const [hostSocketId, setHostSocketId] = useState('');
  const [actualPlayersCount, setActualPlayersCount] = useState(0);
  const [roles, setRoles] = useState({});

  useEffect(() => {
    if (!name) {
      navigate(`/join-lobby/${lobbyId}`);
      return;
    }

    socket.on('host-info', ({ hostName, hostSocketId }) => {
      setHost(hostName);
      setHostSocketId(hostSocketId);
    });

    socket.on('updatePlayerList', ({ players }) => {
      setPlayers(players);
      setPlayerCount(players.length);
      const currentPlayer = players.find(player => player.id === socket.id);
      if (currentPlayer && currentPlayer.role === 'host') {
        setHostSocketId(socket.id);
      }
    });

    socket.on('roundStarted', () => {
      const finalActualPlayerCount = players.filter(player => player.role === 'player').length;
      setActualPlayersCount(finalActualPlayerCount);
      navigate(`/game/${lobbyId}`, { state: { role: roles[socket.id], actualPlayersCount: finalActualPlayerCount } });
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

  return {
    players,
    playerCount,
    host,
    hostSocketId,
    actualPlayersCount,
    roles,
    lobbyId
    
  };
};

export default useLobby;
