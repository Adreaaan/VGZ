import React, { useState, useEffect, useCallback } from 'react';
import PostCard from '../Post/PostCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import PostDetailModal from '../Post/PostDetailModal';
import './GameDetailModal.css';
import ReplyModal from '../Post/ReplyModal';

const GameDetailModal = ({ isOpen, onClose, game }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fullGameData, setFullGameData] = useState(null);
  const [loadingGameData, setLoadingGameData] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingOnPost, setCommentingOnPost] = useState(null);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const fetchGamePosts = useCallback(async (pageNum = 1, append = false) => {
    if (!game) return;
    
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/game/${game._id}?page=${pageNum}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setPosts(prev => [...prev, ...(data || [])]);
        } else {
          setPosts(data || []);
        }
        setHasMore((data || []).length === 5);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching game posts:', error);
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [game]);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loadingMore) {
      fetchGamePosts(page + 1, true);
    }
  }, [hasMore, loadingMore, page, fetchGamePosts]);

  const fetchFullGameData = useCallback(async () => {
    if (!game?._id) return;
    
    try {
      setLoadingGameData(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/videojuegos/${game._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const fullGame = await response.json();
        setFullGameData(fullGame);
      } else {
        // Si falla, usar los datos parciales que tenemos
        setFullGameData(game);
      }
    } catch (error) {
      console.error('Error fetching full game data:', error);
      setFullGameData(game);
    } finally {
      setLoadingGameData(false);
    }
  }, [game]);

  useEffect(() => {
    if (isOpen && game) {
      fetchFullGameData();
      fetchGamePosts(1, false);
      setPage(1);
      setHasMore(true);
    }
  }, [isOpen, game, fetchFullGameData, fetchGamePosts]);

  const calculateRatingPercentages = () => {
    const gameData = fullGameData || game;
    if (!gameData?.valoraciones) {
      return { loRecomiendo: 0, noLoRecomiendo: 0, meh: 0 };
    }
    
    const { loRecomiendo = 0, noLoRecomiendo = 0, meh = 0 } = gameData.valoraciones;
    const total = loRecomiendo + noLoRecomiendo + meh;
    
    if (total === 0) {
      return { loRecomiendo: 0, noLoRecomiendo: 0, meh: 0 };
    }
    
    return {
      loRecomiendo: Math.round((loRecomiendo / total) * 100),
      noLoRecomiendo: Math.round((noLoRecomiendo / total) * 100),
      meh: Math.round((meh / total) * 100)
    };
  };

  const percentages = calculateRatingPercentages();

  const displayGame = fullGameData || game;

  const handleCommentClick = useCallback((post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  }, []);

  const handleClosePostDetail = useCallback(() => {
    setShowPostDetail(false);
    setSelectedPost(null);
    // Refresh posts when closing
    fetchGamePosts(1, false);
    setPage(1);
    setHasMore(true);
  }, [fetchGamePosts]);

  const handleReplyClick = useCallback((post) => {
    setCommentingOnPost(post);
    setShowCommentModal(true);
  }, []);

  const handleCloseCommentModal = useCallback(() => {
    setShowCommentModal(false);
    setCommentingOnPost(null);
  }, []);

  const handleCommentSubmit = useCallback(async (commentText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          contenido: commentText,
          videojuego: commentingOnPost.videojuego._id,
          esComentario: true,
          postPadre: commentingOnPost._id,
          esPublico: commentingOnPost.esPublico
        })
      });

      if (response.ok) {
        // Refresh posts
        fetchGamePosts(1, false);
        setPage(1);
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }, [commentingOnPost, fetchGamePosts]);

  if (!isOpen || !game) return null;

  return (
    <div className="game-detail-overlay" onClick={handleOverlayClick}>
      <div className="game-detail-modal">
        <div className="game-detail-header">
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h3>{displayGame.nombre || 'Juego sin nombre'}</h3>
        </div>
        
        <div className="game-detail-content" onScroll={handleScroll}>
          {loadingGameData ? (
            <div className="loading-game-data">
              <LoadingSpinner size="medium" />
              <p>Cargando información del juego...</p>
            </div>
          ) : (
            <div className="game-info-section">
              <div className="game-image-large">
                <img 
                  src={displayGame.imagen || '/placeholder-game.jpg'} 
                  alt={displayGame.nombre || 'Juego'} 
                  onError={(e) => { e.target.src = '/placeholder-game.jpg' }}
                />
              </div>
              
              <div className="game-details">
                <h4>{displayGame.nombre || 'Nombre no disponible'}</h4>
                <p className="game-description">{displayGame.descripcion || 'Descripción no disponible'}</p>
                
                <div className="game-meta">
                  <div className="meta-item">
                    <span className="meta-label">Desarrollador:</span>
                    <span className="meta-value">{displayGame.desarrollador || 'No disponible'}</span>
                  </div>
                  {displayGame.distribuidor && (
                    <div className="meta-item">
                      <span className="meta-label">Distribuidor:</span>
                      <span className="meta-value">{displayGame.distribuidor}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Lanzamiento:</span>
                    <span className="meta-value">
                      {displayGame.fechaLanzamiento 
                        ? new Date(displayGame.fechaLanzamiento).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'No disponible'
                      }
                    </span>
                  </div>
                  {displayGame.generos && Array.isArray(displayGame.generos) && displayGame.generos.length > 0 && (
                    <div className="meta-item">
                      <span className="meta-label">Géneros:</span>
                      <span className="meta-value">{displayGame.generos.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="rating-section">
                  <h5>Valoraciones de usuarios</h5>
                  <div className="rating-bars">
                    <div className="rating-item">
                      <span className="rating-label">👍 Lo recomiendo</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-fill positive" 
                          style={{ width: `${percentages.loRecomiendo}%` }}
                        ></div>
                      </div>
                      <span className="rating-percentage">{percentages.loRecomiendo}%</span>
                    </div>
                    
                    <div className="rating-item">
                      <span className="rating-label">😐 Meh</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-fill neutral" 
                          style={{ width: `${percentages.meh}%` }}
                        ></div>
                      </div>
                      <span className="rating-percentage">{percentages.meh}%</span>
                    </div>
                    
                    <div className="rating-item">
                      <span className="rating-label">👎 No lo recomiendo</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-fill negative" 
                          style={{ width: `${percentages.noLoRecomiendo}%` }}
                        ></div>
                      </div>
                      <span className="rating-percentage">{percentages.noLoRecomiendo}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="game-posts-section">
            <h4>Posts de usuarios</h4>
            {loading ? (
              <div className="posts-loading">
                <LoadingSpinner size="medium" />
                <p>Cargando posts...</p>
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="posts-list">
                  {posts.map(post => (
                    <PostCard 
                      key={post._id}
                      post={post}
                      onUpdate={() => {}}
                      onCommentClick={handleCommentClick}
                      onReplyClick={handleReplyClick}
                      isInModal={true}
                    />
                  ))}
                </div>
                {loadingMore && (
                  <div className="loading-more-posts">
                    <LoadingSpinner size="small" />
                    <p>Cargando más posts...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="no-posts">
                <p>No hay posts con valoración para este juego aún</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PostDetailModal
        isOpen={showPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        onCommentClick={handleCommentClick}
        onReplyClick={handleReplyClick}
      />

      <ReplyModal
        isOpen={showCommentModal}
        onClose={handleCloseCommentModal}
        post={commentingOnPost}
        onReplaySubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default React.memo(GameDetailModal);
