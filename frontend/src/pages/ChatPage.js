import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../UserContext'; // 引入 useUser
import ChatContent from '../components/Chat/ChatContent';
import ChatInput from '../components/Chat/ChatInput';
import ChatList from '../components/Chat/ChatList';
import './ChatPage.css';
import ItineraryMap from '../components/Chat/ItineraryMap'
import ChatItinerary from '../components/Chat/ChatItinerary';
import config from '../config'; // 引入 config.js

const Url = config.apiUrl;

function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false); // State to manage showing/hiding itinerary
  const [impressionCards, setImpressionCards] = useState([]); // State to manage impression cards
  const { user } = useUser(); // 获取用户信息
  const userId = user?.userId; // 获取 userId
  const password = user?.password; // 获取 userPassword
  
    const fetchSessions = useCallback(async () => {
      try {
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
        console.log('sessions来看看',data)
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

      // 更新会话列表，将选中的会话放到最前面
      setSessions((prevSessions) => {
        const updatedSessions = prevSessions
          .map((s) => (s.session_id === session.session_id ? { ...s, lastUpdated: new Date() } : s))
          .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); // 按更新时间排序
        return updatedSessions;
      });
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

    try {
      const response = await fetch('/yv-query-stream', {
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
      const json_data = JSON.parse(data);
      const aiResponse = {
        message: json_data.message, // Adjust according to the actual response structure
        date: new Date(),
        isUser: false,
      };

      let updatedHistoryWithAI = [...updatedHistory, aiResponse];
      setChatHistory(updatedHistoryWithAI);
      updateSessionHistory([...updatedHistory, aiResponse]);
      
      // 如果响应包含 IC 信息，检索和渲染印象卡
      if (json_data.IC && json_data.IC.length > 0) {
        // Call the API with a list of IDs
        const cardResponse = await fetch(`${Url}/impression-cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: json_data.IC }),
        });
      
        if (!cardResponse.ok) {
          throw new Error(`Error fetching impression cards`);
        }
        
        const impressionCards = await cardResponse.json();
        setImpressionCards(impressionCards);

        // 将印象卡作为聊天记录的一部分插入历史记录
        const impressionCardMessages = impressionCards.map((card) => ({
          ...card,
          date: new Date(),
          isUser: false,
          type: 'impressionCard', // 特定类型的消息
        }));

        console.log(impressionCards)

        updatedHistoryWithAI = [...updatedHistoryWithAI, ...impressionCardMessages];

        setChatHistory(updatedHistoryWithAI);
        updateSessionHistory(updatedHistoryWithAI);
      }
    

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
        session.session_id === updatedSession.session_id ? updatedSession : session
      )
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
  );
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };


  const startNewChat = async () => {
    try {
      const response = await fetch('/yv-new-session', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, // 替换为实际的用户ID
          topic: 'new session',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newSession = {
        session_id: data.session_id,
        date: formatDate(data.last_used),
        topic: data.topic,
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
        <ChatList sessions={sessions} selectSession={selectSession} startNewChat={startNewChat} currentSession={currentSession} />
      </div>
      <div className='main-content'>
      <div className="itinerary-section">
        <ChatItinerary session_id={currentSession?.session_id} impressions={impressionCards}/> {/* 移除条件，始终渲染 ChatItinerary */}
      </div>
      <div className="itinerary-map">
        <ItineraryMap session_id={currentSession?.session_id}/> {/* 移除条件，始终渲染 ChatItinerary */}
    </div>

      <div className="chat-conversation">
        <div className='chat-content'>
        <ChatContent chatHistory={chatHistory} />
        </div>
        <div className='chat-input-container'>
        <ChatInput sendMessage={sendMessage} />
        </div>
      </div>
      </div>
    </div>
  );
}

export default ChatPage;
