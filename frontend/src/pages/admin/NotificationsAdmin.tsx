import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationData {
  notifications: string[];
}

const NotificationsAdmin: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<NotificationData>('http://localhost:4242/api/admin/notifications', {
  headers: { Authorization: `Bearer ${token}` },
});
setNotifications(response.data.notifications || []);

      } catch (err) {
        setError('Erreur lors du chargement des notifications.');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="notifications-admin">
      <h1>Notifications</h1>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>{notif}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsAdmin;