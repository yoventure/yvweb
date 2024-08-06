const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'yoventure@outlook.com',
    pass: 'rhyowvnshzquheey'
  }
});

router.post('/send-verification', async (req, res) => {
  const { email, name, phone } = req.body;

  const mailOptions = {
    from: '"YoVenture" <yoventure@outlook.com>',
    to: email,
    subject: 'Email Verification',
    text: 'Your verification code is 123456'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
