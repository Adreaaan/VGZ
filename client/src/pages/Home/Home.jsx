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
      // Asegurarse de que data es un array
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  const handleNewPost = (newPost) => {
    setPosts(prevPosts => Array.isArray(prevPosts) ? [newPost, ...prevPosts] : [newPost]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    console.log('Buscando personas:', searchTerm);
    // Aquí implementarías la lógica de búsqueda de personas
  };

  console.log('Home component rendering'); // Debug

  return (
    <div className="home-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="home-header">
          <div className="header-content">
            <h1>Inicio</h1>
            <form onSubmit={handleSearch} className="search-container">
              <input
                type="text"
                name="search"
                placeholder="Buscar personas..."
                className="search-input"
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
