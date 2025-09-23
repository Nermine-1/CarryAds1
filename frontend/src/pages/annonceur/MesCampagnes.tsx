import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaInfoCircle, FaRegImage, FaDownload } from 'react-icons/fa';
import axios, { isAxiosError } from 'axios';
import CampaignDetailsModal from '../../components/annonceur/CampaignDetailsModal';
import VisualViewerModal from '../../components/annonceur/VisualViewerModal';
import '../../styles/pages/MesCampagnes.css';

interface  Campaign {
  id: number;
  name: string;
  status: 'Ongoing' | 'Completed' | 'Pending' | 'Cancelled';
  clientName: string;
  description: string;
  image_name: string | null;
  startDate: string;
  endDate: string;
  impressionsTotal: number;
  impressionsRealisees: number;
  performance: string;
  budgetTotal: number;
  budgetRestant: number;
  distributeurs: string[];
}

const api = axios.create({
  baseURL: 'http://localhost:4242/api/annonceur',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MesCampagnes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/mes-campagnes');
        setCampaigns(response.data);
      } catch (err) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.message || 'Erreur lors du chargement des campagnes.');
        } else {
          setError('Erreur inattendue.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  };

  const handleViewVisual = (campaign: Campaign) => {
    if (!campaign.image_name) {
      alert('Aucun visuel disponible pour cette campagne.');
      return;
    }
    setSelectedCampaign(campaign);
    setShowVisualModal(true);
  };

  const handleDownloadVisual = (campaign: Campaign) => {
    if (!campaign.image_name) {
      alert('Aucun visuel disponible pour téléchargement.');
      return;
    }
    // Trigger download by creating a temporary link
    const link = document.createElement('a');
    link.href = `https://storage.googleapis.com/carryad-images/${campaign.image_name}`;
    link.download = campaign.image_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: Campaign['status']) => {
    switch (status) {
      case 'Ongoing': return 'status-en-cours';
      case 'Completed': return 'status-terminee';
      case 'Pending': return 'status-en-attente';
      case 'Cancelled': return 'status-annulee';
      default: return '';
    }
  };

  const getPerformanceStars = (performance: string) => {
    const perfValue = parseFloat(performance);
    if (isNaN(perfValue) || perfValue === 0) return 'N/A';
    const stars = [];
    const fullStars = Math.floor(perfValue);
    const hasHalfStar = perfValue % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i}>⭐</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half">½⭐</span>);
    }
    return stars;
  };

if (loading) {
  return <div className="loading-state">Loading campaigns...</div>;
}

if (error) {
  return <div className="error-state">Error: {error}</div>;
}

const hasCampaigns = filteredCampaigns.length > 0;

return (
  <motion.div
    className="mes-campagnes-container"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="page-header">
      <div className="header-info">
        <h1 className="page-title">My Campaigns</h1>
        <p className="page-subtitle">Manage and track all advertising campaigns you are participating in.</p>
      </div>
    </div>

    <AnimatePresence mode="wait">
      {hasCampaigns ? (
        <motion.div
          key="has-campaigns"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="actions-bar">
            <div className="search-filter-group">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All statuses</option>
                <option value="en cours">In Progress</option>
                <option value="terminee">Completed</option>
                <option value="Pending">Pending</option>
                <option value="annulee">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="campaigns-table-container">
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Bags</th>
                  <th>Performance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="campaign-name">{campaign.name}</td>
                      <td>{campaign.clientName}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td>Start: {campaign.startDate}</td>
                      <td>
                        {campaign.impressionsRealisees} / {campaign.impressionsTotal}
                        <div className="progress-bar-wrapper">
                          <div
                            className="progress-bar"
                            style={{ width: `${(campaign.impressionsRealisees / campaign.impressionsTotal) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <div className="performance-stars">
                          {getPerformanceStars(campaign.performance)} ({campaign.performance}/5)
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" title="View Details" onClick={() => handleViewDetails(campaign)}>
                            <FaInfoCircle />
                          </button>
                          <button
                            className={`action-btn ${!campaign.image_name ? 'disabled' : ''}`}
                            title={campaign.image_name ? 'View Visual' : 'No visual available'}
                            onClick={() => handleViewVisual(campaign)}
                            disabled={!campaign.image_name}
                          >
                            <FaRegImage />
                          </button>
                          <button
                            className={`action-btn ${!campaign.image_name ? 'disabled' : ''}`}
                            title={campaign.image_name ? 'Download Visual' : 'No visual available'}
                            onClick={() => handleDownloadVisual(campaign)}
                            disabled={!campaign.image_name}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="no-results-message">No campaigns match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="no-campaigns"
          className="no-campaigns-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="no-campaigns-title">You do not have any advertising campaigns yet.</h2>
          <p className="no-campaigns-text">Campaigns will be assigned to you by the advertisers.</p>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showDetailsModal && selectedCampaign && (
        <CampaignDetailsModal campaign={selectedCampaign} onClose={() => setShowDetailsModal(false)} />
      )}
    </AnimatePresence>
    <AnimatePresence>
      {showVisualModal && selectedCampaign && selectedCampaign.image_name && (
        <VisualViewerModal
          imageUrl={`https://storage.googleapis.com/carryad-images/${selectedCampaign.image_name}`}
          onClose={() => setShowVisualModal(false)}
        />
      )}
    </AnimatePresence>
  </motion.div>
);

};

export default MesCampagnes;