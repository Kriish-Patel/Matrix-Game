import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import ReactModal from 'react-modal';

import '../../styles/Player.css';

import GlobalTimeline from './GlobalTimeline';
import PlayerTimeline from './PlayerTimeline';
import PauseOverlay from './PauseOverlay';
import AverageScore from './AverageScore';

const Player = ({ planet }) => {
  const [headline, setHeadline] = useState(() => {
    const savedHeadline = sessionStorage.getItem('headline');
    return savedHeadline ? savedHeadline : '';
  });
  const [briefing, setBriefing] = useState(() => {
    const savedBriefing = sessionStorage.getItem('briefing');
    return savedBriefing ? JSON.parse(savedBriefing) : null;
  });
  const [isModalOpen, setIsModalOpen] = useState(() => {
    const savedIsModalOpen = sessionStorage.getItem('isModalOpen');
    return savedIsModalOpen ? JSON.parse(savedIsModalOpen) : false;
  });
  const [hasPendingHeadline, setHasPendingHeadline] = useState(() => {
    const savedHasPendingHeadline = sessionStorage.getItem('hasPendingHeadline');
    return savedHasPendingHeadline ? JSON.parse(savedHasPendingHeadline) : false;
  });
  const [isPaused, setIsPaused] = useState(() => {
    const savedIsPaused = sessionStorage.getItem('isPaused');
    return savedIsPaused ? JSON.parse(savedIsPaused) : false;
  });
  const [playerScore, setPlayerScore] = useState(() => {
    const savedPlayerScore = sessionStorage.getItem('playerScore');
    return savedPlayerScore ? parseInt(savedPlayerScore, 10) : 0;
  });
  const [mySessionId, setMySessionId] = useState(() => {
    const savedSessionId = sessionStorage.getItem('sessionID');
    return savedSessionId || undefined;
  });

  useEffect(() => {
    
    const savedSessionId = sessionStorage.getItem('sessionID');
    if (savedSessionId && !mySessionId) {
      console.log("Updating mySessionId from sessionStorage:", savedSessionId);
      setMySessionId(savedSessionId);
    }
    // Fetch the briefing information for the player's planet
    fetch('/player_briefings.json')
      .then((response) => response.json())
      .then((data) => {
        if (data[planet]) {
          setBriefing(data[planet]);
          sessionStorage.setItem('briefing', JSON.stringify(data[planet]));
        }
      })
      .catch((error) => console.error('Error fetching briefing data:', error));

    socket.on('updatePlayerStatus', ({ socketId, headlineId, headline, status }) => {
      console.log(`Player ${socketId} changed status to ${status} for headline ${headlineId}, ${headline}`);
      if (status === 'success' || status === 'failed') {
        setHasPendingHeadline(false);
        sessionStorage.setItem('hasPendingHeadline', JSON.stringify(false));
      }
    });

    socket.on('updatePlayerScore', ({ score }) => {
      setPlayerScore((prevScore) => {
        const newScore = prevScore + score;
        sessionStorage.setItem('playerScore', newScore);
        return newScore;
      });
    });

    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
      sessionStorage.setItem('isPaused', JSON.stringify(isPaused));
    });

    return () => {
      socket.off('updatePlayerStatus');
      socket.off('gamePaused');
    };
  }, [planet, mySessionId]);

  const submitHeadline = () => {
    if (headline.trim() && !hasPendingHeadline) {
      socket.emit('submitHeadline', { socketId: mySessionId, headline });
      setHeadline('');
      sessionStorage.setItem('headline', '');
      setHasPendingHeadline(true);
      sessionStorage.setItem('hasPendingHeadline', JSON.stringify(true));
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    sessionStorage.setItem('isModalOpen', JSON.stringify(true));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    sessionStorage.setItem('isModalOpen', JSON.stringify(false));
  };

  return (
    <div className="main-container">
    
      <div className="player-timeline-container">
        <PlayerTimeline />
      </div>
      <div className="player-container">
        <h3>Your Score: {playerScore}</h3>
        <h3>Average Game Score: <AverageScore /> </h3>
        <h2>Enter Headline</h2>
        <div className="headline-input-container">
          <input
            type="text"
            value={headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              sessionStorage.setItem('headline', e.target.value);
            }}
            placeholder="Enter your headline"
            className="headline-input"
            disabled={hasPendingHeadline}
            maxLength={60}
          />
          <div className="button-container">
            <button onClick={submitHeadline} disabled={hasPendingHeadline}>
              {hasPendingHeadline ? 'Waiting for response...' : 'Submit'}
            </button>
            <button onClick={openModal}>View Briefing</button>
          </div>
        </div>
        {hasPendingHeadline && (
          <p className="pending-message">Your headline is pending. Please wait for a response before submitting a new one.</p>
        )}
        {briefing && (
          <ReactModal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Player Briefing"
            className="modal"
            overlayClassName="modal-overlay"
            appElement={document.getElementById('root') || undefined}
          >
            <div className="modal-content">
              <button onClick={closeModal}>Close</button>
              <h2>Briefing for {planet}</h2>
              <h3>Role Overview</h3>
              <p>{briefing.roleOverview}</p>
              {briefing.areasOfWorldlyConcern && (
                <>
                  <h3>Areas of Worldly Concern</h3>
                  <ul>
                    {briefing.areasOfWorldlyConcern.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </>
              )}
              {briefing.gameplayGuidance && (
                <>
                  <h3>Gameplay Guidance</h3>
                  <ul>
                    {briefing.gameplayGuidance.map((guidance, index) => (
                      <li key={index}>{guidance}</li>
                    ))}
                  </ul>
                </>
              )}
              {briefing.scoringPoints && (
                <>
                  <h3>Scoring Points</h3>
                  <ul>
                    {briefing.scoringPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </ReactModal>
        )}
      </div>
      <div className="global-timeline-container">
        <GlobalTimeline />
      </div>
    </div>
  );
};

export default Player;
