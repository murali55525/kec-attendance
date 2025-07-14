const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for frontend requests

// MongoDB Atlas connection
const mongoUri = 'mongodb+srv://mmuralikarthick123:murali555@clusterkechub.u7r0o.mongodb.net/';
let db;

MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('attendance');
    console.log('Connected to MongoDB Atlas');
    // Start server after DB connection
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB Atlas:', err);
  });

// In-memory store for OTPs
const otpStore = {};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'm.muralikarthick123@gmail.com',
        pass: 'afch uggc rjiv rlkl'
    }
});

// Test transporter configuration on startup
transporter.verify(function(error, success) {
    if (error) {
        console.error('Nodemailer transporter error:', error);
    } else {
        console.log('Nodemailer transporter is ready');
    }
});

// Helper to determine user type
function getUserType(email) {
  if (email.endsWith('@kongu.ac.in')) return 'Teacher';
  if (email.endsWith('@kongu.edu')) return 'Student';
  return 'Unknown';
}

// Endpoint to request OTP for signup
app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Validate email domain
    if (!email.endsWith('@kongu.ac.in') && !email.endsWith('@kongu.edu')) {
        return res.status(400).json({ error: 'Email must be @kongu.ac.in (Teacher) or @kongu.edu (Student)' });
    }

    // Check if user already exists
    try {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }
    } catch (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    // Send OTP via email
    try {
        await transporter.sendMail({
            from: '"Kongu Official" <m.muralikarthick123@gmail.com>',
            to: email,
            subject: 'Your OTP Code - Kongu University Attendance',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Kongu University</h2>
                    <h3>Your OTP Code</h3>
                    <p>Your verification code for account signup is:</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #4F46E5; font-size: 36px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
        });
        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        // Log full error on server
        console.error('Error in /api/login:', err);

        // Return details to client for troubleshooting
        res.status(500).json({
            error: 'Failed to send OTP',
            message: err.message,
            stack: err.stack,
        });
    }
});

// Endpoint to verify OTP and set password
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ error: 'Email, OTP and password required' });
  }

  if (otpStore[email] !== otp) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // hash and store user
    const hashed = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({
      email,
      password: hashed,
      role: getUserType(email),
      createdAt: new Date()
    });
    delete otpStore[email];
    res.json({ success: true, message: 'Signup complete' });
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Failed to create account', details: err.message });
  }
});

// Endpoint to authenticate user
app.post('/api/login-user', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) 
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) 
      return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) 
      return res.status(401).json({ error: 'Invalid credentials' });

    // Return user details (omit password)
    const { password: pw, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  } catch (err) {
    console.error('Error in /api/login-user:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});
