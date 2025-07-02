import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameCard from '../Game/GameCard';
import Modal from '../UI/Modal';
import { useToggle } from '../../hooks/useToggle';
import { useApi } from '../../hooks/useApi';
import './PostCard.css';

const PostCard = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, toggleDeleteConfirm] = useToggle(false);
  const { loading: apiLoading, apiCall } = useApi();

  // Memoized values
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isOwnPost = useMemo(() => {
    return post.autor?._id === currentUser.id;
  }, [post.autor?._id, currentUser.id]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const diff = now - postDate;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }, [post.createdAt]);

  const userRating = useMemo(() => {
    if (!post.valoracionJuego) return null;
    
    const ratings = {
      'lo_recomiendo': { text: '👍 Lo recomiendo', color: '#38a169' },
      'no_lo_recomiendo': { text: '👎 No lo recomiendo', color: '#e53e3e' },
      'meh': { text: '😐 Meh', color: '#a0aec0' }
    };
    
    return ratings[post.valoracionJuego] || null;
  }, [post.valoracionJuego]);

  // Initialize likes state from post data
  useEffect(() => {
    if (post.likes) {
      const userLike = post.likes.find(like => like.usuario === currentUser.id);
      setIsLiked(!!userLike);
      setLikesCount(post.likes.length);
    }
  }, [post.likes, currentUser.id]);

  // Handlers with useCallback for performance
  const handleLike = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        setLikesCount(data.likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  }, [post._id, isLiked, loading]);

  const handleDeletePost = useCallback(async () => {
    try {
      await apiCall(`/api/posts/${post._id}`, { method: 'DELETE' });
      onUpdate?.();
    } catch (error) {
      console.error('Error eliminando post:', error);
      alert('Error al eliminar el post: ' + error.message);
    } finally {
      toggleDeleteConfirm();
      setShowMenu(false);
    }
  }, [post._id, onUpdate, apiCall, toggleDeleteConfirm]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  const openDeleteConfirm = useCallback(() => {
    toggleDeleteConfirm(true);
  }, [toggleDeleteConfirm]);

  // Component render helpers
  const renderUserAvatar = () => (
    <div className="user-avatar">
      {post.autor?.avatar ? (
        <img src={post.autor.avatar} alt={post.autor.username} />
      ) : (
        <div className="avatar-placeholder">
          {post.autor?.username?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  const renderOptionsMenu = () => {
    if (!isOwnPost) return null;

    return (
      <div className="post-options">
        <button className="options-btn" onClick={toggleMenu}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="19" r="2" fill="currentColor"/>
          </svg>
        </button>
        
        {showMenu && (
          <div className="options-menu">
            <button className="menu-item delete-item" onClick={openDeleteConfirm}>
              🗑️ Eliminar post
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDeleteModal = () => (
    <Modal
      isOpen={showDeleteConfirm}
      onClose={toggleDeleteConfirm}
      title="¿Eliminar post?"
    >
      <p>Esta acción no se puede deshacer y el post se eliminará permanentemente.</p>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={toggleDeleteConfirm}>
          Cancelar
        </button>
        <button 
          className="delete-btn" 
          onClick={handleDeletePost}
          disabled={apiLoading}
        >
          {apiLoading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );

  const renderActionButton = (type, icon, count, onClick) => (
    <button 
      className={`action-btn ${type}-btn ${type === 'like' && isLiked ? 'liked' : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      {icon}
      <span>{count}</span>
    </button>
  );

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <div className="user-avatar">
            {post.autor?.avatar ? (
              <img src={post.autor.avatar} alt={post.autor.username} />
            ) : (
              <div className="avatar-placeholder">
                {post.autor?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <span className="username">{post.autor?.username}</span>
            <span className="post-date">@{post.autor?.username} · {formattedDate}</span>
          </div>
        </div>
        {renderOptionsMenu()}
      </div>

      {renderDeleteModal()}

      <div className="post-content">
        <p>{post.contenido}</p>
        
        <GameCard 
          game={post.videojuego} 
          userRating={post.valoracionJuego}
          showAsPostCard={true}
        />
      </div>

      <div className="post-actions">
        {renderActionButton(
          'comment',
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M1.751 10c0-4.42 3.584-8.005 8.005-8.005h4.366c4.42 0 8.005 3.584 8.005 8.005 0 4.42-3.584 8.005-8.005 8.005H9.67L6.638 21l2.205-2.96c-4.025-.324-7.092-3.687-7.092-8.04z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>,
          post.comentarios?.length || 0
        )}

        {renderActionButton(
          'like',
          <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"}>
            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>,
          likesCount,
          handleLike
        )}

        {renderActionButton(
          'share',
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.29 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" fill="currentColor"/>
          </svg>,
          0
        )}
      </div>
    </div>
  );
};

export default React.memo(PostCard);



