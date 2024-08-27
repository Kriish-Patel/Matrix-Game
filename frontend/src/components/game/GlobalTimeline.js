import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import '../../styles/GlobalTimeline.css';

const GlobalTimeline = () => {
    const [acceptedHeadlines, setAcceptedHeadlines] = useState(() => {
        const savedHeadlines = localStorage.getItem('acceptedHeadlines');
        return savedHeadlines ? JSON.parse(savedHeadlines) : [
            { headline: 'Driverless Taxi trial blamed for spike in road deaths', currentYear: 2025, plausibility: 60 },
            { headline: 'AI Curator debuts exhibition at Venice Biennale', currentYear: 2025, plausibility: 80 },
            { headline: 'AI improves weather forecasting accuracy from 90% to 93%', currentYear: 2025, plausibility: 70 },
            { headline: 'AI eSports tournaments are the new Formula 1', currentYear: 2025, plausibility: 75 },
            { headline: 'Rishi Sunak appointed chair of UK AI Ethics Board', currentYear: 2025, plausibility: 85 },
            { headline: 'AI Healthcare Insurance Advisor reduces costs by 20%', currentYear: 2025, plausibility: 75 },
            { headline: 'Century-old Maths Problem solved by AI with ‘elegant proof', currentYear: 2025, plausibility: 30 },
            { headline: 'AI Composer’s Symphony premieres at Carnegie Hall', currentYear: 2025, plausibility: 95 },
            { headline: 'Stock Market ‘flash crash’ averted by AI monitoring', currentYear: 2025, plausibility: 88 }
        ];
    });

    useEffect(() => {
        socket.on('acceptedHeadline', ({ headline, currentYear, plausibility }) => {
            setAcceptedHeadlines(prevHeadlines => {
                const updatedHeadlines = [{ headline, currentYear, plausibility }, ...prevHeadlines];
                localStorage.setItem('acceptedHeadlines', JSON.stringify(updatedHeadlines));
                return updatedHeadlines;
            });
        });

        return () => {
            socket.off('acceptedHeadline');
        };
    }, []);

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
