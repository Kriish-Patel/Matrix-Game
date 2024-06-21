// frontend/src/components/Game.js
import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import '../App.css';

const socket = io('http://localhost:5001');

const Game = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [role, setRole] = useState(location.state ? location.state.role : '');
  const [headlines, setHeadlines] = useState([]);
  const [roundStage, setRoundStage] = useState('headlineSubmission');

  useEffect(() => {
    console.log('useEffect: Game started with role', { role });

    socket.on('headlinesSubmitted', ({ headlines }) => {
      setHeadlines(headlines);
      setRoundStage('jurorScoring');
    });

    socket.on('headlinesProcessed', ({ headlines }) => {
      setHeadlines(headlines);
      setRoundStage('umpireReview');
    });

    return () => {
      socket.off('headlinesSubmitted');
      socket.off('headlinesProcessed');
    };
  }, [role]);

  const handleSubmitHeadline = (headline) => {
    console.log('handleSubmitHeadline called', { headline });
    socket.emit('submitHeadline', { lobbyId, headline });
  };

  const handleSubmitJurorScores = (scores) => {
    console.log('handleSubmitJurorScores called', { scores });
    socket.emit('submitJurorScores', { lobbyId, scores });
  };

  if (!role) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Game: {lobbyId}</h1>
      <h2>Your role: {role}</h2>

      {role === 'player' && roundStage === 'headlineSubmission' && (
        <div>
          <h2>Enter Headline</h2>
          <input type="text" id="headline" />
          <button onClick={() => handleSubmitHeadline(document.getElementById('headline').value)}>Submit</button>
        </div>
      )}
      {role === 'juror' && roundStage === 'jurorScoring' && (
        <div>
          <h2>Rate Headlines</h2>
          {headlines.map((headline, index) => (
            <div key={index}>
              <p>{headline.headline}</p>
              <input type="number" id={`score-${index}`} min="1" max="100" />
            </div>
          ))}
          <button onClick={() => {
            const scores = {};
            headlines.forEach((headline, index) => {
              scores[headline.headline] = parseInt(document.getElementById(`score-${index}`).value, 10);
            });
            handleSubmitJurorScores(scores);
          }}>Submit Scores</button>
        </div>
      )}
      {role === 'umpire' && roundStage === 'umpireReview' && (
        <div>
          <h2>Review Headlines</h2>
          {headlines.filter(headline => headline.status === 'passed').map((headline, index) => (
            <p key={index}>{headline.headline}</p>
          ))}
        </div>
      )}
      {role === 'player' && roundStage === 'umpireReview' && (
        <div>
          <h2>Review Accepted Headlines</h2>
          {headlines.filter(headline => headline.status === 'passed').map((headline, index) => (
            <p key={index}>{headline.headline}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Game;
