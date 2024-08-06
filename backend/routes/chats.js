const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// 获取所有聊天记录
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find();
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建新聊天记录
router.post('/', async (req, res) => {
  const { user, message } = req.body;
  try {
    const newChat = new Chat({ user, message });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
