import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Umpire = ({ waitingMessage }) => {
  const [headlines, setHeadlines] = useState([]);
  const [selectedScores, setSelectedScores] = useState({}); // Store scores for each headline
  const [logicalConsistency, setLogicalConsistency] = useState({}); // Store logical consistency for each headline

  useEffect(() => {
    socket.on('umpireReview', ({ headlineId, headline }) => {
      setHeadlines((prevHeadlines) => [...prevHeadlines, { headlineId, headline }]);
    });

    return () => {
      socket.off('umpireReview');
    };
  }, []);

  const handleConsistencyChange = (headlineId, isConsistent) => {
    setLogicalConsistency((prevState) => ({
      ...prevState,
      [headlineId]: isConsistent
    }));

    // Reset score if logically consistent is set to no
    if (!isConsistent) {
      setSelectedScores((prevState) => ({
        ...prevState,
        [headlineId]: undefined
      }));
    }
  };

  const handleScoreChange = (headlineId, score) => {
    setSelectedScores((prevState) => ({
      ...prevState,
      [headlineId]: score
    }));
  };

  const handleSubmit = (headlineId) => {
    const isConsistent = logicalConsistency[headlineId];
    const umpireScore = selectedScores[headlineId];

    if (isConsistent && umpireScore === undefined) {
      alert('Please select a score.');
      return;
    }

    socket.emit('submitUmpireReview', { headlineId, isConsistent, umpireScore });

    setHeadlines((prevHeadlines) => prevHeadlines.filter(h => h.headlineId !== headlineId));
    setLogicalConsistency((prevState) => {
      const { [headlineId]: _, ...rest } = prevState;
      return rest;
    });
    setSelectedScores((prevState) => {
      const { [headlineId]: _, ...rest } = prevState;
      return rest;
    });
  };

  return (
    <div>
      <h2>Review Headlines</h2>
      {headlines.length === 0 ? (
        <div>{waitingMessage}</div>
      ) : (
        headlines.map(({ headlineId, headline }) => (
          <div key={headlineId} style={{ marginBottom: '10px' }}>
            <p>{headline}</p>
            <label>
              Logically Consistent:
              <input 
                type="checkbox" 
                checked={logicalConsistency[headlineId] || false} 
                onChange={(e) => handleConsistencyChange(headlineId, e.target.checked)} 
              />
            </label>
            {logicalConsistency[headlineId] && (
              <div>
                <label>
                  Score:
                  <select 
                    value={selectedScores[headlineId] || ''} 
                    onChange={(e) => handleScoreChange(headlineId, parseInt(e.target.value, 10))} 
                  >
                    <option value="" disabled>Select score</option>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </label>
              </div>
            )}
            <button onClick={() => handleSubmit(headlineId)} style={{ marginLeft: '10px' }}>
              Submit
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Umpire;
