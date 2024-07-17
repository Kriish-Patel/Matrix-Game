// frontend/src/components/game/Player.js
import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import ReactModal from 'react-modal';
import '../../Player.css';
import GameTimer from './GameTimer'; // Import GameTimer component

import '../../App.css'; // Ensure correct path
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const Player = ({planet}) => {
  const [headline, setHeadline] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('failed', 'with Juror, pending', 'with Umpire, pending', 'success');
  
  

  useEffect(() => {
    socket.on('updatePlayerStatus', ({ socketId, headlineId, headline, status }) => {
      console.log(`Player ${socketId} changed status to ${status} for headline ${headlineId}, ${headline}`);

    });
    // Fetch the briefing information for the player's planet
    fetch('/player_briefings.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        if (data[planet]) {
          setBriefing(data[planet]);
        }
      })
      .catch((error) => console.error('Error fetching briefing data:', error));
  }, [planet]);

  const submitHeadline = () => {
    socket.emit('submitHeadline', { socketId: socket.id, headline });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="player-container">
      <GameTimer />
      <h2>Enter Headline</h2>
      <h3>Player Planet: {planet}</h3>
      <div className="headline-input-container">
        <input 
          type="text" 
          value={headline} 
          onChange={(e) => setHeadline(e.target.value)} 
          placeholder="Enter your headline" 
          className="headline-input"
        />
        <div className="button-container">
          <button onClick={submitHeadline}>Submit</button>
          <button onClick={openModal}>View Briefing</button>
        </div>
      </div>
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
  );
};

export default Player;
