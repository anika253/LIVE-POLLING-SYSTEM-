import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStudentClick = () => {
    navigate('/student/onboarding');
  };

  const handleTeacherClick = () => {
    navigate('/teacher/onboarding');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Welcome to the Live Polling System</h1>
        <div className="welcome-buttons">
          <button className="role-button student-button" onClick={handleStudentClick}>
            I'm a Student
          </button>
          <button className="role-button teacher-button" onClick={handleTeacherClick}>
            I'm a Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;

