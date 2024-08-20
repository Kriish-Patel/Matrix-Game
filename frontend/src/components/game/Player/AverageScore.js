import React, { useState, useEffect } from 'react';
import socket from '../../../socket';

const AverageScore = () => {
  const [scores, setScores] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [playerCount, setPlayerCount] = useState();

  useEffect(() => {
    // Listen for score updates
    socket.on('updateAverageScore', (newScore) => {
      setScores((prevScores) => {
        const updatedScores = [...prevScores, newScore.score];
        console.log(`newScore: ${newScore}, newlist: ${updatedScores}, data.score: ${newScore.score}`)
        return updatedScores;
      });
    });

    socket.on('sendPlayerCount', (playerCount) => {
      setPlayerCount(playerCount.playerCount)
    })

    // Cleanup on component unmount
    return () => {
      socket.off('updateAverageScore');
    };
  }, []);

  useEffect(() => {
    if (scores.length > 0) {
      const totalScore = scores.reduce((acc, score) => acc + score, 0);
      const avgScore = totalScore / playerCount;
      setAverageScore(avgScore);
    }
  }, [scores]);

  return averageScore.toFixed(2);
};

export default AverageScore;
