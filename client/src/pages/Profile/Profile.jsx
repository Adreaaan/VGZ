import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import PostCard from '../../components/Post/PostCard';
import NoteCard from '../../components/Notes/NoteCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import PostDetailModal from '../../components/Post/PostDetailModal';
import ReplyModal from '../../components/Post/ReplyModal';
import GameDetailModal from '../../components/Game/GameDetailModal';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingOnPost, setReplyingOnPost] = useState(null);
  const [showGameDetail, setShowGameDetail] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(currentUserData);

      const profileUserId = userId || currentUserData.id;
      
      const response = await fetch(`/api/usuarios/${profileUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Verificar si está siguiendo al usuario
        if (currentUserData.id !== profileUserId) {
          const isFollowingUser = userData.seguidores.some(
            follower => follower._id === currentUserData.id
          );
          setIsFollowing(isFollowingUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [userId]);

  const fetchUserPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const profileUserId = userId || currentUserData.id;
      
      const response = await fetch(`/api/posts/usuario/${profileUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  }, [userId]);

  const fetchLikedPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const profileUserId = userId || currentUserData.id;
      
      const response = await fetch(`/api/posts/liked/${profileUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLikedPosts(data);
      }
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  }, [userId]);

  const fetchPublicNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const profileUserId = userId || currentUserData.id;
      
      const response = await fetch(`/api/notas/publicas/${profileUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPublicNotes(data);
      }
    } catch (error) {
      console.error('Error fetching public notes:', error);
    }
  }, [userId]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await fetchUserProfile();
      
      if (activeTab === 'posts') {
        await fetchUserPosts();
      } else if (activeTab === 'likes') {
        await fetchLikedPosts();
      } else if (activeTab === 'notes') {
        await fetchPublicNotes();
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [userId, activeTab, fetchUserProfile, fetchUserPosts, fetchLikedPosts, fetchPublicNotes]);

  const handleFollow = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/usuarios/${user._id}/seguir`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setUser(prev => ({
          ...prev,
          seguidores: isFollowing 
            ? prev.seguidores.filter(f => f._id !== currentUser.id)
            : [...prev.seguidores, { _id: currentUser.id, username: currentUser.username }]
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [user, isFollowing, currentUser]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleCommentClick = useCallback((post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  }, []);

  const handleClosePostDetail = useCallback(() => {
    setShowPostDetail(false);
    setSelectedPost(null);
    // Refresh the current tab
    if (activeTab === 'posts') {
      fetchUserPosts();
    } else if (activeTab === 'likes') {
      fetchLikedPosts();
    }
  }, [activeTab, fetchUserPosts, fetchLikedPosts]);

  const handleReplyClick = useCallback((post) => {
    setReplyingOnPost(post);
    setShowReplyModal(true);
  }, []);

  const handleCloseReplyModal = useCallback(() => {
    setShowReplyModal(false);
    setReplyingOnPost(null);
  }, []);

  const handleReplySubmit = useCallback(async (replyText) => {
    if (!replyingOnPost) return;
    
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
        setShowReplyModal(false);
        setReplyingOnPost(null);
        
        // Refresh if post detail is open
        if (showPostDetail && selectedPost && selectedPost._id === replyingOnPost._id) {
          const freshResponse = await fetch(`/api/posts/${replyingOnPost._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (freshResponse.ok) {
            const freshPost = await freshResponse.json();
            setSelectedPost(freshPost);
          }
        }
        
        // Refresh the current tab
        if (activeTab === 'posts') {
          fetchUserPosts();
        } else if (activeTab === 'likes') {
          fetchLikedPosts();
        }
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      throw error;
    }
  }, [replyingOnPost, showPostDetail, selectedPost, activeTab, fetchUserPosts, fetchLikedPosts]);

  const handleGameClick = useCallback((game) => {
    setSelectedGame(game);
    setShowGameDetail(true);
  }, []);

  const handleCloseGameDetail = useCallback(() => {
    setShowGameDetail(false);
    setSelectedGame(null);
  }, []);

  const isOwnProfile = currentUser && user && currentUser.id === user._id;

  if (loading && !user) {
    return (
      <div className="profile-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-container">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="profile-header">
          <div className="profile-banner">
            <div className="profile-info">
              <div className="profile-avatar">
                <img 
                  src={user?.fotoPerfil || '/default-avatar.png'} 
                  alt={user?.username}
                  className="avatar-image"
                />
              </div>
              <div className="profile-details">
                <h1 className="profile-name">{user?.username}</h1>
                <p className="profile-handle">@{user?.username}</p>
                {user?.biografia && (
                  <p className="profile-bio">{user.biografia}</p>
                )}
                <div className="profile-stats">
                  <div className="stat">
                    <strong>{user?.siguiendo?.length || 0}</strong>
                    <span>Siguiendo</span>
                  </div>
                  <div className="stat">
                    <strong>{user?.seguidores?.length || 0}</strong>
                    <span>Seguidores</span>
                  </div>
                </div>
              </div>
              {!isOwnProfile && (
                <div className="profile-actions">
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    <span className="follow-text">
                      {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => handleTabChange('posts')}
          >
            Publicaciones
          </button>
          <button 
            className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
            onClick={() => handleTabChange('likes')}
          >
            Me gusta
          </button>
          <button 
            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => handleTabChange('notes')}
          >
            Notas públicas
          </button>
        </div>

        <div className="profile-content">
          {loading ? (
            <div className="loading-container">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {activeTab === 'posts' && (
                <div className="posts-feed">
                  {posts.length > 0 ? (
                    posts.map(post => (
                      <PostCard 
                        key={post._id} 
                        post={post}
                        onCommentClick={handleCommentClick}
                        onReplyClick={handleReplyClick}
                        onGameClick={handleGameClick}
                      />
                    ))
                  ) : (
                    <div className="empty-feed">
                      <div className="empty-icon">📝</div>
                      <h3>No hay publicaciones</h3>
                      <p>
                        {isOwnProfile 
                          ? 'Aún no has publicado nada'
                          : `${user?.username} no ha publicado nada aún`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'likes' && (
                <div className="liked-posts-feed">
                  {likedPosts.length > 0 ? (
                    likedPosts.map(post => (
                      <PostCard 
                        key={post._id} 
                        post={post}
                        onCommentClick={handleCommentClick}
                        onReplyClick={handleReplyClick}
                        onGameClick={handleGameClick}
                      />
                    ))
                  ) : (
                    <div className="empty-feed">
                      <div className="empty-icon">❤️</div>
                      <h3>No hay publicaciones que le gusten</h3>
                      <p>
                        {isOwnProfile
                          ? 'Aún no te ha gustado ninguna publicación'
                          : `A ${user?.username} no le ha gustado ninguna publicación aún`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="public-notes-feed">
                  {publicNotes.length > 0 ? (
                    <div className="notes-grid">
                      {publicNotes.map(note => (
                        <NoteCard key={note._id} note={note} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-feed">
                      <div className="empty-icon">📚</div>
                      <h3>No hay notas públicas</h3>
                      <p>
                        {isOwnProfile
                          ? 'Aún no has creado notas públicas'
                          : `${user?.username} no ha creado notas públicas aún`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <PostDetailModal
        isOpen={showPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        onCommentClick={handleCommentClick}
        onReplyClick={handleReplyClick}
        onGameClick={handleGameClick}
      />

      <ReplyModal
        isOpen={showReplyModal}
        onClose={handleCloseReplyModal}
        post={replyingOnPost}
        onReplySubmit={handleReplySubmit}
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

export default Profile;
