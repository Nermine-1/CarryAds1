import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaShieldAlt, FaBell, FaFileInvoice, FaSave, FaLock, FaTrashAlt, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/pages/AccountSettings.css'; // Create this CSS file

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: '',
    contactName: '',
    address: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:4242/api/annonceur', // Matches server.js mounting
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { username, email, phone, company_name, adress, city, postal_code, country } = response.data;
        setProfileData({
          companyName: company_name || '',
          contactName: username || '',
          address: `${adress || ''}, ${city || ''}, ${postal_code || ''} ${country || ''}`.trim(),
          phone: phone || '',
          email: email || '',
        });
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const [adress, city, ...rest] = profileData.address.split(',').map(s => s.trim());
      const postalCode = rest.length ? rest[0].match(/\d+/)?.[0] : '';
      const country = rest.length > 1 ? rest.slice(1).join(' ').replace(/\d+/g, '').trim() : '';

      await api.put(
        '/profile',
        {
          username: profileData.contactName,
          phone: profileData.phone,
          company_name: profileData.companyName,
          adress,
          city,
          postal_code: postalCode,
          country,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Error while updating the profile.');
      console.error('Error saving profile:', err);
    }
  };

  const handleChangePassword = () => {
    alert('Password changed!');
    // Password change logic (to be implemented with API)
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    alert(`Two-factor authentication is now ${is2FAEnabled ? 'disabled' : 'enabled'}.`);
    // Logic to enable/disable 2FA via API
  };

  const handleSaveNotifications = () => {
    alert('Notification preferences saved!');
    // Logic for sending preferences via API
  };

  const handleDownloadData = () => {
    alert('Your data has been downloaded.');
    // Logic for file generation and download via API
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      alert('Account deletion request sent. Please confirm by email.');
      // Logic to send account deletion request via API
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="settings-form"
          >
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <>
                <h3 className="section-title">Company Information</h3>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Main Contact Name</label>
                  <input
                    type="text"
                    value={profileData.contactName}
                    onChange={(e) => setProfileData({ ...profileData, contactName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Company Address</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profileData.email} readOnly />
                  <small className="read-only-info">The login email address cannot be changed.</small>
                </div>
                <button className="save-btn" onClick={handleSaveProfile}>
                  <FaSave /> Save Changes
                </button>
              </>
            )}
          </motion.div>
        );
      case 'security':
        return (
          <motion.div
            key="security"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="settings-form"
          >
            <h3 className="section-title">Password Management</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="Enter your current password" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter a new password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
            <button className="save-btn" onClick={handleChangePassword}>
              <FaLock /> Change Password
            </button>
            <hr className="divider" />
            <h3 className="section-title">Two-Factor Authentication (2FA)</h3>
            <p className="description">
              2FA adds an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
            <button
              className={`toggle-2fa-btn ${is2FAEnabled ? 'active' : ''}`}
              onClick={handleToggle2FA}
            >
              {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
            {is2FAEnabled && (
              <a href="#" className="manage-2fa-link">
                Manage 2FA Options
              </a>
            )}
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="settings-form"
          >
            <h3 className="section-title">Manage your notification preferences</h3>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" defaultChecked /> New invoice available
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Campaign status changed (Approved, Rejected, Completed)
              </label>
              <label>
                <input type="checkbox" /> Stock depletion reported by a distributor
              </label>
              <label>
                <input type="checkbox" /> New distributors available in my area
              </label>
            </div>
            <button className="save-btn" onClick={handleSaveNotifications}>
              <FaSave /> Save Preferences
            </button>
          </motion.div>
        );
      case 'data':
        return (
          <motion.div
            key="data"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="settings-form"
          >
            <h3 className="section-title">Your Rights and Your Data (GDPR)</h3>
            <p className="description">
              We are committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR). You have the right to view, correct, and request the deletion of your data.
            </p>
            <button className="download-data-btn" onClick={handleDownloadData}>
              <FaDownload /> Download My Data
            </button>
            <button className="delete-account-btn" onClick={handleDeleteAccount}>
              <FaTrashAlt /> Request Account Deletion
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="account-settings-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your profile information, security options, and preferences.</p>
      </div>

      <nav className="tabs-navigation">
        <motion.div
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaUserCircle className="tab-icon" />
          <span>Company Profile</span>
        </motion.div>
        <motion.div
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaShieldAlt className="tab-icon" />
          <span>Security</span>
        </motion.div>
        <motion.div
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaBell className="tab-icon" />
          <span>Notifications</span>
        </motion.div>
        <motion.div
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaFileInvoice className="tab-icon" />
          <span>Data (GDPR)</span>
        </motion.div>
      </nav>

      <div className="tab-content">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AccountSettings;
