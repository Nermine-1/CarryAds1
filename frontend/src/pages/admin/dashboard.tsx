import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaBuilding, FaBullhorn, FaTruck } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { ChartOptions } from 'chart.js';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import '../../styles/pages/adminDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface DashboardData {
  campaigns: number;
  distributors: number;
  users: number;
  customers: number;
  campaignStatuses: Array<{ status: string; count: number }>;
  monthlyCampaignsCreated: Array<{ month: string; total_campaigns: number }>;
  supportDistribution: Array<{ support_name: string; total_int: number; total_distributed: number }>;
  usersByRole: { [key: string]: number };
}

const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<DashboardData>('http://localhost:4242/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(`Server error: ${err.response.status}. Message: ${err.response.data.message || 'Not specified'}.`);
          } else if (err.request) {
            setError('Could not connect to the server. Check network connection and CORS settings.');
          } else {
            setError('Error configuring the request.');
          }
          console.error('Error details:', err);
        } else {
          setError('An unexpected error occurred.');
          console.error('Unexpected error:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="no-data-container">
        <p>No dashboard data available.</p>
      </div>
    );
  }

  // Filter and map only Customer and Distributor roles for the doughnut chart
  const roleLabels: Record<'ANNONCEUR' | 'DISTRIBUTEUR', string> = {
    ANNONCEUR: 'Customers',
    DISTRIBUTEUR: 'Distributors',
  };

  const filteredRoles: Array<'ANNONCEUR' | 'DISTRIBUTEUR'> = ['ANNONCEUR', 'DISTRIBUTEUR'];

  const usersByRoleData = {
    labels: filteredRoles.map((role) => roleLabels[role]),
    datasets: [
      {
        data: filteredRoles.map((role) => dashboardData.usersByRole[role] || 0),
        backgroundColor: ['#06b6d4', '#f97316'],
        hoverOffset: 4,
      },
    ],
  };

  // Monthly campaigns created chart
  const monthlyCampaignsCreatedData = {
    labels: dashboardData.monthlyCampaignsCreated.map((item) => item.month),
    datasets: [
      {
        label: 'Campaigns created',
        data: dashboardData.monthlyCampaignsCreated.map((item) => item.total_campaigns),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Support distribution chart
  const supportDistributionData = {
    labels: dashboardData.supportDistribution.map((item) => item.support_name),
    datasets: [
      {
        label: 'Total distributed',
        data: dashboardData.supportDistribution.map((item) => item.total_distributed),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        barThickness: 25,
      },
      {
        label: 'Total initial',
        data: dashboardData.supportDistribution.map((item) => item.total_int),
        backgroundColor: 'rgba(52, 211, 153, 0.7)',
        borderColor: 'rgb(52, 211, 153)',
        borderWidth: 1,
        barThickness: 25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
      datalabels: {
        color: '#ffffff',
        formatter: (value: number, context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        font: {
          weight: 'bold' as const,
        },
      },
    },
  };

  return (
    <div className="dashboard-admin">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card users-card">
          <FaUsers className="card-icon" />
          <div className="card-content">
            <span className="card-title">Users</span>
            <span className="card-value">{dashboardData.users}</span>
          </div>
        </div>
        <div className="stat-card distributors-card">
          <FaTruck className="card-icon" />
          <div className="card-content">
            <span className="card-title">Distributors</span>
            <span className="card-value">{dashboardData.distributors}</span>
          </div>
        </div>
        <div className="stat-card customers-card">
          <FaBuilding className="card-icon" />
          <div className="card-content">
            <span className="card-title">Customers</span>
            <span className="card-value">{dashboardData.customers}</span>
          </div>
        </div>
        <div className="stat-card campaigns-card">
          <FaBullhorn className="card-icon" />
          <div className="card-content">
            <span className="card-title">Campaigns</span>
            <span className="card-value">{dashboardData.campaigns}</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        {/* Doughnut Chart: Users by Role */}
        <div className="chart-box">
          <h2 className="chart-title">Users by Role</h2>
          {filteredRoles.some(role => (dashboardData.usersByRole[role] ?? 0) > 0) ? (
            <Doughnut data={usersByRoleData} options={doughnutOptions} plugins={[ChartDataLabels]} />
          ) : (
            <p className="no-data">No user role data available.</p>
          )}
        </div>

        {/* Campaign Activity Over Time */}
        <div className="chart-box">
          <h2 className="chart-title">Campaign Activity</h2>
          {dashboardData.monthlyCampaignsCreated && dashboardData.monthlyCampaignsCreated.length > 0 ? (
            <Line options={chartOptions} data={monthlyCampaignsCreatedData} />
          ) : (
            <p className="no-data">No campaign activity data available.</p>
          )}
        </div>
      </div>

      {/* Campaign Status List */}
      <div className="chart-container">
        <h2 className="chart-title">Campaign Status</h2>
        {dashboardData.campaignStatuses && dashboardData.campaignStatuses.length > 0 ? (
          <ul className="status-list">
            {dashboardData.campaignStatuses.map((entry, index) => (
              <li key={index} className="status-item">
                <span className="status-name">{entry.status}</span>
                <span className="status-count">{entry.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No campaign status data available.</p>
        )}
      </div>

      {/* Support Distribution Bar Chart */}
      <div className="chart-box">
        <h2 className="chart-title">Support Distribution</h2>
        {dashboardData.supportDistribution && dashboardData.supportDistribution.length > 0 ? (
          <Bar options={chartOptions} data={supportDistributionData} />
        ) : (
          <p className="no-data">No distribution data available.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
