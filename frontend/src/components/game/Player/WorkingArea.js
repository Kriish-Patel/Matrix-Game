import React, { useState } from 'react';

const WorkingArea = ({ setHeadline }) => {
  const [drafts, setDrafts] = useState(['', '', '']);

  const handleInputChange = (index, value) => {
    const newDrafts = [...drafts];
    newDrafts[index] = value;
    setDrafts(newDrafts);
  };

  const copyToSubmission = (index) => {
    setHeadline(drafts[index]);
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
