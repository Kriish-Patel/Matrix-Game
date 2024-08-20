
import React, { useState } from 'react';
import socket from '../../../socket';

const HeadlineForm = ({ hasPendingHeadline, setHasPendingHeadline }) => {
  const [headline, setHeadline] = useState('');

  const submitHeadline = () => {
    if (headline.trim() && !hasPendingHeadline) {
      socket.emit('submitHeadline', { socketId: socket.id, headline });
      setHeadline('');
      setHasPendingHeadline(true);
    }
  };

  return (
    <div className="headline-input-container">
      <input
        type="text"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Enter your headline"
        className="headline-input"
        disabled={hasPendingHeadline}
        maxLength={60}
      />
      <div className="button-container">
        <button onClick={submitHeadline} disabled={hasPendingHeadline}>
          {hasPendingHeadline ? 'Waiting for response...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default HeadlineForm;
