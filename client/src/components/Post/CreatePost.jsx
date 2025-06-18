import React, { useState, useEffect } from 'react';
import './Post.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchGames();
    } else {
      setGames([]);
    }
  }, [searchTerm]);

  const searchGames = async () => {
    try {
      const response = await fetch(`/api/videojuegos/buscar?q=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error searching games:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedGame) return;

    setLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contenido: content,
          videojuego: selectedGame._id,
          esPublico: true
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        setContent('');
        setSelectedGame(null);
        setShowGameSelector(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <div className="create-post-header">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="post-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás jugando?"
            maxLength={500}
            rows={3}
          />
          
          {selectedGame && (
            <div className="selected-game">
              <img src={selectedGame.imagen || '/placeholder-game.jpg'} alt={selectedGame.nombre} />
              <span>{selectedGame.nombre}</span>
              <button onClick={() => setSelectedGame(null)}>✕</button>
            </div>
          )}
          
          <div className="post-actions">
            <div className="post-options">
              <button 
                type="button"
                className="game-selector-btn"
                onClick={() => setShowGameSelector(!showGameSelector)}
              >
                🎮 {selectedGame ? 'Cambiar juego' : 'Seleccionar juego'}
              </button>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedGame || loading}
              className="post-btn"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {showGameSelector && (
            <div className="game-selector">
              <input
                type="text"
                placeholder="Buscar videojuego..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {games.length > 0 && (
                <div className="games-list">
                  {games.map(game => (
                    <div 
                      key={game._id}
                      className="game-item"
                      onClick={() => {
                        setSelectedGame(game);
                        setShowGameSelector(false);
                        setSearchTerm('');
                      }}
                    >
                      <img src={game.imagen || '/placeholder-game.jpg'} alt={game.nombre} />
                      <span>{game.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
