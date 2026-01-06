import React from 'react';
import './WaitingScreen.css';

const WaitingScreen: React.FC = () => {
  return (
    <div className="waiting-container">
      <div className="waiting-content">
        <div className="spinner"></div>
        <p className="waiting-text">Wait for the teacher to ask questions...</p>
      </div>
    </div>
  );
};

export default WaitingScreen;

