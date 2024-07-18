// frontend/src/components/game/EndGameScreen.js
import React from 'react';

const EndGameScreen = ({ playerScores }) => {
  const sortedScores = [...playerScores].sort((a, b) => b.score - a.score);

  return (
    <div className="end-game-screen">
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
          {sortedScores.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EndGameScreen;