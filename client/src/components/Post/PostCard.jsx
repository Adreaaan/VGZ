import React, { useState } from 'react';
import './Post.css';

const PostCard = ({ post, onUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLiked(!liked);
        setLikesCount(data.likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now - postDate;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.autor?.avatar ? (
              <img src={post.autor.avatar} alt={post.autor.username} />
            ) : (
              <div className="avatar-placeholder">
                {post.autor?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="author-info">
            <span className="author-name">{post.autor?.username}</span>
            <span className="post-time">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <p>{post.contenido}</p>
        
        {post.videojuego && (
          <div className="post-game">
            <img 
              src={post.videojuego.imagen || '/placeholder-game.jpg'} 
              alt={post.videojuego.nombre}
              className="game-image"
            />
            <div className="game-info">
              <span className="game-name">{post.videojuego.nombre}</span>
              {post.valoracionJuego && (
                <span className={`rating ${post.valoracionJuego}`}>
                  {post.valoracionJuego === 'lo_recomiendo' && '👍 Lo recomiendo'}
                  {post.valoracionJuego === 'no_lo_recomiendo' && '👎 No lo recomiendo'}
                  {post.valoracionJuego === 'meh' && '😐 Meh'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className="action-btn comment-btn">
          <span className="action-icon">💬</span>
          <span>{post.comentarios?.length || 0}</span>
        </button>
        
        <button 
          className={`action-btn like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <span className="action-icon">{liked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>
        
        <button className="action-btn share-btn">
          <span className="action-icon">🔄</span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;
