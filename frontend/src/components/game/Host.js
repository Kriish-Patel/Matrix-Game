// frontend/src/components/game/Host.js
import React, { useState } from 'react';
import socket from '../../socket';
import GlobalTimeline from './GlobalTimeline'

const Host = ({ lobbyId, acceptedHeadlines}) => {
  const [isPaused, setIsPaused] = useState(false);

  const handleTogglePause = () => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    socket.emit('togglePause', { lobbyId, isPaused: newPauseState });
  };

  const handleEndGame = () => {
    socket.emit('endGame', { lobbyId });
  };

  return (
    <div className="main-container">
      <h2>Host Dashboard</h2>
      <button onClick={handleTogglePause}>
        {isPaused ? 'Resume Game' : 'Pause Game'}
      </button>
      <button onClick={handleEndGame}>End Game</button>
      <div className="global-timeline-container">
        <GlobalTimeline acceptedHeadlines = {acceptedHeadlines}  />
      </div>
    </div>

  );
};

export default Host;