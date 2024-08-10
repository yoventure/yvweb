import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../UserContext'; // 引入 useUser
import ChatContent from '../components/Chat/ChatContent';
import ChatInput from '../components/Chat/ChatInput';
import ChatList from '../components/Chat/ChatList';
import './ChatPage.css';

function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false); // State to manage showing/hiding itinerary
  const { user } = useUser(); // 获取用户信息
  const userId = user?.userId; // 获取 userId
  const password = user?.password; // 获取 userPassword
  
    const fetchSessions = useCallback(async () => {
      try {
        console.log('user_id', user);
        console.log('password', user?.password);
        const response = await fetch('/yv-get-user-sessions', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": userId,
            "password": password,
            "passwordcheck": 1,
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          const sortedSessions = data.sessions
            .map(session => ({
              ...session,
              date: new Date(session.date)
            }))
            .sort((a, b) => b.date - a.date);
          setSessions(sortedSessions);
        } else {
          throw new Error(`Failed to fetch sessions: ${data.message}`);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    }, [userId, password, user]);

  useEffect(() => {
      fetchSessions();
  }, [fetchSessions]);
  

  const selectSession = async (session) => {
    setCurrentSession(session);

    console.log('session_id', session.session_id)
    try {
      const response = await fetch(`/yv-focus-session`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "user_id": userId,
          "session_id": session.session_id,
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session history: ${response.status}`);
      }

      const data = await response.json();
      console.log('message',data["messages"])
      setChatHistory(data["messages"]);

      fetchSessions(); // 选择会话时重新获取会话列表
    } catch (error) {
      console.error('Error fetching session history:', error);
    }
  };

  const sendMessage = async (message) => {
    if (!currentSession) {
      console.error('No session selected');
      return;
    }

    const newMessage = { message, date: new Date(), isUser: true };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    updateSessionHistory(updatedHistory);

    const apiUrl = '/yv-query-stream'; // 将要请求的URL存储在变量中

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, // 替换为实际的用户ID
          session_id: currentSession.session_id, // 使用当前选择的会话ID
          query: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      const aiResponse = {
        message: data, // Adjust according to the actual response structure
        date: new Date(),
        isUser: false,
      };

      setChatHistory((prevHistory) => [...prevHistory, aiResponse]);
      updateSessionHistory([...updatedHistory, aiResponse]);

      // Check for itinerary trigger in AI response (example condition)
      if (data.includes('place of interest') || data.includes('itinerary')) {
        setShowItinerary(true); // Show itinerary container on specific triggers
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  const updateSessionHistory = (updatedHistory) => {
    const updatedSession = {
      ...currentSession,
      history: updatedHistory,
      lastUpdated: new Date(),
    };
    setSessions((prevSessions) =>
      prevSessions
        .map((session) =>
          session.id === updatedSession.id ? updatedSession : session
        )
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)) // Sort sessions by lastUpdated in descending order
    );
  };


  const startNewChat = async () => {
    const apiUrl = '/yv-new-session'; // 将要请求的URL存储在变量中
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, // 替换为实际的用户ID
          topic: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newSession = {
        session_id: data.session_id,
        date: new Date().toISOString(),
        topic: '',
      };
      setSessions((prevSessions) => [newSession, ...prevSessions].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setCurrentSession(newSession);
      setChatHistory([]);
      setShowItinerary(false); // Reset itinerary view on new chat
    } catch (error) {
    console.error('Error creating new session:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        <ChatList sessions={sessions} selectSession={selectSession} startNewChat={startNewChat} />
      </div>
      <div className="chat-conversation">
        <ChatContent chatHistory={chatHistory} />
        <ChatInput sendMessage={sendMessage} />
      </div>
      {showItinerary && (
        <div className="itinerary-container">
          {/* Render your itinerary visualization component here */}
          <h3>Itinerary Visualization</h3>
          {/* Add your itinerary visualization content based on the ongoing conversation */}
        </div>
      )}
    </div>
  );
}

export default ChatPage;
