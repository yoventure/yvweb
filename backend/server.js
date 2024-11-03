require('dotenv').config();

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
const port = process.env.PORT || 5001;



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
let storedImpressionCards = [];

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

    const response = await axios.post(`${process.env.API_URL}/insert`, {
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
    const response = await axios.post(`${process.env.API_URL}/find_user`, { email });

    if (!response.data.success) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.error('data', response.data);
    console.error('data', password);

    const user = response.data.user;

    // const passwordMatch = await bcrypt.compare(password, user.password);
    const passwordMatch = password === user.password;
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

// 路由
app.post('/api/impression-cards', async (req, res) => {
  const ids = req.body.ids;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid ID list" });
  }

  try {
    // Ensure API_URL is set in your environment variables
    if (!process.env.API_URL) {
      throw new Error('API_URL is not defined');
    }

    // Call signup_db.py API
    const response = await axios.post(`${process.env.API_URL}/get_impression_cards`, { ids });
    // Ensure the response is in the expected format
    if (!response.data) {
      throw new Error('No data returned from API');
    }
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching impression cards:', error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.post('/api/google-map', async (req, res) => {
  const pois  = req.body;
  console.log('receive the pois',pois)

  try {
    // Forward POIs to signup_db.py for processing
    const response = await fetch(`${process.env.API_URL}/get_googlemap_POIs`, { // Adjust URL and port as needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pois }),
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(response.status).json({ error: 'Failed to fetch POIs' });
    }
  } catch (error) {
    console.error('Error forwarding POIs:', error);
    res.status(500).json({ error: 'Failed to forward POIs' });
  }
});

app.post('/api/googleroutes', async (req, res) => {
  const { pois, travelMode } = req.body;

  console.log('Received POIs:', pois);

  // 数据验证：检查 pois 是否有效
  if (!pois || !Array.isArray(pois)) {
    return res.status(400).json({ error: 'Invalid POIs data' });
  }

  try {
    // 转发 POIs 到 Python 的 API
    const response = await fetch(`${process.env.API_URL}/get_googlemap_routes`, { // Adjust URL and port as needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pois: pois, travelMode: travelMode }),
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      const errorData = await response.json();
      res.status(response.status).json({ error: 'Failed to fetch POIs from Python API', details: errorData });
    }
  } catch (error) {
    console.error('Error forwarding POIs:', error);
    res.status(500).json({ error: 'Failed to forward POIs' });
  }
});


app.post('/api/interactivewithmap', async (req, res) => {
  const { impressionCards } = req.body;

  if (!impressionCards || impressionCards.length === 0) {
      return res.status(400).json({ error: 'No impression cards provided' });
  }

  // 处理接收到的impression cards
  console.log('Received impression cards:', impressionCards);
  // Save the impression cards to the mock database
  storedImpressionCards = impressionCards;

  // 可以将这些数据保存到数据库或进行其他处理逻辑
  // 这里仅仅返回一个响应表示成功接收
  res.status(200).json({ message: 'Impression cards received successfully' });
});

// GET endpoint to retrieve impression cards
app.get('/api/interactivewithmap', async (req, res) => {
  res.status(200).json({ impressionCards: storedImpressionCards });
});


// // 处理预检请求
// app.options('*', cors());

// 错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
