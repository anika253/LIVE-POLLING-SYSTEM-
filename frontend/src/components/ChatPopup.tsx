import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { storage, STORAGE_KEYS } from '../utils/storage';
import './ChatPopup.css';

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isTeacher: boolean;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose, isTeacher }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const studentName = storage.get(STORAGE_KEYS.STUDENT_NAME) || 'Anonymous';

  useEffect(() => {
    if (!socket || !isOpen) return;

    socket.on('chat:message', (data: { sender: string; message: string; isTeacher: boolean; timestamp: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          sender: data.sender,
          message: data.message,
          timestamp: new Date(data.timestamp),
          isTeacher: data.isTeacher,
        },
      ]);
    });

    return () => {
      socket.off('chat:message');
    };
  }, [socket, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !inputMessage.trim()) return;

    const messageData = {
      sender: studentName,
      message: inputMessage.trim(),
      isTeacher,
    };

    socket.emit('chat:send', messageData);
    setInputMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-popup" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3 className="chat-title">Chat</h3>
          <button className="chat-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.isTeacher ? 'teacher-message' : 'student-message'}`}
              >
                <div className="message-sender">{msg.sender}</div>
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            autoFocus
          />
          <button type="submit" className="chat-send-button" disabled={!inputMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPopup;

