require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeTables } = require('./config/dynamodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flight Booking API is running' });
});

// Initialize admin user on startup
const initializeAdmin = async () => {
  const bcrypt = require('bcryptjs');
  const { dynamodb, TABLES } = require('./config/dynamodb');

  try {
    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin@321';

    // Check if admin exists
    const result = await dynamodb.get({
      TableName: TABLES.USERS,
      Key: { email: adminEmail }
    }).promise();

    if (!result.Item) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await dynamodb.put({
        TableName: TABLES.USERS,
        Item: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      }).promise();

      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Initialize sample flights
const initializeFlights = async () => {
  const { dynamodb, TABLES } = require('./config/dynamodb');

  try {
    const sampleFlights = [
      {
        flightId: 'FL001',
        airline: 'Air India',
        from: 'Mumbai',
        to: 'Delhi',
        departureDate: '2024-12-25',
        arrivalDate: '2024-12-25',
        departureTime: '08:00',
        arrivalTime: '10:30',
        price: 5000,
        seatsAvailable: 50
      },
      {
        flightId: 'FL002',
        airline: 'IndiGo',
        from: 'Delhi',
        to: 'Bangalore',
        departureDate: '2024-12-26',
        arrivalDate: '2024-12-26',
        departureTime: '14:00',
        arrivalTime: '16:30',
        price: 6000,
        seatsAvailable: 40
      },
      {
        flightId: 'FL003',
        airline: 'SpiceJet',
        from: 'Bangalore',
        to: 'Chennai',
        departureDate: '2024-12-27',
        arrivalDate: '2024-12-27',
        departureTime: '10:00',
        arrivalTime: '11:30',
        price: 3500,
        seatsAvailable: 60
      },
      {
        flightId: 'FL004',
        airline: 'Vistara',
        from: 'Mumbai',
        to: 'Kolkata',
        departureDate: '2024-12-28',
        arrivalDate: '2024-12-28',
        departureTime: '12:00',
        arrivalTime: '14:45',
        price: 7000,
        seatsAvailable: 35
      },
      {
        flightId: 'FL005',
        airline: 'GoAir',
        from: 'Delhi',
        to: 'Mumbai',
        departureDate: '2024-12-29',
        arrivalDate: '2024-12-29',
        departureTime: '18:00',
        arrivalTime: '20:15',
        price: 5500,
        seatsAvailable: 45
      }
    ];

    for (const flight of sampleFlights) {
      // Check if flight exists
      const existing = await dynamodb.get({
        TableName: TABLES.FLIGHTS,
        Key: { flightId: flight.flightId }
      }).promise();

      if (!existing.Item) {
        await dynamodb.put({
          TableName: TABLES.FLIGHTS,
          Item: {
            ...flight,
            createdAt: new Date().toISOString()
          }
        }).promise();
        console.log(`Sample flight ${flight.flightId} created`);
      }
    }
  } catch (error) {
    console.error('Error initializing flights:', error);
  }
};

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Initializing DynamoDB tables...');
    await initializeTables();
    
    console.log('Initializing admin user...');
    await initializeAdmin();
    
    console.log('Initializing sample flights...');
    await initializeFlights();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

