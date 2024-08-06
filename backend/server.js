const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const db = require('./config/db');  // Ensure correct path to db.js
const bcrypt = require('bcryptjs');
const app = express();
const port = 5001;



// 中间件
app.use(bodyParser.json());
app.use(cors());

// Email setup
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',  // SMTP服务器地址
  port: 587,                // SMTP服务器端口号
  secure: false,      
  auth: {
    user: 'yoventure@outlook.com',
    pass: 'rhyowvnshzquheey'
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

let verificationCodes = {};
let verificationAttempts = {};

// 路由
// app.use('/api/users', require('./routes/users'));
// app.use('/api/chats', require('./routes/chats'));
// app.use('/api/planners', require('./routes/planners'));
// // 引入并使用新的路由
// const signupRouter = require('./routes/signup');
// app.use('/api', signupRouter);

// Routes
app.post('/api/send-verification', (req, res) => {
  const { email } = req.body;
  console.log(`Received request to send verification code to: ${email}`); // 添加日志
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  verificationCodes[email] = verificationCode;
  console.log(`Generated code for ${email}: ${verificationCode}`); // 添加日志
  console.log(`Stored verification codes: ${JSON.stringify(verificationCodes)}`); // 添加日志

  // Track the number of attempts
  if (!verificationAttempts[email]) {
    verificationAttempts[email] = 0;
  }
  verificationAttempts[email] += 1;

  console.log(`Verification attempts for ${email}: ${verificationAttempts[email]}`);

  const mailOptions = {
    from: '"YoVenture" <yoventure@outlook.com>',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${verificationCode}`
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Error sending email: ${error}`); // 添加日志
      return res.status(500).send({ success: false, error });
    }
    res.status(200).json({ success: true, messageId: info.messageId });
  });
});

app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  console.log(`Stored code: ${verificationCodes[email]}, Received code: ${code}`);
  if (verificationCodes[email] && verificationCodes[email] === code) {
    delete verificationCodes[email];
    delete verificationAttempts[email];
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 是 salt 的轮数

    const response = await axios.post('http://localhost:5002/insert', {
      name,
      user_id: email,
      phone,
      password: hashedPassword,  // 存储散列后的密码
      gender: '',
      date_of_birth: ''
    });
    res.send(response.data);
  } catch (error) {
    console.error('Error inserting document into MongoDB:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post('http://localhost:5002/find_user', { email });

    if (!response.data.success) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.error('data', response.data);
    console.error('data', password);

    const user = response.data.user;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const userData = { name: user.name, email: user.email };
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// // 处理预检请求
// app.options('*', cors());

// 错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
