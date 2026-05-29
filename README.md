# fullstack-youGO — Flight Ticket Booking Platform

A full-stack online flight ticket booking platform with user authentication, AWS integration, and email notifications.

---

##  Tech Stack

**Frontend**
- React.js
- JavaScript
- CSS / HTML

**Backend**
- Node.js
- Express.js
- REST API

**Authentication & Security**
- JSON Web Tokens (JWT)
- bcryptjs — password hashing

**Database**
- MongoDB (NoSQL)

**Cloud**
- AWS SDK — cloud services integration
- AWS S3 — file/asset storage
- Deployed manually on AWS

**Email**
- Nodemailer — booking confirmation emails

---

## Features

- User registration and login with JWT authentication
- Search and browse available flights
- Book flight tickets
- Email confirmation on successful booking
- Secure password storage with bcrypt hashing
- AWS cloud integration for storage and scalability

---

## Project Structure

```
fullstack-youGO/
├── backend/          # Express.js server and API routes
├── client/           # React.js frontend
├── config/           # Database and environment configuration
├── middleware/       # JWT authentication middleware
├── routes/           # API route definitions
├── server.js         # Main server entry point
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- AWS account

### Installation

```bash
# Clone the repository
git clone https://github.com/jaykuthadi-04/fullstack-youGO.git
cd fullstack-youGO

# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-client
```

### Running Locally

```bash
# Create a .env file in the root with your credentials
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret

# Run backend server
npm run dev

# Run frontend (in a new terminal)
cd client && npm start
```

The app will run at `http://localhost:3000`

---

## Deployment

Application is deployed on **AWS** — infrastructure configured manually using AWS services including EC2, S3, Lambda, and API Gateway.

---

## Author

**Jayanthika Kuthadi**
- LinkedIn: [linkedin.com/in/kuthadi-jayanthika-73b936230](https://linkedin.com/in/kuthadi-jayanthika-73b936230)
- Email: Jayanthika.k1601@gmail.com
