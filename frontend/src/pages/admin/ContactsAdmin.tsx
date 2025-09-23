import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Invoice {
  id: number;
  price: number;
}

const ContractsAdmin: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4242/api/admin/invoices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(response.data);
      } catch (err) {
        setError('Error loading invoices.');
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="contracts-admin">
      <h1>Contract Management</h1>
      <ul>
        {invoices.map(invoice => (
          <li key={invoice.id}>Invoice: {invoice.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default ContractsAdmin;
