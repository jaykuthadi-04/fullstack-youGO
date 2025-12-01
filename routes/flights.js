const express = require('express');
const router = express.Router();
const { dynamodb, TABLES } = require('../config/dynamodb');
const { auth } = require('../middleware/auth');

// Get all available flights
router.get('/', async (req, res) => {
  try {
    const result = await dynamodb.scan({
      TableName: TABLES.FLIGHTS
    }).promise();

    res.json({ flights: result.Items || [] });
  } catch (error) {
    console.error('Get flights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single flight by ID
router.get('/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;

    const result = await dynamodb.get({
      TableName: TABLES.FLIGHTS,
      Key: { flightId }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ flight: result.Item });
  } catch (error) {
    console.error('Get flight error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create flight (Admin only - can be added later)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { flightId, airline, from, to, departureDate, arrivalDate, departureTime, arrivalTime, price, seatsAvailable } = req.body;

    if (!flightId || !airline || !from || !to || !departureDate || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const flight = {
      flightId,
      airline,
      from,
      to,
      departureDate,
      arrivalDate: arrivalDate || departureDate,
      departureTime,
      arrivalTime,
      price: parseFloat(price),
      seatsAvailable: seatsAvailable || 100,
      createdAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: TABLES.FLIGHTS,
      Item: flight
    }).promise();

    res.status(201).json({ message: 'Flight created successfully', flight });
  } catch (error) {
    console.error('Create flight error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

