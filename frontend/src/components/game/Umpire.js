import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import PauseOverlay from './PauseOverlay';
import GlobalTimeline from './GlobalTimeline';
import '../../styles/Player.css';
import '../../styles/App.css';
import '../../styles/Umpire.css'

const Umpire = ({ waitingMessage }) => {
  const [headlines, setHeadlines] = useState([]);
  const [selectedScores, setSelectedScores] = useState({}); // Store scores for each headline
  const [logicalConsistency, setLogicalConsistency] = useState({}); // Store logical consistency for each headline
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    socket.on('umpireReview', ({ headlineId, headline, planet }) => {
      setHeadlines((prevHeadlines) => [...prevHeadlines, { headlineId, headline, planet }]);
      console.log(`frontend umpire planet: ${planet}`)
    });
    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
    });

    return () => {
      socket.off('umpireReview');
      socket.off('gamePaused');
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
    <div className="main-container">
      {isPaused && <PauseOverlay />}
      <div className="content">
        <h2>Review Headlines</h2>
        {headlines.length === 0 ? (
          <div>{waitingMessage}</div>
        ) : (
          headlines.map(({ headlineId, headline, planet }) => (
            <div key={headlineId} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 3 }}>
                <p>{headline} ({planet})</p>
              </div>
              <div style={{ flex: 2 }}>
                <label>
                  Logically Consistent:
                  <input
                    type="checkbox"
                    checked={logicalConsistency[headlineId] || false}
                    onChange={(e) => handleConsistencyChange(headlineId, e.target.checked)}
                  />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                {logicalConsistency[headlineId] && (
                  <div>
                    <label>
                      Score:
                      <select
                        value={selectedScores[headlineId] === undefined ? '' : selectedScores[headlineId]}
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
              </div>
              <div>
                <button onClick={() => handleSubmit(headlineId)} style={{ marginLeft: '10px' }}>
                  Submit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="global-timeline-container">
        <GlobalTimeline />
      </div>
    </div>
  );
};  
export default Umpire;
