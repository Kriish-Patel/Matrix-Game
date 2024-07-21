// frontend/src/components/game/EndGameScreen.js
import React, {useEffect, useState} from 'react';
import { useLocation, useParams} from 'react-router-dom';
import GlobalTimeline from './GlobalTimeline'
import socket from '../../socket';
import '../../styles/EndGameScreen.css';
import '../../styles/App.css';

const EndGameScreen = () => {
  const location = useLocation();
  const { lobbyId } = useParams();
  const { players } = location.state || { players: [] };
  console.log(`results: ${players}`)

  // Sort the results by score in descending order
  const sortedResults = [...players].sort((a, b) => b.score - a.score);
  const [acceptedHeadlines, setAcceptedHeadlines] = useState([])

  useEffect(() => {
    socket.on('toEndGame', ({ acceptedHeadlines}) => {
        
      const headlinesArray = Object.entries(acceptedHeadlines)
      .map(([headline, currentYear]) => ({ headline, currentYear }))
      .reverse(); // Reverse the order to show the latest first
    setAcceptedHeadlines(headlinesArray);
    });

    return () => {
        socket.off('toEndGame');
    };
}, []); 

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
      <div>
        <h1>Accepted Headlines</h1>
        <table className="global-timeline-table">
          <thead>
            <tr>
              <th>Headline</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {acceptedHeadlines.map((item, index) => (
              <tr key={index}>
                <td>{item.headline}</td>
                <td>{item.currentYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
    

  );
};

export default EndGameScreen;