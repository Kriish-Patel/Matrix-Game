import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Juror = ({ waitingMessage }) => {
  const [headLines, setHeadLines] = useState([]);

  useEffect(() => {
    socket.on('sendJurorHeadline', ({ headline }) => {
      console.log("received from juror");
      setHeadLines((prevHeadlines) => [...prevHeadlines, headline]);
    });

    return () => {
      socket.off('sendJurorHeadline');
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const handleSubmit = (index) => {
    setHeadLines((prevHeadlines) => prevHeadlines.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingMessage}</div>
      ) : (
        headLines.map((headline, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <p>{headline}</p>
            <input type="text" placeholder="Your input" style={{ marginLeft: '10px', width: '80px' }} />
            <button onClick={() => handleSubmit(index)} style={{ marginLeft: '10px' }}>Submit</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Juror;
