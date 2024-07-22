// frontend/src/components/game/EndGameScreen.js
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FinalTimeline from './FinalTimeline'

const EndGameScreen = () => {
  const location = useLocation();
  const { lobbyId } = useParams();
  const { players } = location.state || { players: [] };
  console.log(`results: ${players}`)

  // Sort the results by score in descending order
  const sortedResults = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="main-container">
      <h2>Game Over</h2>
      <h3>Final Scores</h3>
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
              <td>{player.name}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <FinalTimeline />
    </div>
    

  );
};

export default EndGameScreen;