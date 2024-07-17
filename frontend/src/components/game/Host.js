// frontend/src/components/game/Host.js
import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Host = ({ lobbyId }) => {
  const [isPaused, setIsPaused] = useState(false);

  const handleTogglePause = () => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    socket.emit('togglePause', { lobbyId, isPaused: newPauseState });
  };

  return (
    <div>
      <h2>Host Dashboard</h2>
      <button onClick={handleTogglePause}>
        {isPaused ? 'Resume Game' : 'Pause Game'}
      </button>
    </div>
  );
};

export default Host;