// frontend/src/components/game/Umpire.js
import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Umpire = () => {
  const [headlinesToReview, setHeadlinesToReview] = useState([]);

  useEffect(() => {
    socket.on('umpireReview', ({ headlineId, headline }) => {
      setHeadlinesToReview((prevHeadlines) => [...prevHeadlines, { headlineId, headline }]);
    });

    return () => {
      socket.off('umpireReview');
    };
  }, []);

  const handleDecision = (index, accepted) => {
    const { headlineId } = headlinesToReview[index];
    
    // Emit decision to backend (accept or reject)
    socket.emit('umpireDecision', { headlineId, accepted });

    setHeadlinesToReview((prevHeadlines) => prevHeadlines.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Umpire Review</h2>
      {headlinesToReview.length === 0 ? (
        <div>No headlines to review</div>
      ) : (
        headlinesToReview.map(({ headlineId, headline }, index) => (
          <div key={headlineId} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ flex: 1 }}>{headline}</p>
            <button onClick={() => handleDecision(index, true)} style={{ marginLeft: '10px' }}>Accept</button>
            <button onClick={() => handleDecision(index, false)} style={{ marginLeft: '10px' }}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Umpire;
