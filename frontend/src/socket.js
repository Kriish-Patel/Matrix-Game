import { io } from 'socket.io-client';

const socket = io('https://headliners-backend-2nigudq3x-aymans-projects-f9d1fc59.vercel.app/', {
  autoConnect: false, // Do not connect automatically
  // withCredentials:true,
});





export default socket;
