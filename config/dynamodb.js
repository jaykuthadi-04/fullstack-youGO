const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Table names
const TABLES = {
  USERS: 'FlightBookingUsers',
  FLIGHTS: 'FlightBookingFlights',
  BOOKINGS: 'FlightBookingBookings',
  PASSWORD_RESETS: 'FlightBookingPasswordResets'
};

// Initialize tables (for first-time setup)
const initializeTables = async () => {
  const db = new AWS.DynamoDB();
  
  const tables = [
    {
      TableName: TABLES.USERS,
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    },
    {
      TableName: TABLES.FLIGHTS,
      KeySchema: [
        { AttributeName: 'flightId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'flightId', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    },
    {
      TableName: TABLES.BOOKINGS,
      KeySchema: [
        { AttributeName: 'pnr', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'pnr', AttributeType: 'S' },
        { AttributeName: 'userEmail', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserEmailIndex',
          KeySchema: [
            { AttributeName: 'userEmail', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        }
      ]
    },
    {
      TableName: TABLES.PASSWORD_RESETS,
      KeySchema: [
        { AttributeName: 'token', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'token', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }
  ];

  for (const table of tables) {
    try {
      await db.createTable(table).promise();
      console.log(`Table ${table.TableName} created successfully`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table ${table.TableName} already exists`);
      } else {
        console.error(`Error creating table ${table.TableName}:`, error);
      }
    }
  }
};

module.exports = { dynamodb, TABLES, initializeTables };

