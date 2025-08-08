import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import '../Styles/Login.css';

function LoginPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setMessage('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
      const apiUrl = `${API_BASE_URL}${endpoint}`;
      console.log('Making request to:', apiUrl);

      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // Increased timeout to 15 seconds
      });
      console.log('Response:', response.data);

      if (response.data.success) {
        setMessage(response.data.message);
        if (isLogin) {
          // Use auth context to login
          console.log('Logging in user:', response.data.data);
          login(response.data.data, response.data.token);
          // Redirect to home page
          navigate('/');
        } else {
          // Switch to login after successful registration
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '' });
        }
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Login/Register error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.code === 'ECONNABORTED') {
        setMessage('Request timeout. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setMessage('Network error. Please check if the server is running.');
      } else if (error.response) {
        setMessage(error.response.data?.message || `Server error: ${error.response.status}`);
      } else {
        setMessage(`Error: ${error.message || 'An error occurred. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const skipLogin = () => {
    navigate('/');
  };

  // Test backend connectivity
  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.TEST}`, {
        timeout: 5000
      });
      console.log('Backend connection test:', response.data);
    } catch (error) {
      console.error('Backend connection failed:', error.message);
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="promo-text">
          <h1>NewsApp</h1>
          <p>
            Stay Informed, Stay Ahead! Discover Breaking News, <br />
            Top Stories, and In-Depth Coverage Across the Globe. <br />
            Your News, Your Way! <br />
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your details to login.' : 'Enter your details to create an account.'}</p>

          {message && (
            <div className={`message ${message.includes('successful') || message.includes('Registered') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="******"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <span
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <p className="signup-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="toggle-form"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up for free' : 'Login here'}
            </button>
          </p>

          <p className="skip-text">
            <button type="button" className="skip-button" onClick={skipLogin}>
              skip for now →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
