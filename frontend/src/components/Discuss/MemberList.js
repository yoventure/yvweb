import React, { useEffect, useState } from 'react';
import './MemberList.css';
import { useUser } from '../../UserContext'; // 引入 useUser

import config from '../../config'; // 引入 config.js

const Url = config.apiUrl;

function MemberList() {
    const { user } = useUser(); // Use the user context (if applicable)
    const [members, setMembers] = useState([]);
  
    useEffect(() => {
      // Fetch members data from the API or a predefined list
      const fetchMembers = async () => {
        try {
          const response = await fetch(`${Url}/members`);
          const data = await response.json();
          setMembers(data); // Assuming data is an array of member objects
        } catch (error) {
          console.error('Error fetching members:', error);
        }
      };
  
      fetchMembers();
    }, []);
  
    return (
      <div className="member-container">
        <h2 id="member-list-title">Messages</h2>
        <div class="member-list-header">
            <p id="member-list-online">Online Now</p>
            <p id="member-list-see-all">see all</p>
        </div>
        <div className="online-members">
          {members.filter(member => member.online).map((member, index) => (
            <div key={index} className="member">
              <img src={member.avatarUrl} alt={member.name} className="member-avatar" />
            </div>
          ))}
        </div>
  
        <h2 id="member-list-pinned-title">Pinned Messages</h2>
        <div className="pinned-messages">
          {members.map((member, index) => (
            member.pinned && (
              <div key={index} className="pinned-message">
                <span>{member.pinnedMessage}</span>
                <span className="message-time">{member.pinnedMessageTime}</span>
              </div>
            )
          ))}
        </div>
  
        <h2 id="member-list-all-messages">All Messages</h2>
        <div className="all-messages">
          {members.map((member, index) => (
            <div key={index} className="message">
              <span>{member.name}</span>
              <span className="message-content">{member.message}</span>
              <span className="message-time">{member.messageTime}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default MemberList;