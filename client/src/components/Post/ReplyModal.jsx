import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PostCard from './PostCard';
import './ReplyModal.css';

const ReplyModal = ({ isOpen, onClose, post, onReplySubmit, onGameClick }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_CARACTERES = 300; // Para comentarios usamos 300 caracteres

  useEffect(() => {
    if (isOpen) {
      setReplyText('');
      setLoading(false);
      setError('');
    }
  }, [isOpen]);

  const handleReplyTextChange = useCallback((e) => {
    const newText = e.target.value;
    setReplyText(newText);
    
    if (newText.length > MAX_CARACTERES) {
      setError(`El comentario no puede exceder los ${MAX_CARACTERES} caracteres`);
    } else {
      setError('');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!replyText.trim() || loading) return;

    if (replyText.length > MAX_CARACTERES) {
      setError(`El comentario no puede exceder los ${MAX_CARACTERES} caracteres`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onReplySubmit(replyText.trim());
      handleClose();
    } catch (error) {
      console.error('Error submitting reply:', error);
      setError('Error al enviar la respuesta. Inténtalo de nuevo.');
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
                <div className="reply-textarea-container">
                  <textarea
                    value={replyText}
                    onChange={handleReplyTextChange}
                    placeholder="Escribe tu respuesta..."
                    className={`reply-textarea ${replyText.length > MAX_CARACTERES ? 'error' : ''}`}
                    rows="3"
                    disabled={loading}
                  />
                  <div className="character-count">
                    <span className={replyText.length > MAX_CARACTERES ? 'over-limit' : ''}>
                      {replyText.length}/{MAX_CARACTERES}
                    </span>
                  </div>
                  {error && (
                    <div className="error-message">
                      <span className="error-icon">⚠️</span>
                      {error}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="reply-actions">
                <button 
                  type="submit" 
                  disabled={!replyText.trim() || loading || replyText.length > MAX_CARACTERES}
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
