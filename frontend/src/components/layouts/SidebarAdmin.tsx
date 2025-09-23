import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/layouts/SidebarAdmin.css'; // Make sure this CSS is created and referenced correctly
import { FaSignOutAlt, FaUsers, FaMapMarkerAlt, FaChartLine, FaFileContract, FaWarehouse, FaTachometerAlt, FaBell } from 'react-icons/fa';

const SidebarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profileName');
    localStorage.removeItem('companyName');
    localStorage.removeItem('userId');
    navigate('/'); // Redirect to admin login page
  };

  return (
    <aside className="sidebar-admin">
      <div className="sidebar-header">
        <span className="logo">CarryAds Admin</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              <FaTachometerAlt className="icon" aria-label="Dashboard" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaUsers className="icon" aria-label="User Management" />
              <span>User Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/distributors"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaMapMarkerAlt className="icon" aria-label="Distributor Management" />
              <span>Distributor Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/campaigns"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaChartLine className="icon" aria-label="Campaign Tracking" />
              <span>Campaign Tracking</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/contracts"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaFileContract className="icon" aria-label="Contract Management" />
              <span>Contract Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/stocks"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaWarehouse className="icon" aria-label="Stock Management" />
              <span>Stock Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/notifications"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaBell className="icon" aria-label="Notifications" />
              <span>Notifications</span>
            </NavLink>
          </li>
          <li className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" aria-label="Logout" />
            <span>Logout</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
