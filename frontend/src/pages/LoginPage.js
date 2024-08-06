import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // 引入 useUser
import './LoginPage.css';
const bcrypt = require('bcryptjs'); // 引入 bcryptjs 库

function LoginPage({ setIsLoggedIn, setUserSessions }) { // Destructure the prop correctly
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser(); // 获取 setUser 函数

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setIsLoggedIn(true); // Set the login state to true upon successful login
        setUser({ userId: email,password: password  }); // 存储用户信息
        console.log('user_id',email)
        console.log('password',password)
        const hashedPassword = bcrypt.hashSync(password, 10); // 10 是 saltRounds，用于生成 salt
        console.log('password',hashedPassword)
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
        // if (sessionResponse.data.status === 'success') {
        //   setUserSessions(sessionResponse.data.sessions);
        // } else {
        //   alert('Failed to get user sessions');
        // }
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
