// src/components/JoinLobby.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../../socket';

const JoinLobby = () => {
  const [name, setName] = useState('');
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  
  const handleJoinLobby = () => {


    if (name && lobbyId) {
      
      socket.connect();
      socket.emit('join-lobby', { name});
      
      navigate(`/lobby/${lobbyId}`, { state: { name} });
    }
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>Join Lobby</h1>
      </div>
      <h3>Enter your name to join the lobby</h3>
      <div>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your name" 
        />
        <button onClick={handleJoinLobby}>Join Lobby</button>
      </div>
    </div>
  );
};

export default JoinLobby;

