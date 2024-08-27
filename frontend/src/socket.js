import { io } from 'socket.io-client';

const socket = io('https://headliners-backend.vercel.app', {
  transports: ['websocket', 'polling'],
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
});





export default socket;
