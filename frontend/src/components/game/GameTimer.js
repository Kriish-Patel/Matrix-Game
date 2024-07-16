import React, { useState, useEffect } from 'react';

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
        console.log(`Intermediate Value: ${intermediateValue}`);
        console.log(`Game Year: ${gameYear}`);
        return gameYear;
    };

    const elapsedTimeInMinutes = getElapsedTimeInMinutes(startTime, currentTime);
    const gameYear = calculateGameYear(elapsedTimeInMinutes);

    useEffect(() => {
        console.log(`start time: ${startTime}`);
        console.log(`current time: ${currentTime}`);
        console.log(`Elapsed minutes: ${elapsedTimeInMinutes}`);
        console.log(`Calculated game year: ${gameYear}`);
    }, [currentTime]); // Update dependency to currentTime

    return (
        <div>
            <p>Current Year: {gameYear.toFixed(0)}</p>
        </div>
    );
};

export default GameTimer;
