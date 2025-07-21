import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import PostCard from '../../components/Post/PostCard';
import CreatePost from '../../components/Post/CreatePost';
import TrendingGames from '../../components/Widgets/TrendingGames';
import SuggestedFollows from '../../components/Widgets/SuggestedFollows';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useToggle } from '../../hooks/useToggle';
import { useApi } from '../../hooks/useApi';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import PostDetailModal from '../../components/Post/PostDetailModal';
import ReplyModal from '../../components/Post/ReplyModal';
import GameDetailModal from '../../components/Game/GameDetailModal';
import { useModalStack } from '../../hooks/useModalStack';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('siguiendo');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showSearchResults, toggleSearchResults, , hideSearchResults] = useToggle(false);
  const { loading: postsLoading, apiCall } = useApi();
  const { replaceModal, closeModal, currentModal } = useModalStack();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingOnPost, setReplyingOnPost] = useState(null);
  const [showGameDetail, setShowGameDetail] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const endpoint = activeTab === 'siguiendo' ? '/api/posts/feed' : '/api/posts/explore';
      const data = await apiCall(`${endpoint}?page=${pageNum}&limit=10`);
      
      if (append) {
        setPosts(prev => [...prev, ...(data || [])]);
      } else {
        setPosts(data || []);
      }
      
      setHasMore((data || []).length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (!append) setPosts([]);
    }
  }, [activeTab, apiCall]);

  const fetchMorePosts = useCallback(async () => {
    if (!hasMore || postsLoading) return;
    await fetchPosts(page + 1, true);
  }, [fetchPosts, page, hasMore, postsLoading]);

  const [isFetchingMore] = useInfiniteScroll(fetchMorePosts);

  useEffect(() => {
    fetchPosts(1, false);
    setPage(1);
    setHasMore(true);
    
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
  }, [activeTab, fetchPosts]);

  const handleTabChange = useCallback((tab) => {
    if (activeTab === tab) {
      // Double click - reload posts
      fetchPosts(1, false);
      setPage(1);
      setHasMore(true);
      window.scrollTo(0, 0);
    } else {
      setActiveTab(tab);
    }
  }, [activeTab, fetchPosts]);

  const handlePostUpdate = useCallback(() => {
    fetchPosts(1, false);
    setPage(1);
    setHasMore(true);
  }, [fetchPosts]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    const searchValue = e.target.elements.search.value.trim();
    
    if (!searchValue) {
      hideSearchResults();
      return;
    }

    try {
      const data = await apiCall(`/api/usuarios/buscar?q=${encodeURIComponent(searchValue)}`);
      setSearchResults(data.usuarios || []);
      toggleSearchResults();
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      setSearchResults([]);
    }
  }, [apiCall, hideSearchResults, toggleSearchResults]);

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      hideSearchResults();
    }
  }, [hideSearchResults]);

  const closeSearch = useCallback(() => {
    hideSearchResults();
    setSearchTerm('');
  }, [hideSearchResults]);

  const handleFollowUser = useCallback(async (userId) => {
    try {
      const isFollowing = followingUsers.has(userId);
      const token = localStorage.getItem('token');
      
      console.log('Attempting to follow/unfollow user:', userId, 'Currently following:', isFollowing);
      
      const response = await fetch(`/api/usuarios/${userId}/seguir`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const newFollowingUsers = new Set(followingUsers);
        if (isFollowing) {
          newFollowingUsers.delete(userId);
          console.log('Unfollowed user:', userId);
        } else {
          newFollowingUsers.add(userId);
          console.log('Followed user:', userId);
        }
        setFollowingUsers(newFollowingUsers);
        
        // Recargar feed si estamos en la pestaña "siguiendo"
        if (activeTab === 'siguiendo') {
          fetchPosts(1, false);
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
    }
  }, [followingUsers, activeTab, fetchPosts]);

  const handleUserFollowed = useCallback((userId, isNowFollowing) => {
    // Actualizar el estado local de usuarios seguidos
    const newFollowingUsers = new Set(followingUsers);
    if (isNowFollowing) {
      newFollowingUsers.add(userId);
    } else {
      newFollowingUsers.delete(userId);
    }
    setFollowingUsers(newFollowingUsers);
    
    // Recargar feed si estamos en la pestaña "siguiendo"
    if (activeTab === 'siguiendo') {
      fetchPosts(1, false);
    }
  }, [followingUsers, activeTab, fetchPosts]);

  const handleCommentClick = useCallback(async (post) => {
    try {
      // Fetch fresh data for the clicked post
      const response = await fetch(`/api/posts/${post._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const freshPost = await response.json();
        setSelectedPost(freshPost);
        setShowPostDetail(true);
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      // Fallback to cached data
      setSelectedPost(post);
      setShowPostDetail(true);
    }
  }, []);

  const handleClosePostDetail = useCallback(() => {
    setShowPostDetail(false);
    setSelectedPost(null);
    // Refresh the main posts feed
    fetchPosts(1, false);
    setPage(1);
    setHasMore(true);
  }, [fetchPosts]);

  const handleReplyClick = useCallback((post) => {
    console.log('Reply button clicked for post:', post._id); // Debug
    setReplyingOnPost(post);
    setShowReplyModal(true);
  }, []);

  const handleCloseReplyModal = useCallback(() => {
    setShowReplyModal(false);
    setReplyingOnPost(null);
  }, []);

  const handleReplySubmit = useCallback(async (replyText) => {
    if (!replyingOnPost) {
      console.error('No post to reply to');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          contenido: replyText,
          videojuego: replyingOnPost.videojuego._id,
          esComentario: true,
          postPadre: replyingOnPost._id,
          esPublico: replyingOnPost.esPublico
        })
      });

      if (response.ok) {
        // Close the reply modal first
        setShowReplyModal(false);
        setReplyingOnPost(null);
        
        // Refresh the popup if it's open
        if (showPostDetail && selectedPost && selectedPost._id === replyingOnPost._id) {
          const freshResponse = await fetch(`/api/posts/${replyingOnPost._id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (freshResponse.ok) {
            const freshPost = await freshResponse.json();
            setSelectedPost(freshPost);
          }
        }
        
        // Refresh posts feed
        fetchPosts(1, false);
        setPage(1);
        setHasMore(true);
      } else {
        throw new Error('Failed to create reply');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }, [replyingOnPost, fetchPosts, showPostDetail, selectedPost]);

  const handleGameClick = useCallback((game) => {
    console.log('handleGameClick called with:', game.nombre); // Debug
    setSelectedGame(game);
    setShowGameDetail(true);
  }, []);

  const handleCloseGameDetail = useCallback(() => {
    setShowGameDetail(false);
    setSelectedGame(null);
  }, []);

  const handleUserClick = useCallback((userId) => {
    navigate(`/profile/${userId}`);
    closeSearch(); // Cerrar búsqueda al navegar
  }, [navigate, closeSearch]);

  const renderContent = () => {
    if (postsLoading && posts.length === 0) {
      return (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Cargando posts...</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="empty-feed">
          <div className="empty-icon">🎮</div>
          <h3>No hay posts que mostrar</h3>
          <p>
            {activeTab === 'siguiendo' 
              ? 'Sigue a otros gamers para ver sus posts aquí'
              : 'No hay posts públicos disponibles'
            }
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="posts-container">
          {posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post}
              onUpdate={handlePostUpdate}
              onCommentClick={handleCommentClick}
              onReplyClick={handleReplyClick}
              onGameClick={handleGameClick}
            />
          ))}
        </div>

      </>
    );
  };

  return (
    <div className="home-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="home-header">
          <div className="header-content">
            <h1>Inicio</h1>
            <div className="search-wrapper">
              <form onSubmit={handleSearch} className="search-container">
                <input
                  type="text"
                  name="search"
                  placeholder="Buscar personas..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                />
                <button type="submit" className="search-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
              
              {showSearchResults && (
                <div className="search-results">
                  <div className="search-results-header">
                    <h3>Resultados de búsqueda</h3>
                    <button onClick={closeSearch} className="close-search">✕</button>
                  </div>
                  {searchResults.length > 0 ? (
                    <div className="users-list">
                      {searchResults.map(user => (
                        <div key={user._id} className="user-result">
                          <div 
                            className="user-avatar-small"
                            onClick={() => handleUserClick(user._id)}
                          >
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} />
                            ) : (
                              <div className="avatar-placeholder-small">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div 
                            className="user-info-small"
                            onClick={() => handleUserClick(user._id)}
                          >
                            <div className="username-small">@{user.username}</div>
                            {user.bio && <div className="bio-small">{user.bio}</div>}
                          </div>
                          <button 
                            className={`follow-btn ${followingUsers.has(user._id) ? 'following' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowUser(user._id);
                            }}
                          >
                            <span className="follow-text">
                              {followingUsers.has(user._id) ? 'Siguiendo' : 'Seguir'}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-results">No se encontraron usuarios</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="home-tabs">
            <button 
              className={`tab ${activeTab === 'siguiendo' ? 'active' : ''}`}
              onClick={() => handleTabChange('siguiendo')}
            >
              Siguiendo
            </button>
            <button 
              className={`tab ${activeTab === 'explorar' ? 'active' : ''}`}
              onClick={() => handleTabChange('explorar')}
            >
              Explorar
            </button>
          </div>
        </div>

        <CreatePost onPostCreated={handlePostUpdate} />
        
        {renderContent()}
      </main>

      <aside className="right-sidebar">
        <TrendingGames onGameClick={handleGameClick} />
        <SuggestedFollows onUserFollowed={handleUserFollowed} />
      </aside>


      <ReplyModal
        isOpen={showReplyModal}
        onClose={handleCloseReplyModal}
        post={replyingOnPost}
        onReplySubmit={handleReplySubmit}
        onGameClick={handleGameClick}
      />

      <PostDetailModal
        isOpen={showPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        onCommentClick={handleCommentClick}
        onReplyClick={handleReplyClick}
        onGameClick={handleGameClick}
      />

      <GameDetailModal
        isOpen={showGameDetail}
        onClose={handleCloseGameDetail}
        game={selectedGame}
      />


    </div>
  );
};


export default React.memo(Home);


