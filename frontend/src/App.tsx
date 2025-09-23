import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LayoutAnnonceur from './components/layouts/LayoutAnnonceur';
import DashboardAnnonceur from './pages/annonceur/DashboardAnnonceur'; 
import MesCampagnes from './pages/annonceur/MesCampagnes';
import CreerCampagne from './pages/annonceur/CreerCampagne';
import Facturation from './pages/annonceur/Facturation';
import GestionStocks from './pages/distributor/GestionStocks';
import AccountSettings from './pages/annonceur/AccountSettings';
import DashboardDistributeur from './pages/distributor/DistributorDashboard';
import LayoutDistributor from './components/layouts/LayoutDistributor';
import HomePage from './pages/Homepage';
import FacturationDistributeur from './pages/distributor/FactutationDistributor'; 
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MesCampagnesDistributeur from './pages/distributor/myCampaigns';
import DashboardAdmin from './pages/admin/dashboard'; 
import LayoutAdmin from './components/layouts/LayotutAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import DistributorsAdmin from './pages/admin/DistributorsAdmin';
import CampaignsAdmin from './pages/admin/CampaignsAdmin';
import NotificationsAdmin from './pages/admin/NotificationsAdmin';
import StocksAdmin from './pages/admin/StocksAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/:userType" element={<LoginPage />} />
        <Route path="/signup/:userType" element={<SignupPage />} />

        <Route path="/annonceur" element={<LayoutAnnonceur />}>
          
          <Route index element={<DashboardAnnonceur />} /> 
          <Route path="dashboard" element={<DashboardAnnonceur />} /> 
          <Route path="creer-campagne" element={<CreerCampagne />} />
          <Route path="mes-campagnes" element={<MesCampagnes />} />
          <Route path="facturation" element={<Facturation />} />
          <Route path="parametres-compte" element={<AccountSettings />} />
        </Route>
        <Route path="/distributeur" element={<LayoutDistributor />}>
          <Route index element={< DashboardDistributeur/>} /> 
          <Route path="dashboard" element={<DashboardDistributeur />} /> 
          <Route path="gestion-stocks" element={<GestionStocks />} />
          <Route path="mes-campagnes" element={<MesCampagnesDistributeur />} />
          <Route path="facturation" element={<FacturationDistributeur />} />
          <Route path="parametres-compte" element={<AccountSettings />} />
        </Route>
        <Route path="/admin" element={<LayoutAdmin />}> 
          <Route index element={<DashboardAdmin />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="distributors" element={<DistributorsAdmin />} />
          <Route path="campaigns" element={<CampaignsAdmin />} />
          <Route path="stocks" element={<StocksAdmin />} />
          <Route path="notifications" element={<NotificationsAdmin />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
