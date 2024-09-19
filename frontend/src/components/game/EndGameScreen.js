// frontend/src/components/game/EndGameScreen.js
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import '../../styles/EndGameScreen.css';
import GlobalTimeline from './GlobalTimeline';

const EndGameScreen = () => {
  const location = useLocation();
  const { lobbyId } = useParams();
  const { players, acceptedHeadlines } = location.state || { players: [] };
  console.log(`results: ${JSON.stringify(players, null, 2)}`);
  
  // Sort the results by score in descending order
  const sortedResults = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="mainy-container">
      <div className="title">
        <h1>Game Over!</h1>
      </div>
      <div className="left-container">
        <div className="text-container">
          <h2>Scoreboard</h2>
        </div>
        <div className="scores-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((player, index) => (
                <tr key={player.id}>
                  <td>{index + 1}</td>
                  <td>{player.planet}</td>
                  <td>{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="right-container">
        <GlobalTimeline acceptedHeadlines={acceptedHeadlines} />
      </div>
    </div>
    

  );
};

export default EndGameScreen;