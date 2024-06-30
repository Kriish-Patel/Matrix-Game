// frontend/src/components/game/Umpire.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../../App.css'; // Ensure correct path
import socket from '../../socket'



const Umpire = ({ lobbyId }) => {
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    socket.on('headlinesProcessed', ({ headlines }) => {
      setHeadlines(headlines);
    });
  }, []);

  const handleReviewHeadlines = () => {
    const acceptedHeadlines = headlines.filter(headline => headline.status === 'passed');
    socket.emit('umpireReview', { lobbyId, acceptedHeadlines });
  };

  return (
    <div className="container">
      <h2>Review Headlines</h2>
      {headlines.map((headline, index) => (
        <p key={index}>{headline.headline}</p>
      ))}
      <button onClick={handleReviewHeadlines}>Accept Headlines</button>
    </div>
  );
};

export default Umpire;
