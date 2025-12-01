import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const [bookings, setBookings] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [flightForm, setFlightForm] = useState({
    flightId: '',
    airline: '',
    from: '',
    to: '',
    departureDate: '',
    arrivalDate: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    seatsAvailable: ''
  });
  const [flightError, setFlightError] = useState('');
  const [flightSuccess, setFlightSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchFlights();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/admin/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await axios.get('/api/flights');
      setFlights(response.data.flights || []);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  const handleFlightChange = (e) => {
    setFlightForm({ ...flightForm, [e.target.name]: e.target.value });
    setFlightError('');
    setFlightSuccess('');
  };

  const handleAddFlight = async (e) => {
    e.preventDefault();
    setFlightError('');
    setFlightSuccess('');

    try {
      await axios.post('/api/flights', flightForm);
      setFlightSuccess('Flight added successfully!');
      setFlightForm({
        flightId: '',
        airline: '',
        from: '',
        to: '',
        departureDate: '',
        arrivalDate: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
        seatsAvailable: ''
      });
      fetchFlights(); // Refresh flights list
    } catch (error) {
      setFlightError(error.response?.data?.message || 'Failed to add flight');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin data...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            className={activeTab === 'flights' ? 'active' : ''}
            onClick={() => setActiveTab('flights')}
          >
            Add Flight
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'bookings' && (
            <div className="bookings-container">
              <h2>All Bookings - Detailed View</h2>
              {bookings.length === 0 ? (
                <div className="no-data">No bookings found</div>
              ) : (
                <div className="bookings-list-detailed">
                  {bookings.map((booking) => (
                    <div key={booking.pnr} className="booking-detail-card">
                      <div className="booking-detail-header">
                        <div className="booking-pnr-large">
                          <span className="label">PNR:</span>
                          <span className="value">{booking.pnr}</span>
                        </div>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="booking-detail-grid">
                        <div className="detail-section">
                          <h4>User Information</h4>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{booking.userEmail}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Booking Date:</span>
                            <span className="detail-value">
                              {new Date(booking.bookingDate).toLocaleString()}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Total Amount:</span>
                            <span className="detail-value">₹{booking.totalAmount}</span>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Flight Information</h4>
                          <div className="detail-item">
                            <span className="detail-label">Flight ID:</span>
                            <span className="detail-value">{booking.flightDetails.flightId}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Airline:</span>
                            <span className="detail-value">{booking.flightDetails.airline}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Route:</span>
                            <span className="detail-value">
                              {booking.flightDetails.from} → {booking.flightDetails.to}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Departure:</span>
                            <span className="detail-value">
                              {booking.flightDetails.departureDate} at {booking.flightDetails.departureTime}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Arrival:</span>
                            <span className="detail-value">
                              {booking.flightDetails.arrivalDate} at {booking.flightDetails.arrivalTime}
                            </span>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h4>Passenger Details ({booking.passengers.length})</h4>
                          <div className="passengers-list">
                            {booking.passengers.map((passenger, index) => (
                              <div key={index} className="passenger-detail-item">
                                <div className="passenger-number">Passenger {index + 1}</div>
                                <div className="passenger-info">
                                  <div className="passenger-name">{passenger.name}</div>
                                  <div className="passenger-details">
                                    Age: {passenger.age} | Gender: {passenger.gender}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'flights' && (
            <div className="add-flight-container">
              <h2>Add New Flight</h2>
              {flightError && <div className="error-message">{flightError}</div>}
              {flightSuccess && <div className="success-message">{flightSuccess}</div>}
              
              <form onSubmit={handleAddFlight} className="flight-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Flight ID *</label>
                    <input
                      type="text"
                      name="flightId"
                      value={flightForm.flightId}
                      onChange={handleFlightChange}
                      required
                      placeholder="e.g., FL001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Airline *</label>
                    <input
                      type="text"
                      name="airline"
                      value={flightForm.airline}
                      onChange={handleFlightChange}
                      required
                      placeholder="e.g., Air India"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>From *</label>
                    <input
                      type="text"
                      name="from"
                      value={flightForm.from}
                      onChange={handleFlightChange}
                      required
                      placeholder="Departure city"
                    />
                  </div>
                  <div className="form-group">
                    <label>To *</label>
                    <input
                      type="text"
                      name="to"
                      value={flightForm.to}
                      onChange={handleFlightChange}
                      required
                      placeholder="Arrival city"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Departure Date *</label>
                    <input
                      type="date"
                      name="departureDate"
                      value={flightForm.departureDate}
                      onChange={handleFlightChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Arrival Date *</label>
                    <input
                      type="date"
                      name="arrivalDate"
                      value={flightForm.arrivalDate}
                      onChange={handleFlightChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Departure Time *</label>
                    <input
                      type="time"
                      name="departureTime"
                      value={flightForm.departureTime}
                      onChange={handleFlightChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time *</label>
                    <input
                      type="time"
                      name="arrivalTime"
                      value={flightForm.arrivalTime}
                      onChange={handleFlightChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={flightForm.price}
                      onChange={handleFlightChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="5000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Seats Available *</label>
                    <input
                      type="number"
                      name="seatsAvailable"
                      value={flightForm.seatsAvailable}
                      onChange={handleFlightChange}
                      required
                      min="1"
                      placeholder="100"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary">
                  Add Flight
                </button>
              </form>

              <div className="existing-flights">
                <h3>Existing Flights ({flights.length})</h3>
                <div className="flights-list">
                  {flights.map((flight) => (
                    <div key={flight.flightId} className="flight-item">
                      <div className="flight-item-header">
                        <span className="flight-id">{flight.flightId}</span>
                        <span className="flight-airline">{flight.airline}</span>
                      </div>
                      <div className="flight-item-route">
                        {flight.from} → {flight.to}
                      </div>
                      <div className="flight-item-details">
                        <span>Date: {flight.departureDate}</span>
                        <span>Price: ₹{flight.price}</span>
                        <span>Seats: {flight.seatsAvailable}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
