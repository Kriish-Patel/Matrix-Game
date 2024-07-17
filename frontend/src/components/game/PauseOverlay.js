// frontend/src/components/game/PauseOverlay.js
import React from 'react';

const PauseOverlay = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      backgroundColor: 'black',
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center',
    }}>
      <h2>Game Paused</h2>
      <p>Please wait for the host to resume the game.</p>
    </div>
  </div>
);

export default PauseOverlay;