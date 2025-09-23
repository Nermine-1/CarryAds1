import { Outlet } from 'react-router-dom';
import SidebarAnnonceur from './SidebarAdmin'; // Import correct d'un export par défaut
import '../../styles/layouts/LayoutAdmin.css'; // Import du CSS de la mise en page

const LayoutAdmin = () => {
  return (
    <div className="layout-admin">
      <SidebarAnnonceur />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutAdmin;
