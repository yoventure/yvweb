import React, { useState } from 'react';
import './ChatInput.css';

function ChatInput({ sendMessage }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => (e.key === 'Enter' ? handleSend() : null)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default ChatInput;
