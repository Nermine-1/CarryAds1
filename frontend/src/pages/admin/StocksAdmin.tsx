import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTruck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/pages/StocksAdmin.css';

interface Stock {
  id: number;
  name: string;
  price: number;
  image_name: string | null;
  updated_at: string;
  total_int: number;
  total_distributed: number;
}

interface DeliveryForm {
  support_id: number;
  quantity: number;
  destination: string;
}

interface EditForm {
  id: number;
  name: string;
  price: number;
}

const StocksAdmin: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    support_id: 0,
    quantity: 0,
    destination: '',
  });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<Stock[]>('http://localhost:4242/api/admin/stocks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStocks(response.data);
      } catch (err) {
        setError('Error while fetching stocks.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4242/api/admin/deliveries', deliveryForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeliveryModal(false);
      const response = await axios.get<Stock[]>('http://localhost:4242/api/admin/stocks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data);
    } catch (err) {
      setError('Error while creating delivery.');
      console.error(err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4242/api/admin/stocks/${editForm.id}`, {
        name: editForm.name,
        price: editForm.price,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      const response = await axios.get<Stock[]>('http://localhost:4242/api/admin/stocks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data);
    } catch (err) {
      setError('Error while updating stock.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:4242/api/admin/stocks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const response = await axios.get<Stock[]>('http://localhost:4242/api/admin/stocks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStocks(response.data);
      } catch (err) {
        setError('Error while deleting stock.');
        console.error(err);
      }
    }
  };

  const openDeliveryModal = (stockId: number) => {
    setDeliveryForm({ ...deliveryForm, support_id: stockId });
    setShowDeliveryModal(true);
  };

  const openEditModal = (stock: Stock) => {
    setEditForm({ id: stock.id, name: stock.name, price: stock.price });
    setShowEditModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <motion.div
      className="stock-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Stock Management</h1>
      <div className="stock-list">
        {stocks.map((stock) => (
          <motion.div
            key={stock.id}
            className="stock-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stock.id * 0.1 }}
          >
            <div className="stock-details">
              <h2>{stock.name}</h2>
              <p>Price: {stock.price} DT</p>
              <p>Total Initial: {stock.total_int}</p>
              <p>Distributed: {stock.total_distributed}</p>
              <p>Available: {stock.total_int - stock.total_distributed}</p>
              <p>Updated: {new Date(stock.updated_at).toLocaleDateString()}</p>
            </div>
            <div className="stock-actions">
              <button onClick={() => openDeliveryModal(stock.id)} className="action-btn delivery">
                <FaTruck />
              </button>
              <button onClick={() => openEditModal(stock)} className="action-btn edit">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(stock.id)} className="action-btn delete">
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showDeliveryModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeliveryModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>New Delivery</h2>
              <form onSubmit={handleDeliverySubmit}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={deliveryForm.quantity}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={deliveryForm.destination}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, destination: e.target.value })}
                  required
                />
                <button type="submit" className="modal-btn">Confirm</button>
                <button type="button" className="modal-btn cancel" onClick={() => setShowDeliveryModal(false)}>
                  Cancel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Edit Stock</h2>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  required
                />
                <button type="submit" className="modal-btn">Save</button>
                <button type="button" className="modal-btn cancel" onClick={() => setShowEditModal(false)}>
                  Cancel</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StocksAdmin;
