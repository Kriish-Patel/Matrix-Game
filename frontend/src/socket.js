import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  autoConnect: false, // Do not connect automatically
  
  
});

socket.on('session', ({ sessionID, userID }) => {
  console.log(`session socket received, sessionID: ${sessionID}`)
  // Attach the session ID to the next reconnection attempts
  socket.auth = { sessionID };
  // Store it in the localStorage
  localStorage.setItem('sessionID', sessionID);
  // Save the ID of the user
  socket.userID = userID;
});



export default socket;
