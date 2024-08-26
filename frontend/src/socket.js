import { io } from 'socket.io-client';

const socket = io('https://headlines-game.onrender.com', {
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
});





export default socket;
