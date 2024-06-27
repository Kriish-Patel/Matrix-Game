import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Player from './Player';
import Juror from './Juror';
import Umpire from './Umpire';

const socket = io('http://localhost:5001');

const GameManager = () => {
  const { lobbyId } = useParams();
  const location = useLocation(); // Use the useLocation hook
  const [role, setRole] = useState('');
  const [headlines, setHeadlines] = useState([]);
  const [waitingMessage, setWaitingMessage] = useState('Waiting for players to submit headlines...');

  useEffect(() => {
    socket.on('headlinesSubmitted', ({ headlines }) => {
      setHeadlines(headlines);
    });

    socket.on('waitingForHeadlines', ({ message }) => {
      setWaitingMessage(message);
    });

    return () => {
      socket.off('headlinesSubmitted');
      socket.off('waitingForHeadlines');
    };
  }, []);

  useEffect(() => {
    const state = location.state;
    if (state && state.role) {
      setRole(state.role);
    } else {
      console.error('No role found in location state', state);
    }
  }, [location]);

  console.log('Current role:', role);

  if (role === 'player') {
    return <Player lobbyId={lobbyId} />;
  }

  if (role === 'juror') {
    return <Juror lobbyId={lobbyId} headlines={headlines} waitingMessage={waitingMessage} />;
  }

  if (role === 'umpire') {
    return <Umpire lobbyId={lobbyId} waitingMessage={waitingMessage} />;
  }

  return <div>Invalid role</div>;
};

export default GameManager;
