import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import PostCard from '../../components/Post/PostCard';
import CreatePost from '../../components/Post/CreatePost';
import TrendingGames from '../../components/Widgets/TrendingGames';
import SuggestedFollows from '../../components/Widgets/SuggestedFollows';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { useToggle } from '../../hooks/useToggle';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('siguiendo');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [showSearchResults, toggleSearchResults, , hideSearchResults] = useToggle(false);
  const { loading: postsLoading, apiCall } = useApi();

  const fetchPosts = useCallback(async () => {
    try {
      const endpoint = activeTab === 'siguiendo' ? '/api/posts/feed' : '/api/posts/explore';
      const data = await apiCall(endpoint);
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  }, [activeTab, apiCall]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => Array.isArray(prevPosts) ? [newPost, ...prevPosts] : [newPost]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchValue = e.target.elements.search.value.trim();
    
    
    if (!searchValue) {
      hideSearchResults();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = `/api/usuarios/buscar?q=${encodeURIComponent(searchValue)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setSearchResults(data.usuarios || []);
      toggleSearchResults();
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      setSearchResults([]);
      toggleSearchResults();
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      hideSearchResults();
    }
  };

  const closeSearch = () => {
    hideSearchResults();
    setSearchTerm('');
  };

  const handleFollowUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const isFollowing = followingUsers.has(userId);
      
      const response = await fetch(`/api/usuarios/${userId}/seguir`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const newFollowingUsers = new Set(followingUsers);
        if (isFollowing) {
          newFollowingUsers.delete(userId);
        } else {
          newFollowingUsers.add(userId);
        }
        setFollowingUsers(newFollowingUsers);
        
        // Recargar feed si estamos en la pestaña "siguiendo"
        if (activeTab === 'siguiendo') {
          fetchPosts();
        }
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
    }
  };

  const handleUserFollowed = (userId, isNowFollowing) => {
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
      fetchPosts();
    }
  };

  const memoizedPosts = useMemo(() => posts, [posts]);

  const handlePostUpdate = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderContent = () => {
    if (postsLoading) {
      return (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Cargando posts...</p>
        </div>
      );
    }

    if (memoizedPosts.length === 0) {
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

    return memoizedPosts.map(post => (
      <PostCard 
        key={post._id} 
        post={post}
        onUpdate={handlePostUpdate}
      />
    ));
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
                            {user.bio && <div className="bio-small">{user.bio}</div>}
                          </div>
                          <button 
                            className={`follow-btn ${followingUsers.has(user._id) ? 'following' : ''}`}
                            onClick={() => handleFollowUser(user._id)}
                          >
                            {followingUsers.has(user._id) ? 'Siguiendo' : 'Seguir'}
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
              onClick={() => setActiveTab('siguiendo')}
            >
              Siguiendo
            </button>
            <button 
              className={`tab ${activeTab === 'explorar' ? 'active' : ''}`}
              onClick={() => setActiveTab('explorar')}
            >
              Explorar
            </button>
          </div>
        </div>

        <CreatePost onPostCreated={handleNewPost} />

        <div className="posts-container">
          {renderContent()}
        </div>
      </main>

      <aside className="right-sidebar">
        <TrendingGames />
        <SuggestedFollows onUserFollowed={handleUserFollowed} />
      </aside>
    </div>
  );
};

export default React.memo(Home);
