import { Outlet } from 'react-router-dom';
import SidebarAnnonceur from './SidebarAnnonceur'; // Import correct d'un export par défaut
import '../../styles/layouts/LayoutAnnonceur.css'; // Import du CSS de la mise en page

const LayoutAnnonceur = () => {
  return (
    <div className="layout-annonceur">
      <SidebarAnnonceur />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutAnnonceur;
