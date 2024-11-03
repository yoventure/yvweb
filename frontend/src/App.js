import React, { useState, useEffect }  from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import PlannerPage from './pages/PlannerPage';
import DiscussPage from './pages/DiscussPage';
import ProfilePage from './pages/ProfilePage'
import Header from './components/Header';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import { UserProvider } from './UserContext'; // 引入 UserProvider
import { ItineraryInteractiveStateProvider } from './ItineraryInteractiveContext';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userSessions, setUserSessions] = useState([]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.border = '0';

    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.border = '';
    };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false); // 注销用户
  };
  return (
    <UserProvider>
       <ItineraryInteractiveStateProvider>
      <Router>
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/chat" element={<ChatPage userSessions={userSessions} />} />
          <Route path="/planning" element={<PlannerPage />} />
          <Route path="/discuss" element={<DiscussPage/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/signup" element={<SignupPage/>} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn}  setUserSessions={setUserSessions}/>} />
        </Routes>
      </Router>
      </ItineraryInteractiveStateProvider>
    </UserProvider>
  );
}

export default App;
