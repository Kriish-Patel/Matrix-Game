import React, { useState, useEffect } from 'react';
import socket from '../../socket'; // Ensure this is the correct path to your socket instance

// Helper function to calculate the current month and year
const calculateCurrentMonthYear = (minutesPassed) => {
  const y = 2026.05 + 6.4 * (Math.exp(0.02 * minutesPassed) - 1);
  const year = Math.floor(y);
  const month = Math.ceil(12 * (y - year));
  return { month, year };
};

const GameTimer = () => {
  const [minutesPassed, setMinutesPassed] = useState(0);
  const [currentDate, setCurrentDate] = useState(calculateCurrentMonthYear(0));

  useEffect(() => {
    // Increment the minutesPassed state every minute
    const interval = setInterval(() => {
      setMinutesPassed(prev => prev + 1);
    }, 60000); // 60000 milliseconds = 1 minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const date = calculateCurrentMonthYear(minutesPassed);
    setCurrentDate(date);

    // Emit the current year to the backend using socket
    socket.emit('updateCurrentYear', { currentYear: date.year.toFixed(0) });

  }, [minutesPassed]);

  return (
    
      <h2>Current Date: {`${currentDate.month.toString().padStart(2, '0')}/${currentDate.year}`}</h2>
    
  );
};

export default GameTimer;
