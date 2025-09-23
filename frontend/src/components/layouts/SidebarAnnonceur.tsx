import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/layouts/SidebarAnnonceur.css'; // Import the CSS for the sidebar
import { FaSignOutAlt } from 'react-icons/fa'; // Import the logout icon

const SidebarAnnonceur = () => {
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
    <aside className="sidebar-annonceur">
      <div className="sidebar-header">
        <span className="logo">CarryAds</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/annonceur"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/annonceur/creer-campagne"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Create a Campaign
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/annonceur/mes-campagnes"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Campaigns
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/annonceur/facturation"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Billing
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/annonceur/parametres-compte"
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

export default SidebarAnnonceur; // <-- CRUCIAL LINE ADDED HERE
