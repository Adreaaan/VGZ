import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PostCard from './PostCard';
import './ReplyModal.css';

const ReplyModal = ({ isOpen, onClose, post, onReplySubmit, onGameClick }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReplyText('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!replyText.trim() || loading) return;

    setLoading(true);
    
    try {
      await onReplySubmit(replyText.trim());
      handleClose();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Error al enviar la respuesta');
    } finally {
      setLoading(false);
    }
  }, [replyText, loading, onReplySubmit]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen || !post) return null;

  return createPortal(
    <div className="reply-modal-overlay" onClick={handleOverlayClick}>
      <div className="reply-modal">
        <div className="reply-modal-header">
          <button className="close-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3>Responder</h3>
        </div>
        
        <div className="reply-modal-content">
          <div className="original-post">
            <PostCard 
              post={post}
              onUpdate={() => {}}
              isInModal={true}
              showActions={false}
              onGameClick={onGameClick}
            />
          </div>
          
          <div className="reply-form-section">
            <div className="thread-connector"></div>
            <form onSubmit={handleSubmit} className="reply-form">
              <div className="reply-input-wrapper">
                <div className="user-avatar-small">
                  <div className="avatar-placeholder-small">
                    {JSON.parse(localStorage.getItem('user') || '{}').username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="reply-textarea"
                  rows="3"
                  disabled={loading}
                />
              </div>
              
              <div className="reply-actions">
                <button 
                  type="submit" 
                  disabled={!replyText.trim() || loading}
                  className="reply-submit-btn"
                >
                  {loading ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(ReplyModal);
