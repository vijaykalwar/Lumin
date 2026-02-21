const nodemailer = require('nodemailer');

// Create transporter
// Note: Render uses EMAIL_PASS, local .env uses EMAIL_PASSWORD — support both
const createTransporter = () => {
  const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  
  if (!process.env.EMAIL_USER || !emailPass) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS(WORD) not set — emails will fail');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPass
    }
  });
};

module.exports = createTransporter;