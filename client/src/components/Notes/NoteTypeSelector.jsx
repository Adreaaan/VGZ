import React, { useCallback } from 'react';
import './NoteTypeSelector.css';

const NoteTypeSelector = ({ selectedGame, onTypeSelect }) => {
  const isRPG = selectedGame?.generos?.some(genre => 
    genre.toLowerCase().includes('rpg') || 
    genre.toLowerCase().includes('role-playing')
  );

  const noteTypes = [
    {
      type: 'text',
      icon: '📝',
      title: 'Bloc de Notas',
      description: 'Notas libres en formato texto',
      available: true
    },
    {
      type: 'todo',
      icon: '✅',
      title: 'Lista de Tareas',
      description: 'Lista organizable con drag & drop',
      available: true
    },
    {
      type: 'build',
      icon: '⚔️',
      title: 'Build del Personaje',
      description: 'Estadísticas y construcción del personaje',
      available: isRPG
    }
  ];

  const handleTypeSelect = useCallback((type) => {
    onTypeSelect(type);
  }, [onTypeSelect]);

  return (
    <div className="note-type-selector">
      {noteTypes.map(noteType => (
        <button
          key={noteType.type}
          className={`note-type-option ${!noteType.available ? 'disabled' : ''}`}
          onClick={() => noteType.available && handleTypeSelect(noteType.type)}
          disabled={!noteType.available}
        >
          <div className="note-type-icon">{noteType.icon}</div>
          <div className="note-type-content">
            <h4>{noteType.title}</h4>
            <p>{noteType.description}</p>
            {!noteType.available && (
              <span className="not-available">No disponible para este género</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default NoteTypeSelector;
