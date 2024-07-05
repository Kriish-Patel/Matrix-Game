// frontend/src/components/game/Juror.js
import React, { useState, useEffect } from 'react';

import '../../App.css'; // Ensure correct path
import socket from '../../socket'

const Juror = ({waitingMessage }) => {

  const [headLines, setHeadLines] = useState([]);
  const [scores, setScores] = useState({}); //{headline: score}
  let waitingmessage = "Waiting for  players to submit headlines..."

  useEffect(() => {

    socket.on('sendJurorHeadline', ({headline}) => {
      console.log("received from juror")
      setHeadLines((prevHeadlines) => [...prevHeadlines, headline]);
      
    })
    
    // Cleanup the event listener on component unmount
    return () => {
      socket.off('sendJurorHeadline');
    };
  }, []); // Empty dependency array ensures this effect runs only once
  

  const handleScoreChange = (headline, value) => {
    setScores((prevScores) => ({
      ...prevScores,
      [headline]: value,
    }));
  };

  const handleSubmit = () => {
    // Create an array of objects with headline and score
    const rankedHeadlines = Object.keys(scores).map((headline) => ({
      headline,
      score: scores[headline],
    }));

    // Emit the ranked headlines to the backend
    socket.emit('submitRankings', {rankedHeadlines});
    
  };

  // Check if the submit button should be disabled
  const isSubmitDisabled = headLines.length === 0 || headLines.some((headline) => !scores[headline]);
  console.log(`scores: ${scores}`);


  return (
    <div>
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingMessage}</div>
      ) : (
        headLines.map((headline, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ marginRight: '10px' }}>{headline}</p>
            <input
              type="number"
              min="1"
              max="100"
              value={scores[headline] || ''}
              onChange={(e) => handleScoreChange(headline, parseInt(e.target.value))}
              style={{ width: '60px' }}
            />
          </div>
        ))
      )}
      {headLines.length > 0 && (
        <button onClick={handleSubmit} disabled={isSubmitDisabled}>Submit Rankings</button>
      )}
    </div>
  );

  
};

export default Juror;
