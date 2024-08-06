import React from 'react';
import './ChatContent.css';

function ChatContent({ chatHistory }) {
  return (
    <div className="chat-content">
      {chatHistory.map((chat) => (
        <div key={chat.id} className={`chat-message ${chat.isUser !== undefined ? (chat.isUser ? 'user' : 'system') : (chat.role === 'user' ? 'user' : 'system')}`}>
          <div className="message-text">{chat.message || chat.content}</div>
          {/* <div className="message-date">{new Date(chat.date).toLocaleString()}</div> */}
        </div>
      ))}
    </div>
  );
}

export default ChatContent;
