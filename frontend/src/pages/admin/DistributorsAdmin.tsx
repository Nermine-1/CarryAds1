import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Distributor {
  id: number;
  adress: string;
  status?: number;
}

const DistributorsAdmin: React.FC = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4242/api/admin/distributors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDistributors(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des distributeurs.');
        console.error('Error fetching distributors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="distributors-admin">
      <h1>Gestion des distributeurs</h1>
      <ul>
        {distributors.map(distributor => (
          <li key={distributor.id}>{distributor.adress} - Statut: {distributor.status ? 'Validé' : 'En attente'}</li>
        ))}
      </ul>
    </div>
  );
};

export default DistributorsAdmin;