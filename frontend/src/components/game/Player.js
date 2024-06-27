// frontend/src/components/game/Player.js
import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

const Player = ({ lobbyId }) => {
  const [headline, setHeadline] = useState('');

  const submitHeadline = () => {
    socket.emit('submitHeadline', { lobbyId, headline });
  };

  return (
    <div>
      <h2>Submit Your Headline</h2>
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
