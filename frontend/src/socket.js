import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  autoConnect: false, // Do not connect automatically
  // withCredentials:true,
});





export default socket;
