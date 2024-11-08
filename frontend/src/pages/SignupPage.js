import React, { useState } from 'react';
import config from '../config'; // 引入 config.js
import './SignupPage.css';

const Url = config.apiUrl;

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    date_of_birth: '' // 假设格式为 YYYY-MM-DD
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupNew = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // if (!validatePassword(formData.password)) {
    //   alert('Password does not meet the requirements');
    //   return;
    // }

    console.log(Url)
  
    try {

      console.log(JSON.stringify({
        name: formData.name,
        user_id: formData.email,  // 使用表单中填写的 email 作为 user_id
        phone: formData.phone,
        password: formData.password,
        gender: '',
        date_of_birth: "2024-10-19",
      }))

      const response = await fetch('/yv-signup', 
        {method: 'POST',
         headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          user_id: formData.email,  // 使用表单中填写的 email 作为 user_id
          phone: formData.phone,
          password: formData.password,
          gender: "",
          date_of_birth:  "2024-10-19",
        }),
      });

      console.log(response)
  
      if (response.ok) {
        alert('Signup successful! You can now log in.');
        setSignupComplete(true);
      } else {
        alert('Signup failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // if (!validatePassword(formData.password)) {
    //   alert('Password does not meet the requirements');
    //   return;
    // }

    try {
      const response = await fetch(`${Url}/send-verification`, formData);
      if (response.data.success) {
        alert('Verification code sent to your email.');
      } else {
        alert('Failed to send verification code');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Failed to send verification code');
    }
  };

  const handleResendCode = () => {
    setResendCount(resendCount + 1);
    handleSignup();
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`${Url}/verify-code`, {
        email: formData.email,
        code: verificationCode,
      });
      console.log('user_id', formData.email)
      if (response.data.success) {
        setIsVerified(true);
        const signupResponse = await fetch(`${Url}/signup`, formData);
        if (signupResponse.data.success) {
          const session_response = await fetch('/yv-new-session', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               "user_id": formData.email,
               "topic": '',
          }),
          });
          console.log('new session', session_response.data);
          setSignupComplete(true);
        } else {
          alert('Signup failed');
        }
      } else {
        alert('Verification code is incorrect');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      alert('Verification failed. Please try again.');
    }
  };

  // const validatePassword = (password) => {
  //   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //   return passwordRegex.test(password);
  // };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {!signupComplete ? (
        <div className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="signup-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="signup-input"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="signup-input"
          />
          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="signup-input"
          />
          <input
            type={passwordVisible ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="signup-input"
          />
          <div className="show-password-container">
            <input
              type="checkbox"
              id="show-password"
              checked={passwordVisible}
              onChange={() => setPasswordVisible(!passwordVisible)}
              className="show-password-checkbox"
            />
            <label htmlFor="show-password" className="show-password-label">Show Password</label>
          </div>
          {/* <div className="verification-container">
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="verification-input"
            />
            <button onClick={handleSignup} className="send-verification-button">Send Code</button>
          </div> */}
          {/* {resendCount > 0 && (
            <button onClick={handleResendCode} className="resend-code-button">Resend Code</button>
          )} */}
          {/* {isVerified ? (
            <div>
              <p>Signup successful!</p>
            </div>
          ) : (
            <button onClick={handleVerify} className="signup-button">Verify</button>
          )} */}
          <button onClick={handleSignupNew} className="signup-button">SignUp</button>
        </div>
      ) : (
        <div>
          <p>Signup complete! You can now log in.</p>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
