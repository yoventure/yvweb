import React from 'react';
import './ChatList.css';

function ChatList({ sessions, selectSession, startNewChat}) {
  return (
    <div className="chat-list-container">
      <button className="new-chat-button" onClick={startNewChat}>New Chat</button>
      {sessions.map((session, index) => (
        <div key={session.session_id || index} onClick={() => selectSession(session)} className="chat-item">
          <div className="text">{session.date.toLocaleString()}</div>
          <div className="topic">{session.topic || "No Topic"}</div>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
