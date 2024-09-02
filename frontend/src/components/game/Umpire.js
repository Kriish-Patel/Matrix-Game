import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import PauseOverlay from './PauseOverlay';
import GlobalTimeline from './GlobalTimeline';
import '../../styles/Player.css';
import '../../styles/App.css';
import '../../styles/Umpire.css'

const Umpire = ({ acceptedHeadlines }) => {
  const [headlines, setHeadlines] = useState([]);
  const [selectedScores, setSelectedScores] = useState({}); // Store scores for each headline
  const [logicalConsistency, setLogicalConsistency] = useState({}); // Store logical consistency for each headline
  const [isPaused, setIsPaused] = useState(false);
  let waitingMessage = "waiting for jurors..."

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
        [headlineId]: {}
      }));
    }
  };

  const handleCheckboxChange = (headlineId, checkboxName, isChecked) => {
    setSelectedScores((prevState) => ({
      ...prevState,
      [headlineId]: {
        ...prevState[headlineId],
        [checkboxName]: isChecked
      }
    }));
  };

  const handleSubmit = (headlineId) => {
    const isConsistent = logicalConsistency[headlineId];
    const scoreData = selectedScores[headlineId] || {};
    const score = Object.values(scoreData).filter(Boolean).length;


    socket.emit('submitUmpireReview', { headlineId, isConsistent, umpireScore: score });

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
            <div key={headlineId} className="headline-row">
              <div className="headline-text">
                <p>{headline} ({planet})</p>
              </div>
              <div className="consistency">
                <label>
                  Logically Consistent:
                  <input
                    type="checkbox"
                    checked={logicalConsistency[headlineId] || false}
                    onChange={(e) => handleConsistencyChange(headlineId, e.target.checked)}
                  />
                </label>
              </div>
              <div className="score">
                {logicalConsistency[headlineId] && (
                  <div>
                    <label>
                      Grammatically Correct:
                      <input
                        type="checkbox"
                        checked={selectedScores[headlineId]?.grammaticallyCorrect || false}
                        onChange={(e) => handleCheckboxChange(headlineId, 'grammaticallyCorrect', e.target.checked)}
                      />
                    </label>
                    <label>
                      Planetary Alignment:
                      <input
                        type="checkbox"
                        checked={selectedScores[headlineId]?.planetaryAlignment || false}
                        onChange={(e) => handleCheckboxChange(headlineId, 'planetaryAlignment', e.target.checked)}
                      />
                    </label>
                    <label>
                      Narrative Building:
                      <input
                        type="checkbox"
                        checked={selectedScores[headlineId]?.narrativeBuilding || false}
                        onChange={(e) => handleCheckboxChange(headlineId, 'narrativeBuilding', e.target.checked)}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div>
                <button className="submit-button" onClick={() => handleSubmit(headlineId)}>
                  Submit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="global-timeline-container">
        <GlobalTimeline acceptedHeadlines = {acceptedHeadlines}  />
      </div>
    </div>
  );
};  
export default Umpire;