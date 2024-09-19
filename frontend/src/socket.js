import { io } from 'socket.io-client';
import React, { useEffect } from 'react';
//https://headlines-game.onrender.com
const socket = io('http://localhost:5001', {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
  reconnection: true,   
  auth: {
    sessionID: sessionStorage.getItem('sessionID') || undefined, // Retrieve sessionID from sessionStorage if it exists
  },          // Enable reconnection
  reconnectionAttempts: Infinity, // Number of attempts before giving up
  reconnectionDelay: 1000,        // Initial delay before the first attempt
  reconnectionDelayMax: 5000,     // Maximum delay between reconnections
  timeout: 20000,  
});





export default socket;
