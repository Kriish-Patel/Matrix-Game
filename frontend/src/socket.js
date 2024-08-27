import { io } from 'socket.io-client';
import React, { useEffect } from 'react';

const socket = io('https://headlines-game.onrender.com', {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
});





export default socket;
