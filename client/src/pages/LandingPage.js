import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if trying to login as admin
    if (loginData.email === 'admin123@gmail.com') {
      setError('Please use the Admin Login button to access admin panel');
      setLoading(false);
      return;
    }

    const result = await login(loginData.email, loginData.password);

    if (result.success) {
      // Double check - prevent admin from logging in through regular login
      if (result.user?.role === 'admin') {
        setError('Admin access is restricted. Please use Admin Login.');
        // Clear token if somehow admin got through
        localStorage.removeItem('token');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup(
      signupData.email,
      signupData.password,
      signupData.name,
      signupData.phone
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };


  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <h1>✈️ Flight Booking Platform</h1>
          <p>Book your flights with ease</p>
        </div>

        <div className="auth-forms-container">
          <div className="tabs">
            <button
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={activeTab === 'signup' ? 'active' : ''}
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your password"
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  placeholder="Confirm your password"
                  minLength="6"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>

        <div className="admin-section">
          <div className="admin-divider">
            <span>OR</span>
          </div>
          <h3>Admin Access</h3>
          <button 
            onClick={() => navigate('/admin-login')} 
            className="btn-admin"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

