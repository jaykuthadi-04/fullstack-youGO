const express = require('express');
const router = express.Router();
const { dynamodb, TABLES } = require('../database/dynamodb');
const { adminAuth } = require('../middleware/auth');

// Get all bookings (Admin)
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const result = await dynamodb.scan({
      TableName: TABLES.BOOKINGS
    }).promise();

    res.json({ 
      success: true,
      count: result.Items?.length || 0,
      bookings: result.Items || [] 
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await dynamodb.scan({
      TableName: TABLES.USERS,
      ProjectionExpression: 'email, #name, phone, role, createdAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    }).promise();

    // Remove password from response
    const users = (result.Items || []).map(user => ({
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    }));

    res.json({ 
      success: true,
      count: users.length,
      users 
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all flights (Admin)
router.get('/flights', adminAuth, async (req, res) => {
  try {
    const result = await dynamodb.scan({
      TableName: TABLES.FLIGHTS
    }).promise();

    res.json({ 
      success: true,
      count: result.Items?.length || 0,
      flights: result.Items || [] 
    });
  } catch (error) {
    console.error('Get admin flights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

