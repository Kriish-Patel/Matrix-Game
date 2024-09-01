// frontend/src/components/game/Player.js
import React, { useState, useEffect } from 'react';
import socket from '../../../socket';

import '../../../styles/Player.css';

import GlobalTimeline from '../GlobalTimeline';
import PlayerTimeline from '../PlayerTimeline';
import PauseOverlay from '../PauseOverlay';
import BriefingModal from './BriefingModal';
import SubmitHeadlineForm from './SubmitHeadlineForm';
import ScoreDisplay from './AverageScore';
import WorkingArea from './WorkingArea';

const Player = ({ planet, acceptedHeadlines }) => {
  const [headline, setHeadline] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPendingHeadline, setHasPendingHeadline] = useState(false);
  const [canRollDice, setCanRollDice] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [currentHeadlineID, setCurrentHeadlineID] = useState(null);

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
    
    socket.on('getHeadlineID', ({headlineID}) => {
      setCurrentHeadlineID(headlineID);
      console.log(`headlineID received in frontend: ${headlineID}`)
    });

    socket.on('updatePlayerStatus', ({ status }) => {

      if (status === 'success' || status === 'failed') {
        setHasPendingHeadline(false);
        setCanRollDice(false);
      }
      if (status == 'Roll the dice!'){
        setCanRollDice(true);
      }
    });

    socket.on('updatePlayerScore', ({ score }) => {
      setPlayerScore((prevscore) => prevscore + score);
    });

    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
    });

    return () => {
      socket.off('updatePlayerStatus');
      socket.off('gamePaused');
    };
  }, [planet]);

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
        <ScoreDisplay playerScore={playerScore} />
        <h2>Enter Headline</h2>
        <SubmitHeadlineForm
          headline={headline}
          setHeadline={setHeadline}
          hasPendingHeadline={hasPendingHeadline}
          setHasPendingHeadline={setHasPendingHeadline}
          canRollDice = {canRollDice}
          setCanRollDice = {setCanRollDice}
          headlineID = {currentHeadlineID}
        />
        <button onClick={openModal}>View Briefing</button>
        {briefing && (
          <BriefingModal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            briefing={briefing}
            planet={planet}
          />
        )}
      </div>
      <div className="working-area-container">
        <WorkingArea setHeadline={setHeadline} /> 
      </div>
      <div className="global-timeline-container">
        <GlobalTimeline acceptedHeadlines={acceptedHeadlines} />
      </div>
    </div>
  );
};

export default Player;
