import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '../utils/storage';
import './Onboarding.css';

const TeacherOnboarding: React.FC = () => {
  const [name, setName] = useState('');
  const [pollName, setPollName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && pollName.trim()) {
      storage.set(STORAGE_KEYS.STUDENT_NAME, name.trim());
      storage.set(STORAGE_KEYS.ROLE, 'teacher');
      navigate('/teacher/poll');
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Let's Get Started</h1>
        <p className="onboarding-subtitle">Enter your name and create your poll.</p>
        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="pollName">Poll Name</label>
            <input
              id="pollName"
              type="text"
              value={pollName}
              onChange={(e) => setPollName(e.target.value)}
              placeholder="Enter poll name"
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="submit-button">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherOnboarding;

