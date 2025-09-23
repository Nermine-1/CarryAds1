import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../../components/distributeur/StatCard';
import BagsDistributedChart from '../../components/distributeur/Chart';
import '../../styles/pages/DistributorDashboard.css';
import { useNavigate } from 'react-router-dom';

// Interfaces for API data
interface Stat {
  title: string;
  value: string | number;
  icon: string;
}

interface Campaign {
  name: string;
  status: string;
  bagsDistributed: string;
  payout: string;
}

interface ChartDataPoint {
  name: string;
  bags: number;
}

interface ApiCampaign {
  id: number;
  name: string;
  status: string;
  clientName: string;
  description: string;
  image_name: string | null;
  startDate: string;
  impressionsTotal: number;
  impressionsRealisees: number;
  bagsRemaining: number;
  performance: string;
}

interface ApiPayment {
  id: number;
  invoiceNumber: string;
  campaignName: string;
  issueDate: string;
  amountReceived: string;
}

interface ApiProfile {
  username: string;
}

const DashboardDistributeur: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<Stat[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileResponse = await fetch('http://localhost:4242/api/distributeur/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch profile');
        const profileData: ApiProfile = await profileResponse.json();
        setUserName(profileData.username);

        // Fetch stats
        const statsResponse = await fetch('http://localhost:4242/api/distributeur/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData: Stat[] = await statsResponse.json();
        setDashboardStats(statsData);

        // Fetch recent campaigns and payments
        const campaignsResponse = await fetch('http://localhost:4242/api/distributeur/mes-campagnes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!campaignsResponse.ok) throw new Error('Failed to fetch campaigns');
        const campaignsData: ApiCampaign[] = await campaignsResponse.json();

        const paymentsResponse = await fetch('http://localhost:4242/api/distributeur/paiements', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        const paymentsData: ApiPayment[] = await paymentsResponse.json();

        // Map campaigns to include payouts
        const campaignsWithPayouts: Campaign[] = campaignsData.map((campaign) => {
          const payment = paymentsData.find((p) => p.id === campaign.id);
          return {
            name: campaign.name,
            status: campaign.status,
            bagsDistributed: campaign.impressionsRealisees.toLocaleString('fr-FR'),
            payout: payment ? `DT${payment.amountReceived}` : 'DT0.00',
          };
        }).slice(0, 3); // Limit to 3 recent campaigns

        setRecentCampaigns(campaignsWithPayouts);

        // Prepare chart data
        const chartDataPoints: ChartDataPoint[] = campaignsData.map((campaign) => ({
          name: campaign.name,
          bags: campaign.impressionsRealisees || 0,
        })).slice(0, 4); // Limit to 4 for chart

        setChartData(chartDataPoints);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

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
        <h1 className="dashboard-title">Loading Dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Error</h1>
        <p>{error}</p>
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
        <h2 className="chart-title">Bags Distributed per Campaign</h2>
        <div className="chart-content">
          <BagsDistributedChart data={chartData} />
        </div>
      </motion.div>

      <motion.div
        className="recent-campaigns-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h2 className="table-title">Campaign History</h2>
        <div className="table-responsive">
          <table className="campaign-table">
            <thead className="table-head">
              <tr>
                <th scope="col" className="table-header">Campaign Name</th>
                <th scope="col" className="table-header">Status</th>
                <th scope="col" className="table-header">Bags Distributed</th>
                <th scope="col" className="table-header">Revenue</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {recentCampaigns.map((campaign, index) => (
                <tr key={index}>
                  <td className="table-data font-medium">{campaign.name}</td>
                  <td className="table-data">
                    <span className={`status-badge ${campaign.status === 'Ongoing' ? 'status-en-cours' : 'status-terminee'}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="table-data">{campaign.bagsDistributed}</td>
                  <td className="table-data">{campaign.payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardDistributeur;
