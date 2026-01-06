import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, STORAGE_KEYS } from '../utils/storage';
import './Onboarding.css';

const StudentOnboarding: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if student already registered
    const studentId = storage.get(STORAGE_KEYS.STUDENT_ID);
    const studentName = storage.get(STORAGE_KEYS.STUDENT_NAME);
    
    if (studentId && studentName) {
      // Student already registered, go to poll view
      navigate('/student/poll');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Store name temporarily, will be registered when connecting to socket
      storage.set(STORAGE_KEYS.STUDENT_NAME, name.trim());
      storage.set(STORAGE_KEYS.ROLE, 'student');
      navigate('/student/poll');
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Let's Get Started</h1>
        <p className="onboarding-subtitle">Enter your name and join the poll.</p>
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
          <button type="submit" className="submit-button">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentOnboarding;

