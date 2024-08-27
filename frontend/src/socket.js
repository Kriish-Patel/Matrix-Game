import { io } from 'socket.io-client';
import React, { useEffect } from 'react';

const socket = io('https://headlines-game.onrender.com', {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
});

useEffect(() => {
  socket.on('session', ({ sessionID, userID }) => {
    console.log("waterfall")
    console.log(`session socket received, sessionID: ${sessionID}`)
    // Attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // Store it in the sessionStorage
    sessionStorage.setItem('sessionID', sessionID);
    // Save the ID of the user
    socket.sessionID = sessionID;
  });
  const sessionID = sessionStorage.getItem('sessionID');
  console.log(`sessionID before reconnection ${sessionID}`);
  if (sessionID) {
    socket.auth = { sessionID };
    socket.connect();
    console.log(`sessionID and we have reconnected: ${sessionID}`);
  }
}, []); // Empty dependency array ensures this runs only once when the app starts





export default socket;
