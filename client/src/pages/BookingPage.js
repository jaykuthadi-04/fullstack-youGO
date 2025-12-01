import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './BookingPage.css';

const BookingPage = () => {
  const { flightId } = useParams();
  const [flight, setFlight] = useState(null);
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male' }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchFlight();
  }, [flightId]);

  const fetchFlight = async () => {
    try {
      const response = await axios.get(`/api/flights/${flightId}`);
      setFlight(response.data.flight);
    } catch (error) {
      setError('Flight not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passengers
    for (const passenger of passengers) {
      if (!passenger.name || !passenger.age) {
        setError('Please fill all passenger details');
        return;
      }
    }

    setSubmitting(true);

    try {
      const totalAmount = flight.price * passengers.length;
      
      // Ensure auth token is included
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post('/api/bookings', {
        flightId,
        passengers,
        totalAmount
      }, config);

      navigate(`/ticket/${response.data.booking.pnr}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading flight details...</div>;
  }

  if (!flight) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="error-message">Flight not found</div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Flights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <h1>Book Flight</h1>
        <div className="flight-summary">
          <h2>Flight Details</h2>
          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-label">Airline:</span>
              <span className="summary-value">{flight.airline}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Route:</span>
              <span className="summary-value">{flight.from} → {flight.to}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Date:</span>
              <span className="summary-value">{flight.departureDate}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Time:</span>
              <span className="summary-value">{flight.departureTime} - {flight.arrivalTime}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Price per person:</span>
              <span className="summary-value">₹{flight.price}</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value">₹{flight.price * passengers.length}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <h2>Passenger Details</h2>
          {error && <div className="error-message">{error}</div>}
          
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-card">
              <h3>Passenger {index + 1}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    required
                    placeholder="Enter passenger name"
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                    required
                    min="1"
                    max="120"
                    placeholder="Enter age"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePassenger(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="button" onClick={addPassenger} className="btn-secondary">
            Add Another Passenger
          </button>

          <div className="booking-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;

