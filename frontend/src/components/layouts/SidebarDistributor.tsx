import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/layouts/SidebarDistributor.css'; // Import the sidebar CSS
import { FaSignOutAlt } from 'react-icons/fa'; 

const SidebarDistributor = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profileName');
    localStorage.removeItem('companyName');
    localStorage.removeItem('userId');
    
    // Redirect the user to the login page
    navigate('/'); // You can redirect to a generic or specific login page
  };

  return (
    <aside className="sidebar-Distributor">
      <div className="sidebar-header">
        <span className="logo">CarryAds</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/Distributeur/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end // Important to ensure that /Distributor is only active on the main dashboard
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Distributeur/gestion-stocks"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Manage Stocks
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Distributeur/mes-campagnes"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Campaigns
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Distributeur/facturation"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Billing
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Distributeur/parametres-compte"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Account Settings
            </NavLink>
          </li>
          <li className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            <span>Logout</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarDistributor; // <-- CRUCIAL LINE ADDED HERE
