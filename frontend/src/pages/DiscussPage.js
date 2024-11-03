import React, { useState } from 'react';
import './DiscussPage.css';
import { useUser } from '../UserContext'; // 引入 useUser
import MemberList from '../components/Discuss/MemberList';
import GroupDiscuss from '../components/Discuss/GroupDiscuss';
import ItineraryCollaborate from '../components/Discuss/ItineraryCollaborate';

const DiscussPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, content: 'Go Tokyo!', time: '08:40 AM', isPinned: true },
    { id: 2, content: 'Hey, do you want', time: '08:23 AM', isPinned: false, sender: 'George' },
    { id: 3, content: 'I like this idea', time: '08:04 AM', isPinned: false, sender: 'Olivia' },
    { id: 4, content: 'I like this idea', time: '07:49 AM', isPinned: false, sender: 'Jenifer' },
    // Add more messages as needed
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, content: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setNewMessage('');
    }
  };

  return (
    <div className="discuss-interface">
        <div className="member-list">
            <MemberList></MemberList>
        </div>
        <div className="discuss-container">
            <GroupDiscuss></GroupDiscuss>
        </div>
        <div className="itinerary-collaborate">
            <ItineraryCollaborate></ItineraryCollaborate>
        </div>
    </div>
  );
};

export default DiscussPage;
