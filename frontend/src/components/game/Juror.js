import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import PauseOverlay from './PauseOverlay';
import GlobalTimeline from './GlobalTimeline';
import '../../styles/Player.css';
import '../../styles/App.css';
import '../../styles/Umpire.css';

const Juror = ({ acceptedHeadlines, waitingMessage = "waiting for players to submit headlines..." }) => {
  const [headlineData, setHeadlineData] = useState({}); // Store all data in one dictionary
  const [isPaused, setIsPaused] = useState(false);
  const [forceAccept, setForceAccept] = useState(false);

  useEffect(() => {
    socket.emit('registerJuror');

    socket.on('newHeadline', ({ headlineId, headline }) => {
      console.log("received new headline for review");
      setHeadlineData(prevData => ({
        ...prevData,
        [headlineId]: { 
          headline, 
          plausibilityScore: '', 
          isConsistent: false, 
          grammaticallyCorrect: false, 
          planetaryAlignment: false, 
          narrativeBuilding: false 
        }
      }));
    });


    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
    });

    return () => {
      socket.emit('deregisterJuror');
      socket.off('newHeadline');
      socket.off('umpireReview');
      socket.off('gamePaused');
    };
  }, []);

  const handleConsistencyChange = (headlineId, isConsistent) => {
    setHeadlineData(prevData => ({
      ...prevData,
      [headlineId]: {
        ...prevData[headlineId],
        isConsistent,
        ...(isConsistent ? {} : {
          grammaticallyCorrect: false,
          planetaryAlignment: false,
          narrativeBuilding: false
        })
      }
    }));
  };

  const handleCheckboxChange = (headlineId, key, isChecked) => {
    setHeadlineData(prevData => ({
      ...prevData,
      [headlineId]: {
        ...prevData[headlineId],
        [key]: isChecked
      }
    }));
  };

  const handleScoreChange = (headlineId, score) => {
    setHeadlineData(prevData => ({
      ...prevData,
      [headlineId]: {
        ...prevData[headlineId],
        plausibilityScore: score
      }
    }));
  };

  const handleSubmit = (headlineId) => {
    const headline = headlineData[headlineId];
    console.log('Current headlineData:', headline);
    const { plausibilityScore, isConsistent, grammaticallyCorrect, planetaryAlignment, narrativeBuilding } = headline;

    // Validate plausibility score
    if (isNaN(plausibilityScore) || plausibilityScore < 0 || plausibilityScore > 100) {
      alert('Please enter a valid plausibility score between 0 and 100.');
      return;
    }

    const jurorScore = [grammaticallyCorrect, planetaryAlignment, narrativeBuilding].filter(Boolean).length;
    console.log('juror score:', jurorScore);
    // if (isConsistent && jurorScore === 0) {
    //   alert('Please select at least one checkbox for logically consistent headlines.');
    //   return;
    // }

    // Handle force accept logic
    if (forceAccept) {
      alert('Headline force accepted!');
    }

    socket.emit('submitJurorReview', { headlineId, isConsistent, jurorScore, plausibilityScore });

    // Remove the headline data after submission
    setHeadlineData(prevData => {
      const { [headlineId]: _, ...remainingData } = prevData;
      return remainingData;
    });
  };

  const handleForceAcceptChange = (e) => {
    setForceAccept(e.target.checked);
  };

  return (
    <div className="main-container">
      {isPaused && <PauseOverlay />}
      <div className="content">
        <h2>Score and Review Headlines</h2>
        {Object.keys(headlineData).length === 0 ? (
          <div>{waitingMessage}</div>
        ) : (
          Object.entries(headlineData).map(([headlineId, data], index) => (
            <div key={headlineId} className="headline-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div className="headline-text" style={{ flex: 1 }}>
                <p>{data.headline} {data.planet && `(${data.planet})`}</p>
              </div>
              <div>
                <input
                  type="number"
                  value={data.plausibilityScore}
                  onChange={(e) => handleScoreChange(headlineId, parseInt(e.target.value, 10))}
                  placeholder="Plausibility Score"
                  style={{ marginLeft: '10px', width: '80px' }}
                />
              </div>
              <div className="consistency" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                <label>
                  Logically Consistent:
                  <input
                    type="checkbox"
                    checked={data.isConsistent || false}
                    onChange={(e) => handleConsistencyChange(headlineId, e.target.checked)}
                    style={{ marginLeft: '5px' }}
                  />
                </label>
              </div>
              {data.isConsistent && (
                <div className="score" style={{ marginLeft: '10px' }}>
                  <label>
                    Grammatically Correct:
                    <input
                      type="checkbox"
                      checked={data.grammaticallyCorrect || false}
                      onChange={(e) => handleCheckboxChange(headlineId, 'grammaticallyCorrect', e.target.checked)}
                      style={{ marginLeft: '5px' }}
                    />
                  </label>
                  <label>
                    Planetary Alignment:
                    <input
                      type="checkbox"
                      checked={data.planetaryAlignment || false}
                      onChange={(e) => handleCheckboxChange(headlineId, 'planetaryAlignment', e.target.checked)}
                      style={{ marginLeft: '5px' }}
                    />
                  </label>
                  <label>
                    Narrative Building:
                    <input
                      type="checkbox"
                      checked={data.narrativeBuilding || false}
                      onChange={(e) => handleCheckboxChange(headlineId, 'narrativeBuilding', e.target.checked)}
                      style={{ marginLeft: '5px' }}
                    />
                  </label>
                </div>
              )}
              {index === 0 ? (
                <>
                  <label style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={forceAccept}
                      onChange={handleForceAcceptChange}
                      style={{ marginRight: '5px' }}
                    />
                    Force Accept
                  </label>
                  <button
                    onClick={() => handleSubmit(headlineId)}
                    style={{
                      marginLeft: '10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      border: 'none'
                    }}
                  >
                    Submit
                  </button>
                </>
              ) : (
                <p>Waiting for other headlines to be scored...</p>
              )}
            </div>
          ))
        )}
      </div>
      <div className="global-timeline-container">
        <GlobalTimeline acceptedHeadlines={acceptedHeadlines} />
      </div>
    </div>
  );
};

export default Juror;
