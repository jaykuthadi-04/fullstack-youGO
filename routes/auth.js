const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dynamodb, TABLES } = require('../config/dynamodb');
const nodemailer = require('nodemailer');

// Email transporter (using Gmail as example - you may need to configure this)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const existingUser = await dynamodb.get({
      TableName: TABLES.USERS,
      Key: { email }
    }).promise();

    if (existingUser.Item) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      role: email === 'admin123@gmail.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: TABLES.USERS,
      Item: user
    }).promise();

    // Create JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Get user from database
    const result = await dynamodb.get({
      TableName: TABLES.USERS,
      Key: { email }
    }).promise();

    if (!result.Item) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, result.Item.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { email: result.Item.email, role: result.Item.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        email: result.Item.email,
        name: result.Item.name,
        role: result.Item.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    // Check if user exists
    const result = await dynamodb.get({
      TableName: TABLES.USERS,
      Key: { email }
    }).promise();

    if (!result.Item) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store reset token
    await dynamodb.put({
      TableName: TABLES.PASSWORD_RESETS,
      Item: {
        token: resetToken,
        email,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      }
    }).promise();

    // Send email (in production, configure proper email service)
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@flightbooking.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
        `
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Continue even if email fails
    }

    res.json({ 
      message: 'If the email exists, a password reset link has been sent',
      resetToken // In production, remove this and only send via email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Please provide token and new password' });
    }

    // Get reset token
    const result = await dynamodb.get({
      TableName: TABLES.PASSWORD_RESETS,
      Key: { token }
    }).promise();

    if (!result.Item) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token expired
    if (new Date(result.Item.expiresAt) < new Date()) {
      await dynamodb.delete({
        TableName: TABLES.PASSWORD_RESETS,
        Key: { token }
      }).promise();
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const userResult = await dynamodb.get({
      TableName: TABLES.USERS,
      Key: { email: result.Item.email }
    }).promise();

    if (!userResult.Item) {
      return res.status(400).json({ message: 'User not found' });
    }

    await dynamodb.update({
      TableName: TABLES.USERS,
      Key: { email: result.Item.email },
      UpdateExpression: 'set password = :password',
      ExpressionAttributeValues: {
        ':password': hashedPassword
      }
    }).promise();

    // Delete reset token
    await dynamodb.delete({
      TableName: TABLES.PASSWORD_RESETS,
      Key: { token }
    }).promise();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

