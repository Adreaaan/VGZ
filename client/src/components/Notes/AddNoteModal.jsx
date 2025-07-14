import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import NoteTypeSelector from './NoteTypeSelector';
import TextNoteEditor from './TextNoteEditor';
import TodoListEditor from './TodoListEditor';
import BuildEditor from './BuildEditor';
import './AddNoteModal.css';

const AddNoteModal = ({ isOpen, onClose, onNoteCreated }) => {
  const [step, setStep] = useState(1); // 1: game selection, 2: note type, 3: content
  const [selectedGame, setSelectedGame] = useState(null);
  const [noteType, setNoteType] = useState('');
  const [gameSearchTerm, setGameSearchTerm] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState([]);
  const [showGameSearch, setShowGameSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedGame(null);
      setNoteType('');
      setGameSearchTerm('');
      setGameSearchResults([]);
      setShowGameSearch(false);
    }
  }, [isOpen]);

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
      console.error('Error searching games:', error);
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
    setStep(2);
  }, []);

  const handleNoteTypeSelect = useCallback((type) => {
    setNoteType(type);
    setStep(3);
  }, []);

  const handleBackToGameSelection = useCallback(() => {
    setStep(1);
    setSelectedGame(null);
    setNoteType('');
  }, []);

  const handleBackToTypeSelection = useCallback(() => {
    setStep(2);
    setNoteType('');
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleNoteCreated = useCallback((noteData) => {
    onNoteCreated(noteData);
  }, [onNoteCreated]);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="game-selection-step">
            <h3>Selecciona un juego</h3>
            <div className="game-search-container">
              <input
                type="text"
                placeholder="🎮 Buscar videojuego..."
                value={gameSearchTerm}
                onChange={handleGameSearchChange}
                className="game-search-input"
                autoFocus
              />
              {showGameSearch && gameSearchResults.length > 0 && (
                <div className="game-search-results">
                  {gameSearchResults.map(game => (
                    <div
                      key={game._id}
                      className="game-search-result"
                      onClick={() => selectGame(game)}
                    >
                      <img 
                        src={game.imagen} 
                        alt={game.nombre} 
                        className="game-result-image"
                        onError={(e) => {
                          e.target.src = '/placeholder-game.jpg';
                        }}
                      />
                      <div className="game-result-info">
                        <div className="game-result-name">{game.nombre}</div>
                        <div className="game-result-dev">{game.desarrollador}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="note-type-step">
            <div className="step-header">
              <button onClick={handleBackToGameSelection} className="back-btn">
                ← Cambiar juego
              </button>
              <h3>Tipo de nota para {selectedGame?.nombre}</h3>
            </div>
            <NoteTypeSelector 
              selectedGame={selectedGame}
              onTypeSelect={handleNoteTypeSelect}
            />
          </div>
        );

      case 3:
        return (
          <div className="note-content-step">
            <div className="step-header">
              <button onClick={handleBackToTypeSelection} className="back-btn">
                ← Cambiar tipo
              </button>
              <h3>
                {noteType === 'text' && 'Bloc de notas'}
                {noteType === 'todo' && 'Lista de tareas'}
                {noteType === 'build' && 'Build del personaje'}
              </h3>
            </div>
            {noteType === 'text' && (
              <TextNoteEditor 
                game={selectedGame}
                onSave={handleNoteCreated}
                onCancel={onClose}
                loading={loading}
                setLoading={setLoading}
              />
            )}
            {noteType === 'todo' && (
              <TodoListEditor 
                game={selectedGame}
                onSave={handleNoteCreated}
                onCancel={onClose}
                loading={loading}
                setLoading={setLoading}
              />
            )}
            {noteType === 'build' && (
              <BuildEditor 
                game={selectedGame}
                onSave={handleNoteCreated}
                onCancel={onClose}
                loading={loading}
                setLoading={setLoading}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return createPortal(
    <div className="add-note-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-note-modal">
        <div className="modal-header">
          <h2>Crear Nueva Nota</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          {renderStep()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddNoteModal;
