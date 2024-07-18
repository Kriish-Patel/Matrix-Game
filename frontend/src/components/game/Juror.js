import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import PauseOverlay from './PauseOverlay';


const Juror = ({ waitingMessage }) => {
  const [headLines, setHeadLines] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    socket.emit('registerJuror');

    socket.on('newHeadline', ({ headlineId, headline }) => {
      console.log("received new headline for review");
      setHeadLines((prevHeadlines) => [...prevHeadlines, { headlineId, headline }]);
    });
    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
    });

    return () => {
      socket.emit('deregisterJuror');
      socket.off('newHeadline');
      socket.off('gamePaused');
    };
  }, []);

  const handleSubmit = (index, headlineId) => {
    const scoreInput = document.getElementById(`score-${index}`);
    const score = parseInt(scoreInput.value, 10);

    if (isNaN(score) || score < 0 || score > 100) {
      alert('Please enter a valid score between 0 and 100.');
      return;
    }

    socket.emit('submitScore', { headlineId, score });

    setHeadLines((prevHeadlines) => prevHeadlines.filter((_, i) => i !== index));
  };

  return (
    <div>
      {isPaused && <PauseOverlay />}
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingMessage}</div>
      ) : (
        <div>
          <h3>Plausibility Score (0-100)</h3>
          {headLines.map(({ headlineId, headline }, index) => (
            <div key={headlineId} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ flex: 1 }}>{headline}</p>
              {index === 0 ? (
                <>
                  <input 
                    type="number" 
                    id={`score-${index}`} 
                    placeholder="Your score" 
                    style={{ marginLeft: '10px', width: '80px' }} 
                  />
                  <button 
                    onClick={() => handleSubmit(index, headlineId)} 
                    style={{ marginLeft: '10px' }}
                  >
                    Submit
                  </button>
                </>
              ) : (
                <p>Waiting for other headlines to be scored...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Juror;
