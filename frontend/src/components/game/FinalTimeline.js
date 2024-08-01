import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import '../../styles/GlobalTimeline.css';

const FinalTimeline = ({acceptedHeadlines}) => {
    const [finalAcceptedHeadlines, setFinalAcceptedHeadlines] = useState([]);

    // useEffect(() => {
    //     socket.on('finalTimeline', ({acceptedHeadlines}) => {
    //         const headlinesArray = Object.entries(acceptedHeadlines)
    //             .map(([headline, currentYear]) => ({ headline, currentYear }))
    //             .reverse(); // Reverse the array to show newest headlines at the top
    //         setFinalAcceptedHeadlines(headlinesArray);
    //     });

    //     return () => {
    //         socket.off('finalTimeline');
    //     };
    // }, []); 

    useEffect(() => {
        // Update state when the acceptedHeadlines prop changes
        if (acceptedHeadlines) {
            const headlinesArray = Object.entries(acceptedHeadlines)
                .map(([headline, currentYear]) => ({ headline, currentYear }))
                .reverse(); // Reverse the array to show newest headlines at the top
            setFinalAcceptedHeadlines(headlinesArray);
        }
    }, [acceptedHeadlines]);

    return (
        <div>
            <h1>Accepted Headlines (not sure if everyone can see this)</h1>
            <div className="scrollable-container">
                <table className="global-timeline-table">
                    <thead>
                        <tr>
                            <th>Headline</th>
                            <th>Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalAcceptedHeadlines.map((item, index) => (
                            <tr key={index}>
                                <td>{item.headline}</td>
                                <td>{item.currentYear}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinalTimeline;
