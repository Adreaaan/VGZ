import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Widgets.css';

const SuggestedFollows = ({ onUserFollowed }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/usuarios/sugeridos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.usuarios || []);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestedUsers();
    
    // Obtener la lista de usuarios que ya sigue
    const fetchFollowingUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`/api/usuarios/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          const siguiendoIds = new Set(userData.siguiendo.map(u => u._id || u));
          setFollowingUsers(siguiendoIds);
        }
      } catch (error) {
        console.error('Error fetching following users:', error);
      }
    };

    fetchFollowingUsers();
  }, [fetchSuggestedUsers]);

  const handleFollowUser = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const isFollowing = followingUsers.has(userId);
      
      console.log('SuggestedFollows - Attempting to follow/unfollow user:', userId, 'Currently following:', isFollowing);
      
      const response = await fetch(`/api/usuarios/${userId}/seguir`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('SuggestedFollows - Response status:', response.status);

      if (response.ok) {
        const newFollowingUsers = new Set(followingUsers);
        if (isFollowing) {
          newFollowingUsers.delete(userId);
          console.log('SuggestedFollows - Unfollowed user:', userId);
        } else {
          newFollowingUsers.add(userId);
          console.log('SuggestedFollows - Followed user:', userId);
        }
        setFollowingUsers(newFollowingUsers);
        
        onUserFollowed?.(userId, !isFollowing);
      } else {
        const errorData = await response.json();
        console.error('SuggestedFollows - Error response:', errorData);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
    }
  }, [followingUsers, onUserFollowed]);

  const renderUserItem = useCallback((user) => (
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
        <div className="username-small">@{user.username}</div>
      </div>
      <button 
        className={`follow-btn ${followingUsers.has(user._id) ? 'following' : ''}`}
        onClick={() => handleFollowUser(user._id)}
      >
        <span className="follow-text">
          {followingUsers.has(user._id) ? 'Siguiendo' : 'Seguir'}
        </span>
      </button>
    </div>
  ), [followingUsers, handleFollowUser]);

  const memoizedUsers = useMemo(() => users, [users]);

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
        {memoizedUsers.map(renderUserItem)}
      </div>
    </div>
  );
};

export default React.memo(SuggestedFollows);
