import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const GameTimer = () => {
    const [startTime, setStartTime] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [isPaused, setIsPaused] = useState(false);
    const [pauseStartTime, setPauseStartTime] = useState(null);
    const [totalPausedTime, setTotalPausedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPaused) {
                setCurrentTime(Date.now());
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused]);

    useEffect(() => {
        socket.on('gamePaused', ({ isPaused: newPausedState }) => {
            setIsPaused(newPausedState);
            if (newPausedState) {
                setPauseStartTime(Date.now());
            } else if (pauseStartTime) {
                const pauseDuration = Date.now() - pauseStartTime;
                setTotalPausedTime(prevTotal => prevTotal + pauseDuration);
                setStartTime(prevStart => prevStart + pauseDuration);
                setPauseStartTime(null);
            }
        });

        return () => {
            socket.off('gamePaused');
        };
    }, [pauseStartTime]);

    const getElapsedTimeInMinutes = (start, current) => {
        return Math.floor((current - start - totalPausedTime) / 60000);
    };

    const calculateGameYear = (m) => {
        const intermediateValue = Math.exp(0.027 * m) - 1;
        const gameYear = 2025 + 3.6 * intermediateValue;
        return gameYear;
    };

    const elapsedTimeInMinutes = getElapsedTimeInMinutes(startTime, currentTime);
    const gameYear = calculateGameYear(elapsedTimeInMinutes);

    useEffect(() => {
        if (!isPaused) {
            socket.emit('updateCurrentYear', { currentYear: gameYear.toFixed(0) });
        }
    }, [currentTime, isPaused, gameYear]);

    return (
        <div>
            <p>Current Year: {gameYear.toFixed(0)}</p>
            {isPaused && <p>Game Paused</p>}
        </div>
    );
};

export default GameTimer;