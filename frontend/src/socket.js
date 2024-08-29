import { io } from 'socket.io-client';
import React, { useEffect } from 'react';

const socket = io('https://headlines-game.onrender.com', {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
  // reconnection: true,   
  // auth: {
  //   sessionID: localStorage.getItem('sessionID') || undefined, // Retrieve sessionID from localStorage if it exists
  // },          // Enable reconnection
  // reconnectionAttempts: Infinity, // Number of attempts before giving up
  // reconnectionDelay: 1000,        // Initial delay before the first attempt
  // reconnectionDelayMax: 5000,     // Maximum delay between reconnections
  // timeout: 20000,  
});





export default socket;
