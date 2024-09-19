import React, { useState, useEffect } from 'react';
import socket from '../../../socket';

import '../../../styles/Player.css';

import GlobalTimeline from '../GlobalTimeline';
import PlayerTimeline from '../PlayerTimeline';
import PauseOverlay from '../PauseOverlay';
import BriefingModal from './BriefingModal';
import SubmitHeadlineForm from './SubmitHeadlineForm';
import AverageScoreDisplay from './AverageScore';
import WorkingArea from './WorkingArea';

const Player = ({ planet, acceptedHeadlines }) => {
  // Initialize states from sessionStorage or default values
  const [headline, setHeadline] = useState(() => sessionStorage.getItem('headline') || '');
  const [briefing, setBriefing] = useState(() => JSON.parse(sessionStorage.getItem('briefing')) || null);
  const [isModalOpen, setIsModalOpen] = useState(() => JSON.parse(sessionStorage.getItem('isModalOpen')) || false);
  const [hasPendingHeadline, setHasPendingHeadline] = useState(() => JSON.parse(sessionStorage.getItem('hasPendingHeadline')) || false);
  const [canRollDice, setCanRollDice] = useState(() => JSON.parse(sessionStorage.getItem('canRollDice')) || false);
  const [isPaused, setIsPaused] = useState(() => JSON.parse(sessionStorage.getItem('isPaused')) || false);
  const [playerScore, setPlayerScore] = useState(() => Number(sessionStorage.getItem('playerScore')) || 0);
  const [currentHeadlineID, setCurrentHeadlineID] = useState(() => sessionStorage.getItem('currentHeadlineID') || null);

  useEffect(() => {
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

    socket.on('getHeadlineID', ({ headlineID }) => {
      setCurrentHeadlineID(headlineID);
      sessionStorage.setItem('currentHeadlineID', headlineID);
      console.log(`headlineID received in frontend: ${headlineID}`);
    });

    socket.on('updatePlayerStatus', ({ status }) => {
      if (status === 'success' || status === 'failed') {
        setHasPendingHeadline(false);
        setCanRollDice(false);
        sessionStorage.setItem('hasPendingHeadline', false);
        sessionStorage.setItem('canRollDice', false);
      }
      if (status === 'Roll the dice!') {
        setCanRollDice(true);
        sessionStorage.setItem('canRollDice', true);
      }
    });

    socket.on('updatePlayerScore', ({ score }) => {
      console.log(`new score: ${score}`);
      setPlayerScore(score);
      sessionStorage.setItem('playerScore', score);
    });

    socket.on('gamePaused', ({ isPaused }) => {
      setIsPaused(isPaused);
      sessionStorage.setItem('isPaused', JSON.stringify(isPaused));
    });

    return () => {
      socket.off('updatePlayerStatus');
      socket.off('gamePaused');
    };
  }, [planet]);

  const openModal = () => {
    setIsModalOpen(true);
    sessionStorage.setItem('isModalOpen', true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    sessionStorage.setItem('isModalOpen', false);
  };

  // Save headline state in sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('headline', headline);
  }, [headline]);

  return (
    <div className="main-container">
      {isPaused && <PauseOverlay />}
      <div className="player-timeline-container">
        <PlayerTimeline />
      </div>
      <div className="player-container">
        <div className="player-score">
          Your score: {playerScore}
        </div>
        <AverageScoreDisplay />
        <h2>Enter Headline</h2>
        <SubmitHeadlineForm
          headline={headline}
          setHeadline={setHeadline}
          hasPendingHeadline={hasPendingHeadline}
          setHasPendingHeadline={(value) => {
            setHasPendingHeadline(value);
            sessionStorage.setItem('hasPendingHeadline', JSON.stringify(value));
          }}
          canRollDice={canRollDice}
          setCanRollDice={(value) => {
            setCanRollDice(value);
            sessionStorage.setItem('canRollDice', JSON.stringify(value));
          }}
          headlineID={currentHeadlineID}
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
