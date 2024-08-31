
import React, { useState } from 'react';
import socket from '../../../socket';

const HeadlineForm = ({ headline, setHeadline, hasPendingHeadline, setHasPendingHeadline, headlineID }) => {
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  
  const handleInputChange = (e) => {
    setHeadline(e.target.value);
    setIsInputDisabled(false); // Re-enable input on change
  };

  const submitHeadline = () => {
    if (headline.trim() && !hasPendingHeadline) {
      socket.emit('submitHeadline', { socketId: socket.id, headline });
      setHasPendingHeadline(true);
      setIsInputDisabled(true);
    }
  };

  const rollDice = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    socket.emit('submitDiceRoll', { socketId: socket.id, randomNumber, headlineID});

    alert(`You rolled a ${randomNumber}`);
  };

  return (
    <div className="headline-input-container">
      <input
        type="text"
        value={isInputDisabled ? '' : headline}
        onChange={handleInputChange}
        placeholder="Enter your headline"
        className="headline-input"
        disabled={hasPendingHeadline || isInputDisabled}
        maxLength={60}
      />
      <div className="button-container">
        <button onClick={submitHeadline} disabled={hasPendingHeadline}>
          {hasPendingHeadline ? 'Waiting for response...' : 'Submit'}
        </button>
        {hasPendingHeadline && (
          <button onClick={rollDice} className="dice-roll-button">
            Dice Roll
          </button>
        )}
      </div>
    </div>
  );
};

export default HeadlineForm;
