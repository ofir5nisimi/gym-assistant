import { useState, useEffect } from 'react';
import './Toast.css';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

function Toast({ message, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(message.id);
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message.id, message.duration, onRemove]);

  return (
    <div className={`toast toast-${message.type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {message.type === 'success' && '✅'}
          {message.type === 'error' && '❌'}
          {message.type === 'info' && 'ℹ️'}
        </span>
        <span className="toast-message">{message.message}</span>
      </div>
      <button 
        onClick={() => onRemove(message.id)}
        className="toast-close"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  );
}
