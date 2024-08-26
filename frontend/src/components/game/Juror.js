import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import PauseOverlay from './PauseOverlay';
import GlobalTimeline from './GlobalTimeline';
import '../../styles/Player.css';
import '../../styles/App.css';

const Juror = ({ waitingMessage }) => {
  const [headLines, setHeadLines] = useState(() => {
    const savedHeadlines = sessionStorage.getItem('headLines');
    return savedHeadlines ? JSON.parse(savedHeadlines) : [];
  });

  const [isPaused, setIsPaused] = useState(() => {
    const savedIsPaused = sessionStorage.getItem('isPaused');
    return savedIsPaused ? JSON.parse(savedIsPaused) : false;
  });

  useEffect(() => {
    socket.emit('registerJuror');

    socket.on('newHeadline', ({ headlineId, headline }) => {
      console.log("received new headline for review");
      setHeadLines((prevHeadlines) => {
        const updatedHeadlines = [...prevHeadlines, { headlineId, headline }];
        sessionStorage.setItem('headLines', JSON.stringify(updatedHeadlines));
        return updatedHeadlines;
      });
    });

    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
      sessionStorage.setItem('isPaused', JSON.stringify(isPaused));
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

    setHeadLines((prevHeadlines) => {
      const updatedHeadlines = prevHeadlines.filter((_, i) => i !== index);
      sessionStorage.setItem('headLines', JSON.stringify(updatedHeadlines));
      return updatedHeadlines;
    });
  };

  return (
    <div className="main-container">
      {isPaused && <PauseOverlay />}
      <div className="content">
        <h2>Score Headlines</h2>
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
                      style={{ marginLeft: '10px', backgroundColor: '#007bff'  }}
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
      <div className="global-timeline-container">
        <GlobalTimeline />
      </div>
    </div>
  );
};

export default Juror;
