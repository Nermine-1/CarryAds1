import { Outlet } from 'react-router-dom';
import SidebarDistributor from './SidebarDistributor'; // Import correct d'un export par défaut
import '../../styles/layouts/LayoutDistributor.css'; // Import du CSS de la mise en page

const LayoutDistributor = () => {
  return (
    <div className="layout-Distributor">
      <SidebarDistributor />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutDistributor;
