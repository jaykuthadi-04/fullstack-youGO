const express = require('express');
const router = express.Router();
const { dynamodb, TABLES } = require('../database/dynamodb');
const { auth, adminAuth } = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { flightId, passengers, totalAmount } = req.body;
    const userEmail = req.user.email;

    if (!flightId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: 'Please provide flight ID and passenger details' });
    }

    // Get flight details
    const flightResult = await dynamodb.get({
      TableName: TABLES.FLIGHTS,
      Key: { flightId }
    }).promise();

    if (!flightResult.Item) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Ensure seatsAvailable is a number
    const currentSeats = parseInt(flightResult.Item.seatsAvailable, 10) || 0;
    const passengerCount = parseInt(passengers.length, 10);

    if (currentSeats < passengerCount) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Generate PNR
    const pnr = `PNR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create booking
    const booking = {
      pnr,
      userEmail,
      flightId,
      flightDetails: flightResult.Item,
      passengers,
      totalAmount: totalAmount || (parseFloat(flightResult.Item.price) * passengerCount),
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    await dynamodb.put({
      TableName: TABLES.BOOKINGS,
      Item: booking
    }).promise();

    // Update flight seats - ensure both values are numbers
    const newSeatsAvailable = currentSeats - passengerCount;
    await dynamodb.update({
      TableName: TABLES.FLIGHTS,
      Key: { flightId },
      UpdateExpression: 'set seatsAvailable = :newSeats',
      ExpressionAttributeValues: {
        ':newSeats': newSeatsAvailable
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise();

    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await dynamodb.query({
      TableName: TABLES.BOOKINGS,
      IndexName: 'UserEmailIndex',
      KeyConditionExpression: 'userEmail = :email',
      ExpressionAttributeValues: {
        ':email': userEmail
      }
    }).promise();

    res.json({ bookings: result.Items || [] });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get booking by PNR
router.get('/:pnr', auth, async (req, res) => {
  try {
    const { pnr } = req.params;
    const userEmail = req.user.email;

    const result = await dynamodb.get({
      TableName: TABLES.BOOKINGS,
      Key: { pnr }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (result.Item.userEmail !== userEmail && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking: result.Item });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all bookings (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const result = await dynamodb.scan({
      TableName: TABLES.BOOKINGS
    }).promise();

    res.json({ bookings: result.Items || [] });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

