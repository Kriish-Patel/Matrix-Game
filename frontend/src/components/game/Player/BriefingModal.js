// frontend/src/components/game/BriefingModal.js
import React from 'react';
import ReactModal from 'react-modal';

const BriefingModal = ({ isOpen, onRequestClose, briefing, planet }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Player Briefing"
      className="modal"
      overlayClassName="modal-overlay"
      appElement={document.getElementById('root') || undefined}
    >
      <div className="modal-content">
        <button onClick={onRequestClose}>Close</button>
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
  );
};

export default BriefingModal;
