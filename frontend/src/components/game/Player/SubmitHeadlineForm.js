import React, { useState } from 'react';
import socket from '../../../socket';

const HeadlineForm = ({ headline, setHeadline, hasPendingHeadline, setHasPendingHeadline, canRollDice, setCanRollDice, headlineID }) => {
  
  const handleInputChange = (e) => {
    setHeadline(e.target.value);
  };

  const submitHeadline = () => {
    if (headline.trim() && !hasPendingHeadline) {
      socket.emit('submitHeadline', { socketId: socket.id, headline });
      setHasPendingHeadline(true);
    }
  };

  const rollDice = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    socket.emit('RollDice', { socketId: socket.id, diceRollNumber: randomNumber, headlineID });
    alert(`You rolled a ${randomNumber}`);
    setCanRollDice(false);
    setHasPendingHeadline(false)
    setHeadline('')
  };

  return (
    <div className="headline-input-container">
      <input
        type="text"
        value={hasPendingHeadline ? '' : headline}
        onChange={handleInputChange}
        placeholder="Enter your headline"
        className="headline-input"
        disabled={hasPendingHeadline}
        maxLength={60}
      />
      <div className="button-container">
        <button onClick={submitHeadline} disabled={hasPendingHeadline}>
          {hasPendingHeadline ? 'Waiting for response...' : 'Submit'}
        </button>
        {canRollDice && (
          <button onClick={rollDice} className="dice-roll-button">
            Dice Roll
          </button>
        )}
      </div>
    </div>
  );
};

export default HeadlineForm;
