import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const GameTimer = () => {
    const [startTime, setStartTime] = useState(Date.now()); // Initialize start time when the component mounts
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000); // Update the current time every second

        return () => clearInterval(timer);
    }, []);

    const getElapsedTimeInMinutes = (start, current) => {
        return Math.floor((current - start) / 60000); // Convert milliseconds to minutes
    };

    const calculateGameYear = (m) => {
        const intermediateValue = Math.exp(0.027 * m) - 1;
        const gameYear = 2025 + 3.6 * intermediateValue;
        
        return gameYear;
    };

    const elapsedTimeInMinutes = getElapsedTimeInMinutes(startTime, currentTime);
    const gameYear = calculateGameYear(elapsedTimeInMinutes);

    useEffect(() => {
        // Send the current year to the back end whenever it updates
        socket.emit('updateCurrentYear', { currentYear: gameYear.toFixed(0) });
      }, [currentTime]); // Update dependency to currentTime
    
    return (
        <div>
            <p>Current Year: {gameYear.toFixed(0)}</p>
        </div>
    );
};

export default GameTimer;
