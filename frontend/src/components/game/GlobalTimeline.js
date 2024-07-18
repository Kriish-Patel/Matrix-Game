import React, { useState, useEffect } from 'react';
import socket from '../../socket';

// Show only the accepted headlines
const GlobalTimeline = () => {
    const [acceptedHeadlines, setAcceptedHeadlines] = useState([]);

    useEffect(() => {
        socket.on('acceptedHeadline', ({ headline, currentYear }) => {
            console.log("say drake");
            setAcceptedHeadlines(prevHeadlines => [{ headline, currentYear }, ...prevHeadlines]);
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
                        <th>Year</th>
                    </tr>
                </thead>
                <tbody>
                    {acceptedHeadlines.map((item, index) => (
                        <tr key={index}>
                            <td>{item.headline}</td>
                            <td>{item.currentYear}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GlobalTimeline;
