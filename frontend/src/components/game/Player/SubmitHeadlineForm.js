import React, { useState, useEffect } from 'react';
import socket from '../../../socket';

const HeadlineForm = ({ headline, setHeadline, hasPendingHeadline, setHasPendingHeadline, canRollDice, setCanRollDice, headlineID }) => {
  
  // Initialize state from sessionStorage or default values
  const [storedHeadline, setStoredHeadline] = useState(() => sessionStorage.getItem('headline') || headline);
  const [mySessionId, setMySessionId] = useState(() => {
    const savedSessionId = sessionStorage.getItem('sessionID');
    console.log("Initial mySessionId from sessionStorage:", savedSessionId);
    return savedSessionId || undefined;
  });
  
  useEffect(() => {
    // Sync headline with sessionStorage whenever it changes
    sessionStorage.setItem('headline', storedHeadline);
  }, [storedHeadline]);

  useEffect(() => {
    // Sync other states with sessionStorage
    sessionStorage.setItem('hasPendingHeadline', JSON.stringify(hasPendingHeadline));
    sessionStorage.setItem('canRollDice', JSON.stringify(canRollDice));
  }, [hasPendingHeadline, canRollDice]);

  const handleInputChange = (e) => {
    const newHeadline = e.target.value;
    setStoredHeadline(newHeadline);
    setHeadline(newHeadline); // Update the parent state if necessary
    // sessionStorage.setItem('headline', newHeadline); // Save in sessionStorage
  };

  const submitHeadline = () => {
    if (storedHeadline.trim() && !JSON.parse(sessionStorage.getItem('hasPendingHeadline'))) {
      socket.emit('submitHeadline', { socketId: mySessionId, headline: storedHeadline });
      setHasPendingHeadline(true);
      sessionStorage.setItem('hasPendingHeadline', true); // Update sessionStorage
    }
  };

  const rollDice = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    socket.emit('RollDice', { socketId: mySessionId, diceRollNumber: randomNumber, headlineID });
    alert(`You rolled a ${randomNumber}`);
    setCanRollDice(false);
    setHasPendingHeadline(false);
    setStoredHeadline('');
    setHeadline(''); // Clear parent state as well
    sessionStorage.setItem('hasPendingHeadline', false);
    sessionStorage.setItem('canRollDice', false);
    sessionStorage.setItem('headline', '');
  };

  return (
    <div className="headline-input-container">
      <input
        type="text"
        value={JSON.parse(sessionStorage.getItem('hasPendingHeadline')) ? '' : storedHeadline}
        onChange={handleInputChange}
        placeholder="Enter your headline"
        className="headline-input"
        disabled={JSON.parse(sessionStorage.getItem('hasPendingHeadline'))}
        maxLength={60}
      />
      <div className="button-container">
        <button onClick={submitHeadline} disabled={JSON.parse(sessionStorage.getItem('hasPendingHeadline'))}>
          {JSON.parse(sessionStorage.getItem('hasPendingHeadline')) ? 'Waiting for response...' : 'Submit'}
        </button>
        {JSON.parse(sessionStorage.getItem('canRollDice')) && (
          <button onClick={rollDice} className="dice-roll-button">
            Dice Roll
          </button>
        )}
      </div>
    </div>
  );
};

export default HeadlineForm;
