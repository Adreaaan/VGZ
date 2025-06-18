import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const menuItems = [
    { icon: '🏠', label: 'Inicio', path: '/', key: 'home' },
    { icon: '🔍', label: 'Explorar', path: '/explore', key: 'explore' },
    { icon: '🔔', label: 'Notificaciones', path: '/notifications', key: 'notifications' },
    { icon: '💬', label: 'Mensajes', path: '/messages', key: 'messages' },
    { icon: '📝', label: 'Mis Notas', path: '/notes', key: 'notes' },
    { icon: '👤', label: 'Perfil', path: `/profile/${user.id}`, key: 'profile' },
    { icon: '⚙️', label: 'Configuración', path: '/settings', key: 'settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="brand-link">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="currentColor"/>
              <circle cx="20" cy="20" r="8" fill="white"/>
            </svg>
          </div>
          <span className="brand-text">VGZ</span>
        </Link>
      </div>

      <div className="sidebar-menu">
        {menuItems.map(item => (
          <Link
            key={item.key}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
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
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
