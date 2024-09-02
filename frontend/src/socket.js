import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  autoConnect: false, // Do not connect automatically
  'reconnection': true,
  'reconnectionDelay': 500,
  'maxReconnectionAttempts': Infinity
  
});




export default socket;
