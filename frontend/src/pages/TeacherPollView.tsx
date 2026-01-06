import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { Poll, PollState } from '../types';
import ChatPopup from '../components/ChatPopup';
import './PollView.css';
import './TeacherPollView.css';

const TeacherPollView: React.FC = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [pollState, setPollState] = useState<PollState>({ poll: null, remainingTime: 0 });
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<Array<{ studentId: string; name: string }>>([]);

  const { timeLeft, start, reset, formatTime } = usePollTimer(0);

  useEffect(() => {
    const storedName = storage.get(STORAGE_KEYS.STUDENT_NAME);
    if (!storedName) {
      navigate('/teacher/onboarding');
      return;
    }

    if (!socket) return;

    // Request current state for recovery
    socket.emit('state:request');

    socket.emit('teacher:join');

    socket.on('poll:created', (data: { poll: Poll; remainingTime: number }) => {
      setPollState({ poll: data.poll, remainingTime: data.remainingTime });
      reset(data.remainingTime);
      start(data.remainingTime);
      setShowCreatePoll(false);
      setQuestion('');
      setOptions(['', '']);
    });

    socket.on('poll:updated', (data: { poll: Poll; remainingTime: number }) => {
      setPollState({ poll: data.poll, remainingTime: data.remainingTime });
    });

    socket.on('poll:ended', (data: { poll: Poll }) => {
      setPollState({ poll: data.poll, remainingTime: 0 });
      reset(0);
    });

    socket.on('state:response', (data: PollState) => {
      if (data.poll) {
        setPollState(data);
        if (data.remainingTime > 0) {
          reset(data.remainingTime);
          start(data.remainingTime);
        } else {
          reset(0);
        }
      }
    });

    socket.on('student:joined', (data: { studentId: string; name: string }) => {
      setParticipants((prev) => {
        if (prev.find((p) => p.studentId === data.studentId)) {
          return prev;
        }
        return [...prev, { studentId: data.studentId, name: data.name }];
      });
    });

    socket.on('student:removed', (data: { studentId: string }) => {
      setParticipants((prev) => prev.filter((p) => p.studentId !== data.studentId));
    });

    socket.on('error', (data: { message: string }) => {
      toast.error(data.message);
    });

    return () => {
      socket.off('poll:created');
      socket.off('poll:updated');
      socket.off('poll:ended');
      socket.off('state:response');
      socket.off('error');
    };
  }, [socket, navigate, start, reset]);

  const handleCreatePoll = () => {
    if (!socket) return;

    const validOptions = options.filter((opt) => opt.trim() !== '');
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please provide a question and at least 2 options');
      return;
    }

    socket.emit('poll:create', {
      question: question.trim(),
      options: validOptions,
      duration,
    });
  };

  const handleEndPoll = () => {
    if (!socket || !pollState.poll) return;

    socket.emit('poll:end', { pollId: pollState.poll._id });
    toast.success('Poll ended');
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const totalVotes = pollState.poll
    ? pollState.poll.options.reduce((sum, opt) => sum + opt.votes, 0)
    : 0;

  if (!isConnected) {
    return (
      <div className="poll-container">
        <div className="loading-message">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="poll-container teacher-poll-container">
      <div className="teacher-header">
        <div className="header-left">
          <h2 className="poll-title">Question {questionNumber}</h2>
          {pollState.poll && timeLeft > 0 && <div className="timer">{formatTime()}</div>}
        </div>
        <div className="header-right">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`chat-button ${showChat ? 'active' : ''}`}
            title="Open Chat"
            type="button"
          >
            💬 Chat
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`participants-button ${showParticipants ? 'active' : ''}`}
            title="View Participants"
            type="button"
          >
            👥 Participants
          </button>
          <button
            onClick={() => navigate('/teacher/history')}
            className="history-button"
          >
            View Poll History
          </button>
        </div>
      </div>

      {showCreatePoll ? (
        <div className="create-poll-section">
          <h3 className="section-title">Create New Poll</h3>
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Options</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="form-input"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="remove-option-button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button onClick={handleAddOption} className="add-option-button">
              + Add Option
            </button>
          </div>
          <div className="form-group">
            <label>Duration (seconds, max 60)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
              min="1"
              max="60"
              className="form-input"
            />
          </div>
          <div className="button-group">
            <button onClick={handleCreatePoll} className="create-button">
              Create Poll
            </button>
            <button
              onClick={() => setShowCreatePoll(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : pollState.poll ? (
        <>
          <div className="question-section">
            <h3 className="question-text">{pollState.poll.question}</h3>
          </div>

          <div className="results-section">
            <h4 className="results-title">Live Results</h4>
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
                  <div className="result-votes">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
            <div className="total-votes">Total Votes: {totalVotes}</div>
          </div>

          <div className="teacher-actions">
            <button onClick={handleEndPoll} className="end-poll-button">
              End Poll
            </button>
            <button
              onClick={() => setShowCreatePoll(true)}
              className="new-question-button"
              disabled={pollState.poll.status === 'active' && timeLeft > 0}
            >
              Add a new question
            </button>
          </div>
        </>
      ) : (
        <div className="no-poll-section">
          <p className="no-poll-text">No active poll. Create one to get started!</p>
          <button onClick={() => setShowCreatePoll(true)} className="create-first-poll-button">
            Create Poll
          </button>
        </div>
      )}

      {/* Chat Popup */}
      <ChatPopup isOpen={showChat} onClose={() => setShowChat(false)} isTeacher={true} />

      {/* Participants Modal */}
      {showParticipants && (
        <div className="participants-overlay" onClick={() => setShowParticipants(false)}>
          <div className="participants-modal" onClick={(e) => e.stopPropagation()}>
            <div className="participants-header">
              <h3>Participants</h3>
              <button className="participants-close" onClick={() => setShowParticipants(false)}>
                ×
              </button>
            </div>
            <div className="participants-list">
              {participants.length === 0 ? (
                <div className="no-participants">No participants yet</div>
              ) : (
                participants.map((participant) => (
                  <div key={participant.studentId} className="participant-item">
                    <span className="participant-name">{participant.name}</span>
                    <button
                      className="remove-participant-button"
                      onClick={() => {
                        if (socket && window.confirm(`Remove ${participant.name}?`)) {
                          socket.emit('student:remove', { studentId: participant.studentId });
                          setParticipants((prev) =>
                            prev.filter((p) => p.studentId !== participant.studentId)
                          );
                          toast.success(`${participant.name} has been removed`);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPollView;

