import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DistributorCampaignsPage: React.FC = () => {
  const InfoCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 mr-1 text-blue-500">
      <path
        fill="currentColor"
        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-352a16 16 0 1 1 0 32 16 16 0 1 1 0-32zm32 128c0-17.7-14.3-32-32-32H208V200h48c17.7 0 32 14.3 32 32v64H208v-32h16c8.8 0 16 7.2 16 16z"
      />
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 mr-1 text-green-500">
      <path
        fill="currentColor"
        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L205 373c-9.4 9.4-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l63.1 63.1 143.1-143.1c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
      />
    </svg>
  );

  const HourglassHalfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 mr-1 text-yellow-500">
      <path
        fill="currentColor"
        d="M32 0C14.3 0 0 14.3 0 32v128c0 53 43 96 96 96H352c53 0 96-43 96-96V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v128c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V32c0-17.7-14.3-32-32-32zM32 352v128c0 17.7 14.3 32 32 32s32-14.3 32-32V384c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-53-43-96-96-96H96c-53 0-96 43-96 96zm224-96c0-17.7-14.3-32-32-32s-32 14.3-32 32H256zm-96 0c0-17.7 14.3-32 32-32s32 14.3 32 32H160z"
      />
    </svg>
  );

  const [campaigns] = useState([
    {
      id: 1,
      name: 'Publicité pour le Café',
      advertiser: 'Coffee House Inc.',
      startDate: '01/08/2024',
      endDate: '30/09/2024',
      status: 'En cours',
      bagsDistributed: 150,
      bagsTotal: 300,
      estimatedRevenue: 300,
    },
    {
      id: 2,
      name: 'Campagne Boulangerie',
      advertiser: 'Le Pain Quotidien',
      startDate: '10/07/2024',
      endDate: '20/08/2024',
      status: 'En cours',
      bagsDistributed: 100,
      bagsTotal: 200,
      estimatedRevenue: 200,
    },
    {
      id: 3,
      name: 'Promotion d\'été',
      advertiser: 'Fashion Co.',
      startDate: '01/06/2024',
      endDate: '30/06/2024',
      status: 'Terminée',
      bagsDistributed: 250,
      bagsTotal: 250,
      estimatedRevenue: 250,
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En cours':
        return <HourglassHalfIcon />;
      case 'Terminée':
        return <CheckCircleIcon />;
      default:
        return <InfoCircleIcon />;
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">My Campaigns</h1>
      <p className="text-lg text-gray-600 mb-8">
        View the history and status of all your distribution campaigns.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <motion.div
            key={campaign.id}
            className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{campaign.name}</h3>
                <span className={`py-1 px-3 rounded-full text-xs font-bold uppercase flex items-center ${
                  campaign.status === 'En cours' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {getStatusIcon(campaign.status)}{campaign.status}
                </span>
              </div>
              <div className="space-y-2 text-gray-700 mb-4">
                <p>
                  <strong className="font-semibold">Advertiser:</strong> {campaign.advertiser}
                </p>
                <p>
                  <strong className="font-semibold">Dates:</strong> {campaign.startDate} - {campaign.endDate}
                </p>
                <p className="flex items-center">
                  <strong className="font-semibold">Bags Distributed:</strong>
                  <span className="ml-2">
                    {campaign.bagsDistributed} / {campaign.bagsTotal}
                  </span>
                </p>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(campaign.bagsDistributed / campaign.bagsTotal) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <p className="text-lg font-bold text-gray-900">
                {campaign.estimatedRevenue} DT
              </p>
              <button className="py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DistributorCampaignsPage;
