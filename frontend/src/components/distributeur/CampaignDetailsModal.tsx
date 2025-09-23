import React from 'react';
import { motion } from 'framer-motion';

// The Campaign interface is updated to match the backend and myCampaigns.tsx
interface Campaign {
    id: number; // <-- This is the only change needed
    name: string;
    status: 'En cours' | 'Terminée' | 'En attente' | 'Annulée';
    clientName: string;
    description: string;
    image_name: string;
    startDate: string;
    impressionsTotal: number;
    impressionsRealisees: number;
    performance: string;
}

interface CampaignDetailsModalProps {
    campaign: Campaign;
    onClose: () => void;
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const getStatusBadgeClass = (status: Campaign['status']) => {
    switch (status) {
        case 'En cours': return 'bg-green-100 text-green-800';
        case 'Terminée': return 'bg-gray-200 text-gray-800';
        case 'En attente': return 'bg-yellow-100 text-yellow-800';
        case 'Annulée': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ campaign, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 transform transition-all"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">{campaign.name}</h2>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full uppercase ${getStatusBadgeClass(campaign.status)}`}>
                        {campaign.status}
                    </span>
                </div>
                <div className="space-y-4 text-gray-700">
                    <p><strong>Client :</strong> {campaign.clientName}</p>
                    <p><strong>Description :</strong> {campaign.description}</p>
                    <p><strong>Date de début :</strong> {campaign.startDate}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold">Impressions réalisées :</p>
                            <p>{campaign.impressionsRealisees.toLocaleString()} / {campaign.impressionsTotal.toLocaleString()}</p>
                            <div className="h-2 bg-gray-200 rounded-full mt-1">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${(campaign.impressionsRealisees / campaign.impressionsTotal) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Performance :</p>
                            <p>{campaign.performance} / 5</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CampaignDetailsModal;
