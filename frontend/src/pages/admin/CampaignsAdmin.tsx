import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Campaign {
  id: number;
  name: string;
  status: number;
}

const CampaignsAdmin: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4242/api/admin/campaigns', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns(response.data);
      } catch (err) {
        setError('Error loading campaigns.');
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="campaigns-admin">
      <h1>Campaign Tracking</h1>
      <ul>
        {campaigns.map(campaign => (
          <li key={campaign.id}>{campaign.name} - Status: {campaign.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignsAdmin;
