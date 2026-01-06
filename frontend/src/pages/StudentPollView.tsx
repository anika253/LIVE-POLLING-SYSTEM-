import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { Poll, PollState } from '../types';
import WaitingScreen from './WaitingScreen';
import ChatPopup from '../components/ChatPopup';
import './PollView.css';

const StudentPollView: React.FC = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [pollState, setPollState] = useState<PollState>({ poll: null, remainingTime: 0, hasVoted: false });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const { timeLeft, start, reset, formatTime } = usePollTimer(0, () => {
    // Timer expired
    if (pollState.poll && !pollState.hasVoted) {
      toast.error('Time expired! You missed this question.');
    }
  });

  useEffect(() => {
    const storedName = storage.get(STORAGE_KEYS.STUDENT_NAME);
    const storedId = storage.get(STORAGE_KEYS.STUDENT_ID);

    if (!storedName) {
      navigate('/student/onboarding');
      return;
    }

    setStudentName(storedName);
    setStudentId(storedId);

    if (!socket) return;

    // Request current state for recovery
    socket.emit('state:request');

    // Register student
    socket.emit('student:join', {
      name: storedName,
      studentId: storedId || undefined,
    });

    socket.on('student:registered', (data: { studentId: string; name: string }) => {
      storage.set(STORAGE_KEYS.STUDENT_ID, data.studentId);
      setStudentId(data.studentId);
    });

    socket.on('poll:active', (data: { poll: Poll; remainingTime: number }) => {
      setPollState({ poll: data.poll, remainingTime: data.remainingTime, hasVoted: false });
      reset(data.remainingTime);
      start(data.remainingTime);
    });

    socket.on('poll:created', (data: { poll: Poll; remainingTime: number }) => {
      setPollState({ poll: data.poll, remainingTime: data.remainingTime, hasVoted: false });
      setSelectedOption(null);
      reset(data.remainingTime);
      start(data.remainingTime);
    });

    socket.on('poll:updated', (data: { poll: Poll; remainingTime: number }) => {
      setPollState((prev) => ({
        ...prev,
        poll: data.poll,
        remainingTime: data.remainingTime,
      }));
    });

    socket.on('poll:ended', (data: { poll: Poll }) => {
      setPollState({ poll: data.poll, remainingTime: 0, hasVoted: true });
      reset(0);
    });

    socket.on('state:response', (data: PollState) => {
      if (data.poll) {
        setPollState(data);
        if (data.remainingTime > 0 && !data.hasVoted) {
          reset(data.remainingTime);
          start(data.remainingTime);
        } else {
          reset(0);
        }
      }
    });

    socket.on('error', (data: { message: string }) => {
      toast.error(data.message);
    });

    socket.on('vote:success', () => {
      setPollState((prev) => ({ ...prev, hasVoted: true }));
      toast.success('Vote submitted successfully!');
    });

    socket.on('student:removed', () => {
      toast.error('You have been removed from the poll');
      storage.clear();
      navigate('/');
    });

    return () => {
      socket.off('student:registered');
      socket.off('poll:active');
      socket.off('poll:created');
      socket.off('poll:updated');
      socket.off('poll:ended');
      socket.off('state:response');
      socket.off('error');
      socket.off('vote:success');
      socket.off('student:removed');
    };
  }, [socket, navigate, start, reset]);

  const handleVote = () => {
    if (!socket || !pollState.poll || selectedOption === null || pollState.hasVoted) {
      return;
    }

    if (timeLeft <= 0) {
      toast.error('Time has expired!');
      return;
    }

    socket.emit('poll:vote', {
      pollId: pollState.poll._id,
      optionIndex: selectedOption,
    });
  };

  if (!isConnected) {
    return (
      <div className="poll-container">
        <div className="loading-message">Connecting to server...</div>
      </div>
    );
  }

  if (!pollState.poll) {
    return <WaitingScreen />;
  }

  const totalVotes = pollState.poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="poll-container">
      <div className="poll-header">
        <h2 className="poll-title">Question 1</h2>
        {timeLeft > 0 && <div className="timer">{formatTime()}</div>}
      </div>

      <div className="question-section">
        <h3 className="question-text">{pollState.poll.question}</h3>
      </div>

      {pollState.hasVoted || timeLeft === 0 ? (
        <div className="results-section">
          <h4 className="results-title">Poll Results</h4>
          {pollState.poll.options.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span className="result-option">{option.text}</span>
                  <span className="result-percentage">{percentage.toFixed(0)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${percentage}%`, backgroundColor: '#7765DA' }}
                  />
                </div>
                <div className="result-votes">{option.votes} vote{option.votes !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
          <p className="wait-message">Wait for the teacher to ask a new question.</p>
        </div>
      ) : (
        <div className="options-section">
          {pollState.poll.options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name="poll-option"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="option-radio"
              />
              <span className="option-text">{option.text}</span>
            </label>
          ))}
          <button
            onClick={handleVote}
            disabled={selectedOption === null || timeLeft === 0}
            className="submit-vote-button"
          >
            Submit
          </button>
        </div>
      )}

      {/* Chat Button */}
      <button
        className="chat-floating-button"
        onClick={() => setShowChat(true)}
        title="Open Chat"
      >
        💬
      </button>

      {/* Chat Popup */}
      <ChatPopup isOpen={showChat} onClose={() => setShowChat(false)} isTeacher={false} />
    </div>
  );
};

export default StudentPollView;

