import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Juror = ({ waitingMessage }) => {
  const [headLines, setHeadLines] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    socket.on('sendJurorHeadline', ({ headline }) => {
      console.log("received from juror");
      setHeadLines((prevHeadlines) => [...prevHeadlines, headline]);
    });

    return () => {
      socket.off('sendJurorHeadline');
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const handleScoreChange = (index, value) => {
    const newScores = { ...scores };
    newScores[index] = value;
    setScores(newScores);
  };

  const handleSubmit = (index, headline) => {
    const score = scores[index];

    if (score === undefined || score < 0 || score > 100) {
      alert('Please enter a valid score between 0 and 100.');
      return;
    }

    // Send the headline, socket ID, and score to the backend
    socket.emit('submitScore', { headline, socketId: socket.id, score });

    setHeadLines((prevHeadlines) => prevHeadlines.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingMessage}</div>
      ) : (
        <div>
          <h3>Plausibility Score (0-100)</h3>
          {headLines.map((headline, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ flex: 1 }}>{headline}</p>
              <input 
                type="number" 
                placeholder="Your score" 
                style={{ marginLeft: '10px', width: '80px' }} 
                value={scores[index] || ''} 
                onChange={(e) => handleScoreChange(index, parseInt(e.target.value, 10))} 
              />
              <button onClick={() => handleSubmit(index, headline)} style={{ marginLeft: '10px' }}>Submit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Juror;
