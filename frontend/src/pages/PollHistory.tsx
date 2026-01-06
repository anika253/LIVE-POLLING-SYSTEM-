import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Poll } from '../types';
import './PollHistory.css';

const PollHistory: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/polls/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch polls');
      }
      const data = await response.json();
      setPolls(data);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load poll history');
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = (poll: Poll): number => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-message">Loading poll history...</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">View Poll History</h1>
        <button onClick={() => navigate('/teacher/poll')} className="back-button">
          Back to Poll
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="no-history">
          <p>No poll history available.</p>
        </div>
      ) : (
        <div className="polls-list">
          {polls.map((poll, index) => {
            const totalVotes = getTotalVotes(poll);
            return (
              <div key={poll._id} className="poll-history-item">
                <div className="poll-history-header">
                  <h3 className="poll-history-question">{poll.question}</h3>
                  <span className="poll-history-status">{poll.status}</span>
                </div>
                <div className="poll-history-results">
                  {poll.options.map((option, optIndex) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                      <div key={optIndex} className="history-result-item">
                        <div className="history-result-header">
                          <span className="history-result-option">{option.text}</span>
                          <span className="history-result-percentage">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="history-progress-bar-container">
                          <div
                            className="history-progress-bar"
                            style={{ width: `${percentage}%`, backgroundColor: '#7765DA' }}
                          />
                        </div>
                        <div className="history-result-votes">
                          {option.votes} vote{option.votes !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="poll-history-footer">
                  <span className="poll-history-date">
                    Created: {new Date(poll.createdAt).toLocaleString()}
                  </span>
                  <span className="poll-history-total">Total Votes: {totalVotes}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PollHistory;

