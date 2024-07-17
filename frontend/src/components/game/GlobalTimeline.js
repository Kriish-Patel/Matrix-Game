import React, { useState, useEffect } from 'react';
import socket from '../../socket';

// Show only the accepted headlines
const GlobalTimeline = () => {
    const [acceptedHeadlines, setAcceptedHeadlines] = useState([]);

    useEffect(() => {
        
        socket.on('acceptedHeadline', ({ headline }) => {
            setAcceptedHeadlines(prevHeadlines => [headline, ...prevHeadlines]);
        });

        return () => {
            socket.off('acceptedHeadline');
        };
    }, []); 

    return (
        <div>
            <h1>Accepted Headlines</h1>
            <table>
                <thead>
                    <tr>
                        <th>Headline</th>
                    </tr>
                </thead>
                <tbody>
                    {acceptedHeadlines.map((headline, index) => (
                        <tr key={index}>
                            <td>{headline}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GlobalTimeline;
