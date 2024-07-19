// frontend/src/components/game/Player.js
import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import ReactModal from 'react-modal';
import '../../styles/Player.css';
import '../../styles/App.css';

import GlobalTimeline from './GlobalTimeline';
import PlayerTimeline from './PlayerTimeline';
import PauseOverlay from './PauseOverlay';


const Player = ({ planet }) => {
  const [headline, setHeadline] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPendingHeadline, setHasPendingHeadline] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);

  useEffect(() => {
    // Fetch the briefing information for the player's planet
    fetch('/player_briefings.json')
      .then((response) => response.json())
      .then((data) => {
        
        if (data[planet]) {
          setBriefing(data[planet]);
        }
      })
      .catch((error) => console.error('Error fetching briefing data:', error));

    socket.on('updatePlayerStatus', ({ socketId, headlineId, headline, status }) => {
      console.log(`Player ${socketId} changed status to ${status} for headline ${headlineId}, ${headline}`);
      if (status === 'success' || status === 'failed') {
        setHasPendingHeadline(false);
      }
    });

    socket.on('updatePlayerScore', ({score}) => {
        setPlayerScore(prevscore => prevscore + score );
      });

    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
    });

    return () => {
      socket.off('updatePlayerStatus');
      socket.off('gamePaused');
    };
  }, [planet]);

  const submitHeadline = () => {
    if (headline.trim() && !hasPendingHeadline) {
      socket.emit('submitHeadline', { socketId: socket.id, headline });
      setHeadline('');
      setHasPendingHeadline(true);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="main-container">
    
      {isPaused && <PauseOverlay />}
      <div className="player-timeline-container">
        <PlayerTimeline />
      </div>
      <div className="player-container">
        <h3>Player Score: {playerScore}</h3>
        <h3>Player Planet: {planet}</h3>
        <h2>Enter Headline</h2>
        <div className="headline-input-container">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Enter your headline"
            className="headline-input"
            disabled={hasPendingHeadline}
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