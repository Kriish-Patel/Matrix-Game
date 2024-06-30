// frontend/src/components/game/Player.js
import React, { useState } from 'react';

import '../../App.css'; // Ensure correct path
import socket from '../../socket'



const Player = () => {
  const [headline, setHeadline] = useState('');

  const submitHeadline = () => {
    socket.emit('submitHeadline', {headline});
  };

  return (
    <div className="container">
      <h2>Enter Headline</h2>
      <input 
        type="text" 
        value={headline} 
        onChange={(e) => setHeadline(e.target.value)} 
        placeholder="Enter your headline" 
      />
      <button onClick={submitHeadline}>Submit</button>
    </div>
  );
};

export default Player;
