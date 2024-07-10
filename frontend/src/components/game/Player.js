// frontend/src/components/game/Player.js
import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import ReactModal from 'react-modal';

import '../../App.css'; // Ensure correct path
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const Player = ({planet}) => {
  const [headline, setHeadline] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  

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
    <div className="container">
      <h2>Enter Headline</h2>
      <h3 >Player Planet: {planet}</h3>
      <input 
        type="text" 
        value={headline} 
        onChange={(e) => setHeadline(e.target.value)} 
        placeholder="Enter your headline" 
      />
      <button onClick={submitHeadline}>Submit</button>
      <button onClick={openModal}>View Briefing</button>
      {briefing && (
        <ReactModal 
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Player Briefing"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <button onClick={closeModal}>Close</button>
            <h2>Briefing for {planet}</h2>
            <h3>Role Overview</h3>
            <p>{briefing.roleOverview}</p>
            <h3>Areas of Worldly Concern</h3>
            <ul>
              {briefing.areasOfWorldlyConcern.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
            <h3>Gameplay Guidance</h3>
            <ul>
              {briefing.gameplayGuidance.map((guidance, index) => (
                <li key={index}>{guidance}</li>
              ))}
            </ul>
            <h3>Scoring Points</h3>
            <ul>
              {briefing.scoringPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </ReactModal>
      )}
    </div>
  );
};

export default Player;
