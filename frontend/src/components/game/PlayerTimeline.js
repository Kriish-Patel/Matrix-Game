import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import '../../styles/GlobalTimeline.css';

const PlayerTimeline = () => {
    const [playerHeadlines, setPlayerHeadlines] = useState([]); // [headline, plausibility, quality, status], 
                                                                // status: pending, success, failed

    useEffect(() => {
        socket.on('updatePlayerStatus', ({ headline, status }) => {
            setPlayerHeadlines(prevHeadlines => {
                const headlineIndex = prevHeadlines.findIndex(h => h.headline === headline);

                if (headlineIndex !== -1) {
                    // If the headline exists, update its status
                    prevHeadlines[headlineIndex].status = status;
                    
                    return [...prevHeadlines]; // Return the same array reference with the updated headline
                } else {
                    // If the headline does not exist, add it to the array
                    return [{ headline, status, plausibility: '', quality: '' }, ...prevHeadlines];
                }
            });
        });

        socket.on('sendHeadlineScore', ({ headline, plausibility, quality }) => {
            setPlayerHeadlines(prevHeadlines => {
                const headlineIndex = prevHeadlines.findIndex(h => h.headline === headline);

                if (headlineIndex !== -1) {
                    // If the headline exists, update its plausibility and quality scores
                    prevHeadlines[headlineIndex].plausibility = plausibility;
                    prevHeadlines[headlineIndex].quality = quality;
                }
                return [...prevHeadlines];
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
                        <th>Quality</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {playerHeadlines.map((item, index) => (
                        <tr key={index}>
                            <td>{item.headline}</td>
                            <td>{item.plausibility}</td>
                            <td>{item.quality}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerTimeline;
