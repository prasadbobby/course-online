const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetUrl, name) => {
  const mailOptions = {
    from: `Course Platform <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Hello ${name},</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `Course Platform <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to our Course Platform',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our course platform.</p>
      <p>Start exploring our courses and enhance your skills.</p>
      <p><a href="${process.env.FRONTEND_URL}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Browse Courses</a></p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send enrollment confirmation email
exports.sendEnrollmentEmail = async (email, name, courseName) => {
  const mailOptions = {
    from: `Course Platform <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Enrollment Confirmation: ${courseName}`,
    html: `
      <h1>Hello ${name},</h1>
      <p>Congratulations! You have successfully enrolled in the course: <strong>${courseName}</strong>.</p>
      <p>Start learning now:</p>
      <p><a href="${process.env.FRONTEND_URL}/learn" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Start Learning</a></p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send certificate email
exports.sendCertificateEmail = async (email, name, courseName, certificateUrl) => {
  const mailOptions = {
    from: `Course Platform <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Certificate of Completion: ${courseName}`,
    html: `
      <h1>Congratulations ${name}!</h1>
      <p>You have successfully completed the course: <strong>${courseName}</strong>.</p>
      <p>Your certificate is ready. Please click the link below to download it:</p>
      <p><a href="${certificateUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};