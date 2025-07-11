import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (append) {
          setNotifications(prev => [...prev, ...data]);
        } else {
          setNotifications(data);
        }
        setHasMore(data.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, leida: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, leida: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'follow': return '👤';
      case 'post': return '📝';
      case 'like': return '❤️';
      case 'comment': return '💬';
      default: return '🔔';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="notifications-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="notifications-header">
          <h1>Notificaciones</h1>
          {notifications.some(n => !n.leida) && (
            <button onClick={markAllAsRead} className="mark-all-btn">
              Marcar todas como leídas
            </button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Cargando notificaciones...</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.leida ? 'unread' : ''}`}
                  onClick={() => !notification.leida && markAsRead(notification._id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-avatar">
                      {notification.emisor?.avatar ? (
                        <img src={notification.emisor.avatar} alt={notification.emisor.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {notification.emisor?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="notification-text">
                      <p>{notification.mensaje}</p>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {!notification.leida && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="empty-notifications">
                <div className="empty-icon">🔔</div>
                <h3>No tienes notificaciones</h3>
                <p>Cuando tengas nuevas notificaciones aparecerán aquí</p>
              </div>
            )}

            {hasMore && notifications.length > 0 && (
              <button
                onClick={() => fetchNotifications(page + 1, true)}
                className="load-more-btn"
              >
                Cargar más
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
