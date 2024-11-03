import React, { useState } from 'react';
import './GroupDiscuss.css';
import { useUser } from '../../UserContext'; // 引入 useUser

import config from '../../config'; // 引入 config.js

const Url = config.apiUrl;

function GroupDiscuss() {
    const { user } = useUser(); // Use the user context if applicable
    const [message, setMessage] = useState('');
    const [isAgent, setIsAgent] = useState(false);

  
    const handleSendMessage = () => {
      if (message.trim()) {
        console.log("Message sent:", message); // Replace with actual send logic
        setMessage(''); // Clear the input after sending
      }
    };

    const handleToggle = () => {
        setIsAgent(!isAgent); // Toggle the state
      };
    
  
    return (
      <div className="group-discuss">
        <div className="group-header">
          <h2>Go Tokyo!</h2>
          <div className="group-info">
            <span>8 Members</span>
            <span className="online-status">2 Online</span>
          </div>
        </div>
        <div className="chat-area">
          {/* Chat messages will go here */}
          <div className="empty-chat">
            <p>No messages yet.</p>
          </div>
        </div>
        <div className="message-input">
          <button className="add-button">+</button>
          <input 
            type="text" 
            placeholder="Type here..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />
          <button className="send-button" onClick={handleSendMessage}>Send</button>
          <div className="agent-status-container" onClick={handleToggle}>
            <span className="agent-status-check">Agent</span>
            <div className="agent-status-check-container">
            <div
                className="agent-status-check-toggle"
                style={{ left: isAgent ? 'calc(50% - 3px)' : '3px' }}
            />
        </div>
        </div>
        </div>
      </div>
    );
  }
  
  export default GroupDiscuss;