import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import '../../styles/GlobalTimeline.css';

const PlayerTimeline = () => {
    const [playerHeadlines, setPlayerHeadlines] = useState(() => {
        const savedHeadlines = localStorage.getItem('playerHeadlines');
        return savedHeadlines ? JSON.parse(savedHeadlines) : [];
    });

    useEffect(() => {
        socket.on('updatePlayerStatus', ({ headline, status }) => {
            setPlayerHeadlines(prevHeadlines => {
                const headlineIndex = prevHeadlines.findIndex(h => h.headline === headline);
                
                let updatedHeadlines;
                if (headlineIndex !== -1) {
                    // If the headline exists, update its status
                    prevHeadlines[headlineIndex].status = status;
                    updatedHeadlines = [...prevHeadlines];
                } else {
                    // If the headline does not exist, add it to the array
                    updatedHeadlines = [{ headline, status }, ...prevHeadlines];
                }
                localStorage.setItem('playerHeadlines', JSON.stringify(updatedHeadlines));
                return updatedHeadlines;
            });
        });
        
        socket.on('sendHeadlineScore', ({ headline, plausibility }) => {
            setPlayerHeadlines(prevHeadlines => {
                const headlineIndex = prevHeadlines.findIndex(h => h.headline === headline);
                
                if (headlineIndex !== -1) {
                    prevHeadlines[headlineIndex].plausibility = plausibility;
                    const updatedHeadlines = [...prevHeadlines];
                    localStorage.setItem('playerHeadlines', JSON.stringify(updatedHeadlines));
                    return updatedHeadlines;
                }
                return prevHeadlines;
            });
        });

        return () => {
            socket.off('updatePlayerStatus');
            socket.off('sendHeadlineScore');
        };
    }, []); 

    return (
        <div>
            <h1>Your Headlines</h1>
            <table className="global-timeline-table">
                <thead>
                    <tr>
                        <th>Headline</th>
                        <th>Plausibility</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {playerHeadlines.map((item, index) => (
                        <tr key={index}>
                            <td>{item.headline}</td>
                            <td>{item.plausibility}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerTimeline;
