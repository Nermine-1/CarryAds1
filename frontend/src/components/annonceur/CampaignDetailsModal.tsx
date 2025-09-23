import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import '../../styles/components/Modal.css';

interface Campaign {
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
  distributors: string[];
}

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

const CampaignDetailsModal: React.FC<Props> = ({ campaign, onClose }) => {
  const getStatusBadgeClass = (status: Campaign['status']) => {
    switch (status) {
      case 'Ongoing': return 'status-ongoing';
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-container"
        initial={{ y: '-100vh', opacity: 0 }}
        animate={{ y: '0', opacity: 1 }}
        exit={{ y: '100vh', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Campaign Details: {campaign.name}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-info"><strong>ID:</strong> {campaign.id}</p>
          <p className="modal-info"><strong>Campaign Name:</strong> {campaign.name}</p>
          <p className="modal-info"><strong>Client:</strong> {campaign.clientName}</p>
          <p className="modal-info">
            <strong>Status:</strong>{' '}
            <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>{campaign.status}</span>
          </p>
          <p className="modal-info"><strong>Description:</strong> {campaign.description || 'No description'}</p>
          <p className="modal-info"><strong>Period:</strong> From {campaign.startDate} to {campaign.endDate}</p>
          <p className="modal-info">
            <strong>Impressions:</strong> {campaign.impressionsRealisees} / {campaign.impressionsTotal}
          </p>
          <p className="modal-info"><strong>Performance:</strong> {campaign.performance}/5</p>
          <p className="modal-info"><strong>Total Budget:</strong> {campaign.budgetTotal.toLocaleString('en-US')} DT</p>
          <p className="modal-info"><strong>Remaining Budget:</strong> {campaign.budgetRestant.toLocaleString('en-US')} DT</p>
          <p className="modal-info"><strong>Distributors:</strong> {campaign.distributors.length > 0 ? campaign.distributors.join(', ') : 'None'}</p>
          {campaign.image_name && (
            <p className="modal-info">
              <strong>Visual:</strong>
              <img
                src={`https://storage.googleapis.com/carryad-images/${campaign.image_name}`}
                alt={campaign.name}
                className="modal-image"
              />
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button className="modal-action-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CampaignDetailsModal;
