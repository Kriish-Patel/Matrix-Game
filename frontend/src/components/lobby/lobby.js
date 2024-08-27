import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import '../../styles/Lobby.css';
import socket from '../../socket';

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [players, setPlayers] = useState(() => {
    const savedPlayers = sessionStorage.getItem('players');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });
  const [playerCount, setPlayerCount] = useState(() =>{
    const savedPlayerCount = sessionStorage.getItem('playerCount');
    return savedPlayerCount ? savedPlayerCount : 0;
  });
  const [host, setHost] = useState(() =>{
    const savedHost = sessionStorage.getItem('host');
    return savedHost ? savedHost : '';
  });
  const [hostSocketId, setHostSocketId] = useState(() =>{
    const savedHostSocketId = sessionStorage.getItem('hostSocketId');
    return savedHostSocketId ? savedHostSocketId : '';
  });
  const [mySessionId, setMySessionId] = useState(() => {
    const savedSessionId = sessionStorage.getItem('sessionID');
    console.log("Initial mySessionId from sessionStorage:", savedSessionId);
    return savedSessionId || undefined;
  });
  const [name, setName] = useState(location.state ? location.state.name : '');
  const [actualPlayersCount, setActualPlayersCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(() => {
    const savedHasJoined = sessionStorage.getItem('hasJoined');
    return savedHasJoined ? savedHasJoined : false;
  })
  const [initialJoin, setInitialJoin] = useState(() => {
    const savedHasInitialJoined = sessionStorage.getItem('hasJoined');
    return savedHasInitialJoined ? savedHasInitialJoined : false;
  })
  const [roles, setRoles] = useState({});

  useEffect(() => {
      socket.on('session', ({ sessionID, userID }) => {
        console.log("waterfall")
        console.log(`session socket received, sessionID: ${sessionID}`)
        // Attach the session ID to the next reconnection attempts
        socket.auth = { sessionID };
        // Store it in the sessionStorage
        sessionStorage.setItem('sessionID', sessionID);
        // Save the ID of the user
        socket.sessionID = sessionID;
      });
      const sessionID = sessionStorage.getItem('sessionID');
      console.log(`sessionID before reconnection ${sessionID}`);
      if (sessionID) {
        socket.auth = { sessionID };
        socket.connect();
        console.log(`sessionID and we have reconnected: ${sessionID}`);
      }

    const savedSessionId = sessionStorage.getItem('sessionID');
    if (savedSessionId && !mySessionId) {
      console.log("Updating mySessionId from sessionStorage:", savedSessionId);
      setMySessionId(savedSessionId);
    }
    console.log("mySessionId after initial render:", mySessionId);
    console.log(`this is the sessionID: ${socket.sessionID}`)
    

    // mySessionId = socket.sessionID

    if (!location.state || !location.state.name) {
      navigate(`/join-lobby/${lobbyId}`);
      return;
    }

    const joinLobby = (userName) => {
      if (userName && !hasJoined) {
        setHasJoined(true);
        sessionStorage.setItem('hasJoined', true)
        socket.emit('join-lobby', { name: userName });
      }
    };

    if (!initialJoin && location.state.name) {
      joinLobby(location.state.name);
      setInitialJoin(true);
      sessionStorage.setItem('hasInitialJoined', true)
    } else if (!initialJoin && !location.state) {
      joinLobby(name);
      setInitialJoin(true);
      sessionStorage.setItem('hasInitialJoined', true)
    }
    

    socket.on('host-info', ({ hostName, hostSocketId }) => {
      setHost(hostName);
      setHostSocketId(hostSocketId);
      sessionStorage.setItem('host', hostName);
      sessionStorage.setItem('hostSocketId', hostSocketId);

    });

    socket.on('updatePlayerList', ({ players }) => {
      setPlayers(players);
      setPlayerCount(players.length);
      sessionStorage.setItem('players', JSON.stringify(players));
      sessionStorage.setItem('playerCount', players.length);
      const currentPlayer = players.find(player => player.id === mySessionId);
      console.log(`lets see if sessionID shows on front end: ${mySessionId}`)
      if (currentPlayer && currentPlayer.role === 'host') {
        console.log("host has been set")
        setHostSocketId(mySessionId);
      }
    });

    socket.on('roundStarted', () => {
      const finalActualPlayerCount = players.filter(player => player.role === 'player').length;
      setActualPlayersCount(finalActualPlayerCount);
      console.log("This is inside roundStarted")
      console.log(`socket.sessionID: ${mySessionId}`)
      console.log(`roles dictionary: ${JSON.stringify(roles)}`)
      console.log(`specific role thingy: ${roles[mySessionId]}`)
      console.log(`finalActualPlayerCount: ${finalActualPlayerCount}`)
      navigate(`/game/${lobbyId}`, { state: { role: roles[mySessionId], actualPlayersCount: finalActualPlayerCount } });
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
  }, [location.state, lobbyId, hasJoined, initialJoin, name, roles, navigate, players, mySessionId]);

  const handleAssignRole = (playerId, role) => {
    if (mySessionId === hostSocketId && playerId !== hostSocketId) {
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
            {mySessionId === hostSocketId && player.id !== hostSocketId && (
              <div>
                <button onClick={() => handleAssignRole(player.id, 'umpire')}>Assign Umpire</button>
                <button onClick={() => handleAssignRole(player.id, 'player')}>Assign Player</button>
                <button onClick={() => handleAssignRole(player.id, 'juror')}>Assign Juror</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {mySessionId === hostSocketId && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {mySessionId === hostSocketId && (
        <button onClick={copyLink}>Copy lobby link</button>
      )}
    </div>
  );
};

export default Lobby;
