import React, { useCallback } from 'react';
import PostCard from './PostCard';
import './PostDetailModal.css';

const PostDetailModal = ({ isOpen, onClose, post, onCommentClick, onReplyClick, onGameClick }) => {
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleCommentDeleted = useCallback(async () => {
    // Refresh the current post data
    if (onCommentClick) {
      onCommentClick(post);
    }
  }, [onCommentClick, post]);

  if (!isOpen || !post) return null;

  return (
    <div className="post-detail-overlay" onClick={handleOverlayClick}>
      <div className="post-detail-modal">
        <div className="post-detail-header">
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3>Post</h3>
        </div>
        
        <div className="post-detail-content">
          <PostCard 
            post={post}
            onUpdate={handleCommentDeleted}
            onCommentClick={onCommentClick}
            onReplyClick={onReplyClick}
            onGameClick={onGameClick}
            isInModal={true}
          />
          
          {post.comentarios && post.comentarios.length > 0 && (
            <div className="comments-section">
              <div className="comments-header">
                <h4>Comentarios</h4>
              </div>
              {post.comentarios.map(comment => (
                <PostCard 
                  key={comment._id}
                  post={comment}
                  onUpdate={handleCommentDeleted}
                  onCommentClick={onCommentClick}
                  onReplyClick={onReplyClick}
                  onGameClick={onGameClick}
                  isInModal={true}
                  isComment={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PostDetailModal);
