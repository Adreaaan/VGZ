import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import PostCard from '../../components/Post/PostCard';
import CreatePost from '../../components/Post/CreatePost';
import TrendingGames from '../../components/Widgets/TrendingGames';
import SuggestedFollows from '../../components/Widgets/SuggestedFollows';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('siguiendo');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'siguiendo' ? '/api/posts/feed' : '/api/posts/explore';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="home-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="home-header">
          <h1>Inicio</h1>
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
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando posts...</p>
            </div>
          ) : posts.length === 0 ? (
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
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post}
                onUpdate={() => fetchPosts()}
              />
            ))
          )}
        </div>
      </main>

      <aside className="right-sidebar">
        <TrendingGames />
        <SuggestedFollows />
      </aside>
    </div>
  );
};

export default Home;
