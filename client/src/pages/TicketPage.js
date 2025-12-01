import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TicketPage.css';

const TicketPage = () => {
  const { pnr } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooking();
  }, [pnr]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/${pnr}`);
      setBooking(response.data.booking);
    } catch (error) {
      setError('Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading ticket...</div>;
  }

  if (error || !booking) {
    return (
      <div className="ticket-page">
        <div className="container">
          <div className="error-message">{error || 'Booking not found'}</div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const flight = booking.flightDetails;

  return (
    <div className="ticket-page">
      <div className="container">
        <div className="ticket-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Back to Home
          </button>
          <button onClick={handlePrint} className="btn-primary">
            Print Ticket
          </button>
        </div>

        <div className="ticket" id="ticket">
          <div className="ticket-header">
            <h1>✈️ Flight Ticket</h1>
            <div className="ticket-status">{booking.status.toUpperCase()}</div>
          </div>

          <div className="ticket-section">
            <h2>Booking Information</h2>
            <div className="ticket-info-grid">
              <div className="info-item">
                <span className="info-label">PNR Number:</span>
                <span className="info-value pnr">{booking.pnr}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Booking Date:</span>
                <span className="info-value">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="ticket-section">
            <h2>Flight Details</h2>
            <div className="ticket-info-grid">
              <div className="info-item">
                <span className="info-label">Airline:</span>
                <span className="info-value">{flight.airline}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Flight ID:</span>
                <span className="info-value">{flight.flightId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Route:</span>
                <span className="info-value">{flight.from} → {flight.to}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Departure Date:</span>
                <span className="info-value">{flight.departureDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Departure Time:</span>
                <span className="info-value">{flight.departureTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Arrival Date:</span>
                <span className="info-value">{flight.arrivalDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Arrival Time:</span>
                <span className="info-value">{flight.arrivalTime}</span>
              </div>
            </div>
          </div>

          <div className="ticket-section">
            <h2>Passenger Details</h2>
            <div className="passengers-list">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="passenger-item">
                  <div className="passenger-number">Passenger {index + 1}</div>
                  <div className="passenger-details">
                    <div className="passenger-name">{passenger.name}</div>
                    <div className="passenger-info">
                      Age: {passenger.age} | Gender: {passenger.gender}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ticket-footer">
            <p>Thank you for choosing our flight booking service!</p>
            <p>Please arrive at the airport at least 2 hours before departure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;

