import { io } from 'socket.io-client';

const socket = io('https://headliners-backend.vercel.app/', {
  autoConnect: false, // Do not connect automatically
  withCredentials:true,
});





export default socket;
