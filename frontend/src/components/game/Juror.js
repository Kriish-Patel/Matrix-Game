// frontend/src/components/game/Juror.js
import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Juror = () => {
  const [headLines, setHeadLines] = useState([]);
  let waitingmessage = "Waiting for players to submit headlines..."

  useEffect(() => {
    socket.on('sendJurorHeadline', ({ headlineId, headline }) => {
      console.log("received from juror");
      setHeadLines((prevHeadlines) => [...prevHeadlines, { headlineId, headline }]);
    });

    return () => {
      socket.off('sendJurorHeadline');
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const handleSubmit = (index, headlineId) => {
    const scoreInput = document.getElementById(`score-${index}`);
    const score = parseInt(scoreInput.value, 10);

    if (isNaN(score) || score < 0 || score > 100) {
      alert('Please enter a valid score between 0 and 100.');
      return;
    }

    // Send the headlineId, socket ID, and score to the backend
    socket.emit('submitScore', { headlineId, score });

    setHeadLines((prevHeadlines) => prevHeadlines.filter((_, i) => i !== index));
  };

 

  return (
    <div>
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingmessage}</div>
      ) : (
        <div>
          <h3>Plausibility Score (0-100)</h3>
          {headLines.map(({ headlineId, headline }, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ flex: 1 }}>{headline}</p>
              <input 
                type="number" 
                id={`score-${index}`} 
                placeholder="Your score" 
                style={{ marginLeft: '10px', width: '80px' }} 
              />
              <button onClick={() => handleSubmit(index, headlineId)} style={{ marginLeft: '10px' }}>Submit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Juror;
