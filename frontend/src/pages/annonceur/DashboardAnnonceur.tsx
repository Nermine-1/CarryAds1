import React, { useState, useEffect } from 'react';
import StatCard from '../../components/annonceur/StatCard';
import { motion } from 'framer-motion';
import CampaignsChart from '../../components/annonceur/ImpressionsChart';
import '../../styles/pages/DashboardAnnonceur.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Stat {
  title: string;
  value: string | number;
  icon: string;
}

interface Campaign {
  name: string;
  status: string;
  impressions: string;
  budget: string;
}

interface ChartDataPoint {
  name: string;
  campaigns: number;
}

interface ChartData {
  campaign: string;
  period: string;
  data: ChartDataPoint[];
}

const DashboardAnnonceur: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30-days');
  const [userName, setUserName] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<Stat[]>([]);
  const [dashboardRecentCampaigns, setDashboardRecentCampaigns] = useState<Campaign[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const storedProfileName = localStorage.getItem('profileName');

      if (storedProfileName) {
        setUserName(storedProfileName);
      }

      if (!token) {
        console.error('Token not found. Redirecting to login page.');
        navigate('/login/annonceur');
        return;
      }

      try {
        const response = await axios.get('http://localhost:4242/api/dashboard/annonceur-data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardStats(response.data.stats);
        setDashboardRecentCampaigns(response.data.recentCampaigns);
        setChartData(response.data.chartData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          setError('Your session has expired or is invalid. Please log in again.');
          navigate('/login/annonceur');
        } else {
          setError('Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const getChartData = (): ChartDataPoint[] => {
    const selectedData = chartData.find(
      (data) => data.campaign === 'all-campaigns' && data.period === selectedPeriod
    );
    return selectedData ? selectedData.data : [];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Loading dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Error: {error}</h1>
        <p>Please try again later or log back in.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard {userName ? `- ${userName}` : ''}</h1>

      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {dashboardStats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="chart-title">Campaign Trends</h2>
        <div className="chart-controls">
          <select
            className="chart-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="30-days">Last 30 Days</option>
            <option value="7-days">Last 7 Days</option>
          </select>
        </div>
        <div className="chart-content">
          <CampaignsChart data={getChartData()} />
        </div>
      </motion.div>

      <motion.div
        className="recent-campaigns-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h2 className="table-title">Recent Campaigns</h2>
        <div className="table-responsive">
          <table className="campaign-table">
            <thead className="table-head">
              <tr>
                <th scope="col" className="table-header">Campaign Name</th>
                <th scope="col" className="table-header">Status</th>
                <th scope="col" className="table-header">Stock</th>
                <th scope="col" className="table-header">Budget</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {dashboardRecentCampaigns.map((campaign, index) => (
                <tr key={index}>
                  <td className="table-data font-medium">{campaign.name}</td>
                  <td className="table-data">
                    <span
                      className={`status-badge ${
                        campaign.status === 'Pending'
                          ? 'status-pending'
                          : campaign.status === 'Ongoing'
                          ? 'status-ongoing'
                          : campaign.status === 'Completed'
                          ? 'status-completed'
                          : ''
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="table-data">{campaign.impressions}</td>
                  <td className="table-data">{campaign.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardAnnonceur;
