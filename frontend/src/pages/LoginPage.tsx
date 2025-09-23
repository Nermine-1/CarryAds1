import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserCircle, FaLock, FaSignInAlt } from 'react-icons/fa';
import '../styles/pages/LoginPage.css';

const LoginPage: React.FC = () => {
  const { userType: urlUserType } = useParams<{ userType: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const titles: { [key: string]: string } = {
    annonceur: 'Customer',
    distributeur: 'Distributor',
    commercial: 'Sales',
    admin: 'Administrator',
  };

  const pageTitle = titles[urlUserType || ''] || 'User';

  const cleanRoleString = (role: string): string => {
    let cleaned = role.trim();
    cleaned = cleaned.toUpperCase();
    cleaned = cleaned.replace(/[^A-Z0-9_]/g, '');
    return cleaned;
  };

  const logCharCodesForComparison = (str1: string, str2: string, label1: string, label2: string) => {
    console.log(`--- Character Codes Debug ---`);
    console.log(`${label1} (${str1.length} chars):`, Array.from(str1).map(char => char.charCodeAt(0)));
    console.log(`${label2} (${str2.length} chars):`, Array.from(str2).map(char => char.charCodeAt(0)));

    const minLength = Math.min(str1.length, str2.length);
    let diffFound = false;
    for (let i = 0; i < minLength; i++) {
        if (str1.charCodeAt(i) !== str2.charCodeAt(i)) {
            console.log(`Difference at character ${i}:`);
            console.log(`${label1}[${i}] = '${str1[i]}' (code: ${str1.charCodeAt(i)})`);
            console.log(`${label2}[${i}] = '${str2[i]}' (code: ${str2.charCodeAt(i)})`);
            diffFound = true;
        }
    }
    if (str1.length !== str2.length) {
        console.log(`Lengths differ: ${label1} (${str1.length}), ${label2} (${str2.length})`);
        diffFound = true;
    }
    if (!diffFound) {
        console.log(`No differences found after cleaning`);
    }
    console.log(`-------------------------------------`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:4242/api/auth/login', { email, password });
      const { token, userType: rawBackendUserType, username, profileName, companyName } = response.data;

      const backendUserType = cleanRoleString(rawBackendUserType);

      console.log('Login successful:', response.data);
      console.log('Cleaned backend userType:', backendUserType);
      console.log('Username:', username);
      console.log('Profile name:', profileName);
      console.log('Company name (if Customer):', companyName);

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('profileName', profileName);
      if (companyName) {
        localStorage.setItem('companyName', companyName);
      }

      console.log('Comparison: backendUserType === "ROLE_ANNONCEUR"', backendUserType === 'ROLE_ANNONCEUR');
      console.log('backendUserType (stringified):', JSON.stringify(backendUserType));
      console.log('Comparison literal "ROLE_ANNONCEUR" (stringified):', JSON.stringify('ROLE_ANNONCEUR'));

      logCharCodesForComparison(backendUserType, 'ROLE_ANNONCEUR', 'backendUserType', 'Literal "ROLE_ANNONCEUR"');

      if (backendUserType === 'ROLE_ANNONCEUR') {
        navigate('/annonceur/dashboard');
      } else if (backendUserType === 'ROLE_DISTRIBUTEUR') {
        navigate('/distributeur/dashboard');
      } else if (backendUserType === 'ROLE_COMMERCIAL') {
        navigate('/commercial/dashboard');
      } else if (backendUserType === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('Unrecognized user role.');
      }

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Login failed.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <motion.div
      className="login-page-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="login-box"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="login-title">Login {pageTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaUserCircle /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <motion.button
            type="submit"
            className="login-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignInAlt /> Log In
          </motion.button>
        </form>

        <div className="signup-link">
          <p>
            Don't have an account? <Link to={`/signup/${urlUserType}`}>Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
