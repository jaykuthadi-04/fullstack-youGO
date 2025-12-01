import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Back to Flights
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You don't have any bookings yet.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Book a Flight
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.pnr} className="booking-card">
                <div className="booking-header">
                  <div className="booking-pnr">
                    <span className="label">PNR:</span>
                    <span className="value">{booking.pnr}</span>
                  </div>
                  <span className={`booking-status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Flight:</span>
                    <span className="detail-value">
                      {booking.flightDetails.airline} - {booking.flightDetails.flightId}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Route:</span>
                    <span className="detail-value">
                      {booking.flightDetails.from} → {booking.flightDetails.to}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{booking.flightDetails.departureDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Passengers:</span>
                    <span className="detail-value">{booking.passengers.length}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₹{booking.totalAmount}</span>
                  </div>
                </div>
                <div className="booking-actions">
                  <button
                    onClick={() => navigate(`/ticket/${booking.pnr}`)}
                    className="btn-primary"
                  >
                    View Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;

