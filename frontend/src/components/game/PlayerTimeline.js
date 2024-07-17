import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const PlayerTimeline = () => {
    const [playerHeadlines, setPlayerHeadlines] = useState([]); // [headline, status], 
                                                                //status: pending, accepted, rejected

    useEffect(() => {
        socket.on('updatePlayerStatus', ({ socketId, headlineId, headline, status }) => {
            console.log(`Player ${socketId} changed status to ${status} for headline ${headlineId}, ${headline}`);
      
        });
        
        socket.on('receivePlayerHeadline', ({ headline, status}) => {
            setPlayerHeadlines(prevHeadlines => [{ headline, status }, ...prevHeadlines]);
        });

        return () => {
            socket.off('receivePlayerHeadline');
        };
    }, []); 

    return (
        <div>
        <h1>Your Headlines</h1>
        <table>
            <thead>
                <tr>
                    <th>Headline</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {playerHeadlines.map((item, index) => (
                    <tr key={index}>
                        <td>{item.headline}</td>
                        <td>{item.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

export default PlayerTimeline;
