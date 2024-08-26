import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const AverageScore = () => {
  const [scores, setScores] = useState(() => {
    const savedScores = sessionStorage.getItem('scores');
    return savedScores ? JSON.parse(savedScores) : [];
  });

  const [averageScore, setAverageScore] = useState(() => {
    const savedAverageScore = sessionStorage.getItem('averageScore');
    return savedAverageScore ? parseFloat(savedAverageScore) : 0;
  });

  const [playerCount, setPlayerCount] = useState(() => {
    const savedPlayerCount = sessionStorage.getItem('playerCount');
    return savedPlayerCount ? parseInt(savedPlayerCount, 10) : 0;
  });

  useEffect(() => {
    // Listen for score updates
    socket.on('updateAverageScore', (newScore) => {
      setScores((prevScores) => {
        const updatedScores = [...prevScores, newScore.score];
        sessionStorage.setItem('scores', JSON.stringify(updatedScores));
        console.log(`newScore: ${newScore}, newlist: ${updatedScores}, data.score: ${newScore.score}`);
        return updatedScores;
      });
    });

    socket.on('sendPlayerCount', (playerCount) => {
      setPlayerCount(playerCount.playerCount);
      sessionStorage.setItem('playerCount', playerCount.playerCount);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('updateAverageScore');
      socket.off('sendPlayerCount');
    };
  }, []);

  useEffect(() => {
    if (scores.length > 0 && playerCount > 0) {
      const totalScore = scores.reduce((acc, score) => acc + score, 0);
      const avgScore = totalScore / playerCount;
      setAverageScore(avgScore);
      sessionStorage.setItem('averageScore', avgScore.toFixed(2));
    }
  }, [scores, playerCount]);

  return averageScore.toFixed(2);
};

export default AverageScore;
