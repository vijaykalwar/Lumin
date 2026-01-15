const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASSWORD // App Password (not regular password)
    }
  });

  // Alternative: For other email services
  // return nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   secure: true,
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASSWORD
  //   }
  // });
};

module.exports = createTransporter;