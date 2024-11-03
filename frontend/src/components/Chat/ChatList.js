import React from 'react';
import './ChatList.css';

function ChatList({ sessions, selectSession, startNewChat, currentSession }) {
  return (
    <div className="chat-list-container">
      <button className="new-chat-button" onClick={startNewChat}>New Chat</button>
      {sessions
      .slice() // 创建 sessions 的副本，防止直接修改原数组
      .sort((a, b) => new Date(b.last_used) - new Date(a.last_used)) // 按 last_used 进行降序排序
      .map((session) => (   
        <div 
          key={session.session_id} 
          onClick={() => selectSession(session)} 
          className={`chat-item ${currentSession?.session_id === session.session_id ? 'active' : ''}`}>
          <div className="text">
            {`${new Date(session.last_used).toLocaleDateString('en-GB')} ${new Date(session.last_used).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
          </div>
          <div className="topic">{session.topic || "No Topic"}</div>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
