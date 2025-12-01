import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await axios.get('/api/flights');
      setFlights(response.data.flights || []);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flightId) => {
    navigate(`/book/${flightId}`);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="container">
          <h1>✈️ Flight Booking Platform</h1>
          <nav className="nav-menu">
            <span className="user-info">Welcome, {user?.name || user?.email}</span>
            <button onClick={() => navigate('/my-bookings')} className="btn-secondary">
              My Bookings
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="btn-admin">
                Admin Panel
              </button>
            )}
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        <div className="flights-section">
          <h2>Available Flights</h2>
          {loading ? (
            <div className="loading">Loading flights...</div>
          ) : flights.length === 0 ? (
            <div className="no-flights">No flights available at the moment.</div>
          ) : (
            <div className="flights-grid">
              {flights.map((flight) => (
                <div key={flight.flightId} className="flight-card">
                  <div className="flight-header">
                    <h3>{flight.airline}</h3>
                    <span className="flight-id">{flight.flightId}</span>
                  </div>
                  <div className="flight-route">
                    <div className="route-item">
                      <span className="route-city">{flight.from}</span>
                      <span className="route-time">{flight.departureTime}</span>
                      <span className="route-date">{flight.departureDate}</span>
                    </div>
                    <div className="route-arrow">→</div>
                    <div className="route-item">
                      <span className="route-city">{flight.to}</span>
                      <span className="route-time">{flight.arrivalTime}</span>
                      <span className="route-date">{flight.arrivalDate}</span>
                    </div>
                  </div>
                  <div className="flight-details">
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">₹{flight.price}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Seats Available:</span>
                      <span className="detail-value">{flight.seatsAvailable}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookFlight(flight.flightId)}
                    className="btn-book"
                    disabled={flight.seatsAvailable === 0}
                  >
                    {flight.seatsAvailable === 0 ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;

