import React, { useState, useCallback, useMemo } from 'react';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [contenido, setContenido] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameSearchTerm, setGameSearchTerm] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState([]);
  const [showGameSearch, setShowGameSearch] = useState(false);
  const [valoracion, setValoracion] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => {
    return contenido.trim() && selectedGame && !loading;
  }, [contenido, selectedGame, loading]);

  const searchGames = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setGameSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/videojuegos/buscar?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const games = await response.json();
        setGameSearchResults(games || []);
      }
    } catch (error) {
      console.error('Error buscando juegos:', error);
      setGameSearchResults([]);
    }
  }, []);

  const handleGameSearchChange = useCallback((e) => {
    const value = e.target.value;
    setGameSearchTerm(value);
    searchGames(value);
    setShowGameSearch(true);
  }, [searchGames]);

  const selectGame = useCallback((game) => {
    setSelectedGame(game);
    setGameSearchTerm(game.nombre);
    setShowGameSearch(false);
    setGameSearchResults([]);
  }, []);

  const clearGameSelection = useCallback(() => {
    setSelectedGame(null);
    setGameSearchTerm('');
    setValoracion('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('Por favor, añade contenido y selecciona un videojuego');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contenido: contenido.trim(),
          videojuego: selectedGame._id,
          valoracionJuego: valoracion || null,
          esPublico: true
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated?.(newPost);
        
        // Resetear formulario
        setContenido('');
        clearGameSelection();
        setValoracion('');
      } else {
        throw new Error('Error al crear el post');
      }
    } catch (error) {
      console.error('Error creando post:', error);
      alert('Error al crear el post');
    } finally {
      setLoading(false);
    }
  }, [isFormValid, contenido, selectedGame, valoracion, onPostCreated, clearGameSelection]);

  const renderGameDropdown = () => (
    showGameSearch && gameSearchResults.length > 0 && (
      <div className="game-dropdown">
        {gameSearchResults.map(game => (
          <div
            key={game._id}
            className="game-option"
            onClick={() => selectGame(game)}
          >
            <img src={game.imagen} alt={game.nombre} className="game-thumb" />
            <span>{game.nombre}</span>
          </div>
        ))}
      </div>
    )
  );

  const renderRatingSelector = () => (
    selectedGame && (
      <div className="rating-selector">
        {{
          'lo_recomiendo': '👍',
          'meh': '😐',
          'no_lo_recomiendo': '👎'
        }[valoracion]}
      </div>
    )
  );

  return (
    <div className="create-post">
      <div className="create-post-header">
        <h3>¿Qué estás jugando?</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="post-input-section">
          <textarea
            placeholder="Comparte tu experiencia gaming..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="post-textarea"
            rows="3"
            required
          />
        </div>

        <div className="post-options">
          <div className="game-selector">
            <input
              type="text"
              placeholder="🎮 Buscar videojuego..."
              value={gameSearchTerm}
              onChange={handleGameSearchChange}
              className="game-input"
              required
            />
            {renderGameDropdown()}
          </div>

          {renderRatingSelector()}
        </div>

        <div className="post-actions">
          <button
            type="submit"
            disabled={!isFormValid}
            className="post-submit-btn"
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(CreatePost);
