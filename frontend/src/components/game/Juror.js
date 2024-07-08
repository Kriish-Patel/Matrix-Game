import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Juror = ({ waitingMessage }) => {

  const [headlineScores, setHeadlineScores] = useState({}); // {headline: [score1, score2, score3]}
  let waitingmessage = "Waiting for  players to submit headlines..."

  useEffect(() => {

    //received headline from player.js
    socket.on('sendJurorHeadline', ({ headline }) => {
      console.log("received from juror");
      setHeadlineScores((prevScores) => ({
        ...prevScores,
        [headline]: prevScores[headline] ? prevScores[headline] : []
      }));
      
    });

    return () => {
      socket.off('sendJurorHeadline');
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const handleSubmit = (index) => {
    setHeadLines((prevHeadlines) => prevHeadlines.filter((_, i) => i !== index));
  };

  const isSubmitDisabled = () => {
    return headLines.some((headline, index) => !scores[headline]);
  };

  return (
    <div>
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingmessage}</div>
      ) : (
        headLines.map((headline, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <p>{headline}</p>
            <input type="text" placeholder="Your input" style={{ marginLeft: '10px', width: '80px' }} />
            <button onClick={() => handleSubmit(index)} style={{ marginLeft: '10px' }}>Submit</button>
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
