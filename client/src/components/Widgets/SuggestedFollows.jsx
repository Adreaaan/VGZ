import React, { useState, useEffect } from 'react';
import './Widgets.css';

const SuggestedFollows = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular datos por ahora
    setTimeout(() => {
      setSuggestedUsers([
        { _id: '1', username: 'gamer_pro', avatar: null },
        { _id: '2', username: 'rpg_master', avatar: null },
        { _id: '3', username: 'fps_legend', avatar: null }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFollow = (userId) => {
    // Implementar lógica de seguir
    console.log('Following user:', userId);
  };

  if (loading) {
    return (
      <div className="widget">
        <h3>A quién seguir</h3>
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3>A quién seguir</h3>
      <div className="suggested-users">
        {suggestedUsers.map(user => (
          <div key={user._id} className="suggested-user">
            <div className="user-avatar-small">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder-small">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-info-small">
              <span className="username-small">@{user.username}</span>
            </div>
            <button 
              className="follow-btn"
              onClick={() => handleFollow(user._id)}
            >
              Seguir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedFollows;
