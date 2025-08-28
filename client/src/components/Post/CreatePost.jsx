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
  const [showRatingConflict, setShowRatingConflict] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [error, setError] = useState('');

  const MAX_CARACTERES = 500;

  const isFormValid = useMemo(() => {
    return contenido.trim() && selectedGame && !loading && contenido.length <= MAX_CARACTERES;
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

  const handleContenidoChange = useCallback((e) => {
    const newContenido = e.target.value;
    setContenido(newContenido);
    
    if (newContenido.length > MAX_CARACTERES) {
      setError(`El contenido no puede exceder los ${MAX_CARACTERES} caracteres`);
    } else {
      setError('');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (contenido.length > MAX_CARACTERES) {
      setError(`El contenido no puede exceder los ${MAX_CARACTERES} caracteres`);
      return;
    }
    
    if (!isFormValid) {
      alert('Por favor, añade contenido y selecciona un videojuego');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const postData = {
        contenido: contenido.trim(),
        videojuego: selectedGame._id,
        esPublico: true,
        esComentario: false
      };

      // Solo añadir valoración si se seleccionó una
      if (valoracion) {
        postData.valoracionJuego = valoracion;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.status === 409) {
        // Conflicto de valoración
        const conflictInfo = await response.json();
        setConflictData({
          ...conflictInfo,
          nuevaValoracion: valoracion,
          contenidoNuevo: contenido.trim()
        });
        setShowRatingConflict(true);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated?.(newPost);
        
        // Resetear formulario
        setContenido('');
        clearGameSelection();
        setValoracion('');
      } else {
        const errorData = await response.json();
        // Mostrar errores específicos del servidor
        if (errorData.errores && Array.isArray(errorData.errores)) {
          const errorMessages = errorData.errores.map(err => err.message).join('. ');
          setError(errorMessages);
        } else {
          setError(errorData.mensaje || 'Error al crear el post');
        }
      }
    } catch (error) {
      console.error('Error creando post:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [isFormValid, contenido, selectedGame, valoracion, onPostCreated, clearGameSelection]);

  const handleUpdateRating = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Crear el nuevo post con flag para actualizar valoración
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          contenido: conflictData.contenidoNuevo,
          videojuego: selectedGame._id,
          valoracionJuego: conflictData.nuevaValoracion,
          esPublico: true,
          esComentario: false,
          actualizarValoracion: true
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated?.(newPost);
        
        // Resetear formulario
        setContenido('');
        clearGameSelection();
        setValoracion('');
        setShowRatingConflict(false);
        setConflictData(null);
      } else {
        throw new Error('Error al crear el post con nueva valoración');
      }
    } catch (error) {
      console.error('Error actualizando valoración:', error);
      alert('Error al actualizar la valoración');
    }
  }, [conflictData, selectedGame, onPostCreated, clearGameSelection]);

  const handleCancelRatingUpdate = useCallback(() => {
    setShowRatingConflict(false);
    setConflictData(null);
    setLoading(false);
  }, []);

  const getRatingText = (rating) => {
    const ratings = {
      'lo_recomiendo': '👍 Lo recomiendo',
      'no_lo_recomiendo': '👎 No lo recomiendo',
      'meh': '😐 Meh'
    };
    return ratings[rating] || rating;
  };

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
            onChange={handleContenidoChange}
            className={`post-textarea ${contenido.length > MAX_CARACTERES ? 'error' : ''}`}
            rows="3"
            required
          />
          <div className="character-count">
            <span className={contenido.length > MAX_CARACTERES ? 'over-limit' : ''}>
              {contenido.length}/{MAX_CARACTERES}
            </span>
          </div>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
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
            
            {selectedGame && (
              <div className="selected-game-info">
                <div className="selected-game">
                  <img src={selectedGame.imagen} alt={selectedGame.nombre} className="selected-game-thumb" />
                  <span>{selectedGame.nombre}</span>
                  <button type="button" onClick={clearGameSelection} className="remove-game-btn">✕</button>
                </div>
                
                <div className="rating-selector">
                  <p className="rating-prompt">¿Cómo valoras este juego?</p>
                  <div className="rating-buttons">
                    <button
                      type="button"
                      className={`rating-btn positive ${valoracion === 'lo_recomiendo' ? 'active' : ''}`}
                      onClick={() => setValoracion(valoracion === 'lo_recomiendo' ? '' : 'lo_recomiendo')}
                    >
                      👍 Lo recomiendo
                    </button>
                    <button
                      type="button"
                      className={`rating-btn neutral ${valoracion === 'meh' ? 'active' : ''}`}
                      onClick={() => setValoracion(valoracion === 'meh' ? '' : 'meh')}
                    >
                      😐 Meh
                    </button>
                    <button
                      type="button"
                      className={`rating-btn negative ${valoracion === 'no_lo_recomiendo' ? 'active' : ''}`}
                      onClick={() => setValoracion(valoracion === 'no_lo_recomiendo' ? '' : 'no_lo_recomiendo')}
                    >
                      👎 No lo recomiendo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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

      {showRatingConflict && (
        <div className="rating-conflict-modal">
          <div className="rating-conflict-content">
            <h3>⚠️ Ya has valorado este juego</h3>
            <p>
              Tu valoración anterior: <strong>{getRatingText(conflictData.valoracionAnterior)}</strong>
            </p>
            <p>
              Nueva valoración: <strong>{getRatingText(conflictData.nuevaValoracion)}</strong>
            </p>
            <p>¿Quieres eliminar tu valoración anterior y usar la nueva valoración en este post?</p>
            
            <div className="conflict-actions">
              <button 
                onClick={handleUpdateRating}
                className="update-rating-btn"
              >
                Sí, actualizar valoración
              </button>
              <button 
                onClick={handleCancelRatingUpdate}
                className="cancel-update-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CreatePost);
