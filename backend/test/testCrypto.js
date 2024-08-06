const crypto = require('crypto');

const generateVerificationCode = () => {
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  console.log(`Generated code: ${verificationCode}`);
};

generateVerificationCode();
