import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // 引入 useUser
import './LoginPage.css';
import config from '../config'; // 引入 config.js
const apiUrl = config.apiUrl;

function LoginPage({ setIsLoggedIn, setUserSessions }) { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser(); // 获取 setUser 函数

  const handleLogin = async () => {
    console.log('api-pre',apiUrl)
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setIsLoggedIn(true); // Set the login state to true upon successful login
        setUser({ userId: email,password: password  }); // 存储用户信息
        const sessionResponse = await fetch('/yv-get-user-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "user_id": email,
            "password": password,
            "passwordcheck": 1})
        });
        if (sessionResponse.status === 200) {
          setUserSessions('success');
        } else {
          alert('Failed to get user sessions');
        }
        navigate('/');

      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;
