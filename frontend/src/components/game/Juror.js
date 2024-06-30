// frontend/src/components/game/Juror.js
import React from 'react';
import io from 'socket.io-client';
import '../../App.css'; // Ensure correct path
import socket from '../../socket'

const Juror = ({ headlines, waitingMessage }) => {
  if (headlines.length === 0) {
    return <div>{waitingMessage}</div>;
  }

  return (
    <div>
      <h2>Rank Headlines</h2>
      {headlines.map((headline, index) => (
        <div key={index}>
          <p>{headline.text}</p>
          {/* Implement the ranking UI here */}
        </div>
      ))}
    </div>
  );
};

export default Juror;
