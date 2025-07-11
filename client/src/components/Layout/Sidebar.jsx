import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const menuItems = useMemo(() => [
    { icon: '🏠', label: 'Inicio', path: '/', key: 'home' },
    { icon: '🎮', label: 'Juegos', path: '/games', key: 'games' },
    { icon: '🔔', label: 'Notificaciones', path: '/notifications', key: 'notifications', badge: unreadCount },
    { icon: '💬', label: 'Mensajes', path: '/messages', key: 'messages' },
    { icon: '📝', label: 'Mis Notas', path: '/notes', key: 'notes' },
    { icon: '👤', label: 'Perfil', path: `/profile/${user.id}`, key: 'profile' },
    { icon: '⚙️', label: 'Configuración', path: '/settings', key: 'settings' }
  ], [user.id, unreadCount]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  const renderMenuItem = useCallback((item) => (
    <Link
      key={item.key}
      to={item.path}
      className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
    >
      <span className="menu-icon">{item.icon}</span>
      <span className="menu-label">{item.label}</span>
      {item.badge > 0 && (
        <span className="notification-badge">{item.badge > 99 ? '99+' : item.badge}</span>
      )}
    </Link>
  ), [location.pathname]);

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>VGZ</h2>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map(renderMenuItem)}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <div className="username">@{user.username}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default React.memo(Sidebar);
