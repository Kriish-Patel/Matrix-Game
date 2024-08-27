// frontend/src/components/Home.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../../socket';

const Home = () => {
  const [name, setName] = useState('');

  
  const navigate = useNavigate();
  

  const createLobby = async () => {
    try {
      

      socket.connect(); // Connect the socket when creating a lobby
  
      socket.emit('create-lobby', {name}); // Emit create-lobby event to the server

          // Retrieve the session ID from localStorage and connect

      const response = await axios.get('https://headlines-game.onrender.com/create-lobby'); // Backend URL
     
      const { lobbyId } = response.data;
     
      
      navigate(`/lobby/${lobbyId}`, { state: { name } });
      
    } catch (error) {
      console.error('Error creating lobby:', error);
    }
  };

 
  return (
    <div>
      <h1>Welcome to whom the gods must destroy, they first make mad!</h1>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter your name" 
      />
      <button onClick={createLobby}>Create Lobby</button>
    </div>
  );
};

export default Home;
