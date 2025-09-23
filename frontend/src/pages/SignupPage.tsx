import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaBuilding, FaPhone } from 'react-icons/fa';
import '../styles/pages/SignupPage.css';

// Define the interface for your signup payload
interface SignupPayload {
  username: string;
  email: string;
  password: string;
  userType: string;
  phone: string | null;
  // Optional fields based on userType
  adress?: string;
  city?: string;
  postalCode?: number | null;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  companyName?: string;
}

const SignupPage: React.FC = () => {
  const { userType: urlUserType } = useParams<{ userType: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    adress: '',
    city: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const titles: { [key: string]: string } = {
    annonceur: 'Customer',
    distributeur: 'Distributor',
    commercial: 'Sales',
    admin: 'Administrator',
  };

  const pageTitle = titles[urlUserType || ''] || 'User';

  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
      companyName: '',
      adress: '',
      city: '',
      postalCode: '',
      country: '',
      latitude: '',
      longitude: ''
    });
    setError('');
    setSuccess('');
  }, [urlUserType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email || !formData.password || !urlUserType) {
        setError('Please fill in all required fields.');
        return;
    }

    const payload: SignupPayload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      userType: urlUserType || '',
      phone: formData.phone || null,
    };

    if (urlUserType === 'annonceur' || urlUserType === 'distributeur') {
      if (!formData.adress || !formData.city || !formData.postalCode || !formData.country) {
          setError('Please fill in all required address fields.');
          return;
      }
      payload.adress = formData.adress;
      payload.city = formData.city;
      payload.postalCode = formData.postalCode ? parseInt(formData.postalCode, 10) : null;
      payload.country = formData.country;
      payload.latitude = formData.latitude ? parseFloat(formData.latitude) : null;
      payload.longitude = formData.longitude ? parseFloat(formData.longitude) : null;
    }

    if (urlUserType === 'annonceur') {
      if (!formData.companyName) {
          setError('Please enter the company name.');
          return;
      }
      payload.companyName = formData.companyName;
    }

    console.log('Data sent to backend (payload):', payload);

    try {
      const response = await axios.post('http://localhost:4242/api/auth/signup', payload);
      console.log('Backend response (success):', response.data);

      setSuccess('Signup successful! You can now log in.');
      setTimeout(() => navigate(`/login/${urlUserType}`), 2000); 
    } catch (err) {
      console.error('Complete signup error object:', err);
      if (axios.isAxiosError(err) && err.response) {
        console.error('Backend error details (response):', err.response.data);
        setError(err.response.data.message || 'Signup failed.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="signup-page-container">
      <motion.div
        className="signup-box"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="signup-title">
             Signup {pageTitle}
        </h2>
        {error && <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>{error}</motion.p>}
        {success && <motion.p className="success-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>{success}</motion.p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username"><FaUser /> Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email"><FaEnvelope /> Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password"><FaLock /> Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone"><FaPhone /> Phone Number</label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            />
          </div>

          {(urlUserType === 'annonceur' || urlUserType === 'distributeur') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
            >
              <div className="form-group">
                <label htmlFor="adress">Address</label>
                <input type="text" name="adress" id="adress" placeholder="Address" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input type="text" name="city" id="city" placeholder="City" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input type="text" name="postalCode" id="postalCode" placeholder="Postal Code" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input type="text" name="country" id="country" placeholder="Country" onChange={handleChange} required />
              </div>
              <input type="hidden" name="latitude" value={formData.latitude} />
              <input type="hidden" name="longitude" value={formData.longitude} />
            </motion.div>
          )}

          {urlUserType === 'annonceur' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
            >
              <div className="form-group">
                <label htmlFor="companyName"><FaBuilding /> Company Name</label>
                <input type="text" name="companyName" id="companyName" placeholder="Company Name" onChange={handleChange} required />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="signup-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
          <p className="login-link">
            Already have an account? <Link to={`/login/${urlUserType}`}>Log in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;
