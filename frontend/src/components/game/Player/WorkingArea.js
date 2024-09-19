import React, { useState, useEffect } from 'react';

const WorkingArea = ({ setHeadline }) => {
  // Initialize drafts from sessionStorage or default to an empty array
  const [drafts, setDrafts] = useState(() => {
    const savedDrafts = sessionStorage.getItem('drafts');
    return savedDrafts ? JSON.parse(savedDrafts) : ['', '', ''];
  });

  useEffect(() => {
    // Save drafts to sessionStorage whenever they change
    sessionStorage.setItem('drafts', JSON.stringify(drafts));
  }, [drafts]);

  const handleInputChange = (index, value) => {
    const newDrafts = [...drafts];
    newDrafts[index] = value;
    setDrafts(newDrafts); // Update state and trigger saving to sessionStorage
  };

  const copyToSubmission = (index) => {
    setHeadline(drafts[index]); // Copy the selected draft to the submission input
  };

  return (
    <div className="working-area">
      <h3>Working Area</h3>
      {drafts.map((draft, index) => (
        <div key={index} className="draft-container">
          <input
            type="text"
            value={draft}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`Draft headline ${index + 1}`}
            className="draft-input"
          />
          <button onClick={() => copyToSubmission(index)} className="copy-button">
            Copy
          </button>
        </div>
      ))}
    </div>
  );
};

export default WorkingArea;
