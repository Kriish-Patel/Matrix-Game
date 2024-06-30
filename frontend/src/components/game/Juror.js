// frontend/src/components/game/Juror.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../../App.css'; // Ensure correct path
import socket from '../../socket'

const Juror = ({waitingMessage }) => {

  const [headLines, setHeadLines] = useState([]);
  
  useEffect(() => {
  socket.on('sendJurorHeadline', ({headline}) => {
    console.log("received from juror")
    setHeadLines((prevHeadlines) => [...prevHeadlines, headline]);
    console.log(`new headlines: ${headLines}`);
    
  })
});

  return (
    <div>
      <h2>Rank Headlines</h2>
      {headLines.length === 0 ? (
        <div>{waitingMessage}</div>
      ) : (
        headLines.map((headline, index) => (
          <div key={index}>
            <p>{headline}</p>
            
          </div>
        ))
      )}
    </div>
  );
};

export default Juror;
