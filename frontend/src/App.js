import React, { useState }  from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import PlannerPage from './pages/PlannerPage';
import Header from './components/Header';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import { UserProvider } from './UserContext'; // 引入 UserProvider


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userSessions, setUserSessions] = useState([]);

  const handleLogout = () => {
    setIsLoggedIn(false); // 注销用户
  };
  return (
    <UserProvider>
      <Router>
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/chat" element={<ChatPage userSessions={userSessions} />} />
          <Route path="/planning" element={<PlannerPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn}  setUserSessions={setUserSessions}/>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
