// Main Server File - Flight Booking Platform
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database and routes
const { initializeTables } = require('./database/dynamodb');
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flight Booking API is running' });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Flight Booking Platform...');
    console.log('📦 Initializing DynamoDB tables...');
    await initializeTables();
    
    console.log('👤 Initializing admin user...');
    await initializeAdmin();
    
    console.log('✈️  Initializing sample flights...');
    await initializeFlights();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`\n🔑 Admin Credentials:`);
      console.log(`   Email: admin123@gmail.com`);
      console.log(`   Password: admin@321\n`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Initialize admin user - ALWAYS RESET PASSWORD
const initializeAdmin = async () => {
  const bcrypt = require('bcryptjs');
  const { dynamodb, TABLES } = require('./database/dynamodb');

  try {
    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin@321';

    // Always update admin password to ensure it's correct
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
    
    console.log('✅ Admin user created/updated');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  }
};

// Initialize sample flights
const initializeFlights = async () => {
  const { dynamodb, TABLES } = require('./database/dynamodb');

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
      }
    ];

    for (const flight of sampleFlights) {
      const existing = await dynamodb.get({
        TableName: TABLES.FLIGHTS,
        Key: { flightId: flight.flightId }
      }).promise();

      if (!existing.Item) {
        await dynamodb.put({
          TableName: TABLES.FLIGHTS,
          Item: { ...flight, createdAt: new Date().toISOString() }
        }).promise();
      }
    }
    console.log('✅ Sample flights initialized');
  } catch (error) {
    console.error('❌ Error initializing flights:', error);
  }
};

startServer();
