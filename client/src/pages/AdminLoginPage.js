import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Trim email to avoid whitespace issues
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      const response = await axios.post('/api/auth/login', {
        email: email,
        password: password
      });

      // Check if user is admin
      if (response.data.user && response.data.user.role === 'admin') {
        // Set token and update axios headers
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Wait a moment for localStorage to be set, then navigate
        setTimeout(() => {
          // Force reload to update AuthContext
          window.location.href = '/admin';
        }, 100);
      } else {
        setError('Access denied. Admin credentials required.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid admin credentials';
      setError(errorMessage);
      
      // More helpful error message
      if (errorMessage.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check your admin credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>🔐 Admin Login</h1>
          <p>Enter your admin credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin123@gmail.com"
            />
          </div>
          
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter admin password"
            />
          </div>

          <button type="submit" className="btn-admin-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

