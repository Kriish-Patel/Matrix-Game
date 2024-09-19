import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import '../../styles/GlobalTimeline.css';

const GlobalTimeline = ({acceptedHeadlines}) => {
    

    return (
        <div>
            <h1>Accepted Headlines</h1>
            <div className="scrollable-container">
                <table className="global-timeline-table">
                    <thead>
                        <tr>
                            <th>Headline</th>
                            <th>Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {acceptedHeadlines.map((item, index) => (
                            <tr key={index}>
                                <td style={{ color: item.plausibility < 50 ? 'red' : 'white' }}>
                                    {item.headline}
                                </td>
                                <td>{item.currentYear}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GlobalTimeline;
