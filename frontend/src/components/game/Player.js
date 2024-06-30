// frontend/src/components/game/Player.js
import React, { useState } from 'react';

import '../../App.css'; // Ensure correct path
import socket from '../../socket'



const Player = ({ lobbyId }) => {
  const [headline, setHeadline] = useState('');

  const handleSubmit = () => {
    if (headline) {
      socket.emit('submitHeadline', { lobbyId, headline });
    }
  };

  return (
    <div className="container">
      <h2>Enter Headline</h2>
      <input 
        type="text" 
        value={headline} 
        // onChange={(e) => setHeadline(e.target.value)} 
        placeholder="Enter your headline" 
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Player;
