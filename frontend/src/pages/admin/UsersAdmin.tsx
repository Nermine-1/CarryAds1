import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import '../../styles/pages/UsersAdmin.css';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  phone: string;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: ['ROLE_USER'],
    phone: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4242/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Error while loading users.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData, roles: formData.roles };
      if (currentUser) {
        // Update user
        await axios.put(`http://localhost:4242/api/admin/users/${currentUser.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create user
        await axios.post('http://localhost:4242/api/admin/users', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Error while saving the user.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:4242/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Error while deleting the user.');
      }
    }
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't pre-fill passwords
      roles: user.roles,
      phone: user.phone,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      roles: ['ROLE_USER'],
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="users-admin">
      <h1>User Management</h1>
      <div className="toolbar">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button onClick={openCreateModal} className="add-button">
          <FaPlus /> Add User
        </button>
      </div>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.roles.join(', ')}</td>
              <td>{user.phone}</td>
              <td className="actions-cell">
                <button onClick={() => openEditModal(user)} className="edit-button" title="Edit">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(user.id)} className="delete-button" title="Delete">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{currentUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleCreateOrUpdate}>
              <label>Username:</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label>Password: {currentUser ? "(leave blank if unchanged)" : ""}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!currentUser}
              />
              <label>Roles:</label>
              <select
                value={formData.roles.toString()}
                onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                required
              >
                <option value="ROLE_USER">User</option>
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_ANNONCEUR">Customer</option>
                <option value="ROLE_DISTRIBUTER">Distributor</option>
              </select>
              <label>Phone:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="save-button">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-button">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
