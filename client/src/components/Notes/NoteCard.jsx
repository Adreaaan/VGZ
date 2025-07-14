import React, { useState, useCallback } from 'react';
import './NoteCard.css';
import EditNoteModal from './EditNoteModal';

const NoteCard = ({ note, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleCardClick = useCallback((e) => {
    // No abrir si se hace click en el menú o botones
    if (e.target.closest('.note-menu') || e.target.closest('.delete-confirm-overlay')) {
      return;
    }
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleNoteUpdated = useCallback((updatedNote) => {
    console.log('Note updated in card:', updatedNote); // Debug
    onUpdate(note._id, updatedNote);
    setShowEditModal(false);
  }, [note._id, onUpdate]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  }, []);

  const confirmDelete = useCallback(() => {
    onDelete(note._id);
    setShowDeleteConfirm(false);
  }, [note._id, onDelete]);

  const getTypeIcon = () => {
    switch (note.tipo) {
      case 'texto': return '📝';
      case 'todo': return '✅';
      case 'build': return '⚔️';
      default: return '📄';
    }
  };

  const getTypeLabel = () => {
    switch (note.tipoNota) {
      case 'bloc_notas': return 'Bloc de notas';
      case 'todo_list': return 'Lista de tareas';
      case 'build_rpg': return 'Build RPG';
      default: return 'Nota';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderPreview = () => {
    switch (note.tipoNota) {
      case 'bloc_notas':
        const textoContent = note.contenidoTexto || note.contenido?.texto || '';
        return (
          <div className="text-preview">
            {textoContent.substring(0, 150)}
            {textoContent.length > 150 && '...'}
          </div>
        );
      
      case 'todo_list':
        const tareas = note.tareas || [];
        const completedCount = tareas.filter(tarea => 
          tarea.categoria === 'done' || tarea.completada === true
        ).length;
        const inProgressCount = tareas.filter(tarea => 
          tarea.categoria === 'doing'
        ).length;
        const pendingCount = tareas.filter(tarea => 
          tarea.categoria === 'todo' || (!tarea.categoria && !tarea.completada)
        ).length;
        
        return (
          <div className="todo-preview">
            <div className="todo-stats">
              <div className="todo-stat">
                <span className="stat-number">{pendingCount}</span>
                <span className="stat-label">Por hacer</span>
              </div>
              <div className="todo-stat">
                <span className="stat-number">{inProgressCount}</span>
                <span className="stat-label">En progreso</span>
              </div>
              <div className="todo-stat">
                <span className="stat-number">{completedCount}</span>
                <span className="stat-label">Completado</span>
              </div>
            </div>
            {tareas.length > 0 && (
              <div className="todo-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(completedCount / tareas.length) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round((completedCount / tareas.length) * 100)}% completado
                </span>
              </div>
            )}
          </div>
        );
      
      case 'build_rpg':
        const build = note.buildRPG || {};
        return (
          <div className="build-preview">
            <div className="build-character">
              <strong>{build.nombre || 'Sin nombre'}</strong>
              {build.clase && ` - ${build.clase}`}
              {build.nivel && ` (Nivel ${build.nivel})`}
            </div>
            {build.arma && (
              <div className="build-weapon">🗡️ {build.arma}</div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  console.log('Note data in card:', note); // Debug

  return (
    <>
      <div className="note-card" onClick={handleCardClick}>
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>¿Eliminar nota?</h3>
              <p>Esta acción no se puede deshacer.</p>
              <div className="confirm-actions">
                <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">
                  Cancelar
                </button>
                <button onClick={confirmDelete} className="delete-btn">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="note-header">
          <div className="note-type">
            <span className="type-icon">{getTypeIcon()}</span>
            <span className="type-label">{getTypeLabel()}</span>
          </div>
          <div className="note-menu">
            <button 
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={handleDelete} className="menu-item delete">
                  🗑️ Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="note-game">
          <img 
            src={note.videojuego?.imagen} 
            alt={note.videojuego?.nombre}
            className="game-image"
            onError={(e) => {
              e.target.src = '/placeholder-game.jpg';
            }}
          />
          <span className="game-name">{note.videojuego?.nombre}</span>
        </div>

        <div className="note-content">
          <h3 className="note-title">
            {note.titulo}
            {(note.esPrivada || !note.esPublica) && (
              <span className="private-badge">🔒</span>
            )}
          </h3>
          {renderPreview()}
        </div>

        <div className="note-footer">
          <span className="note-date">{formatDate(note.createdAt)}</span>
        </div>
      </div>

      {showEditModal && (
        <EditNoteModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          note={note}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </>
  );
};

export default NoteCard;
