import { io } from 'socket.io-client';
//http://localhost:5001
const socket = io('https://headlines-game.onrender.com', {
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
  'reconnection': true,
  'reconnectionDelay': 500,
  'maxReconnectionAttempts': Infinity
});




export default socket;
