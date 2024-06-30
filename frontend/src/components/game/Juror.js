// frontend/src/components/game/Juror.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../../App.css'; // Ensure correct path
import socket from '../../socket'

const Juror = ({ lobbyId }) => {
  const [headlines, setHeadlines] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    socket.on('headlinesSubmitted', ({ headlines }) => {
      setHeadlines(headlines);
    });
  }, []);

  const handleSubmitScores = () => {
    socket.emit('submitJurorScores', { lobbyId, scores });
  };

  const handleScoreChange = (headline, score) => {
    setScores({
      ...scores,
      [headline]: score
    });
  };

  return (
    <div className="container">
      <h2>Rate Headlines</h2>
      {headlines.map((headline, index) => (
        <div key={index}>
          <p>{headline.headline}</p>
          <input 
            type="number" 
            min="1" 
            max="100" 
            onChange={(e) => handleScoreChange(headline.headline, e.target.value)} 
          />
        </div>
      ))}
      <button onClick={handleSubmitScores}>Submit Scores</button>
    </div>
  );
};

export default Juror;
