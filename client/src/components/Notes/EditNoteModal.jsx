import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TextNoteViewer from './TextNoteViewer';
import TodoListViewer from './TodoListViewer';
import BuildViewer from './BuildViewer';
import './EditNoteModal.css';

const EditNoteModal = ({ isOpen, onClose, note, onNoteUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async (updatedContent, isPrivate) => {
    console.log('Saving note with content:', updatedContent, 'private:', isPrivate); // Debug
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notas/${note._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: note.titulo,
          contenido: updatedContent,
          esPrivada: isPrivate
        })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        console.log('Updated note from server:', updatedNote); // Debug
        onNoteUpdated(updatedNote);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug
        throw new Error(errorData.mensaje || 'Error al actualizar la nota');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Error al actualizar la nota');
    } finally {
      setLoading(false);
    }
  }, [note, onNoteUpdated]);

  const getTypeLabel = () => {
    switch (note.tipoNota) {
      case 'bloc_notas': return 'Bloc de notas';
      case 'todo_list': return 'Lista de tareas';
      case 'build_rpg': return 'Build RPG';
      default: return 'Nota';
    }
  };

  const renderNoteContent = () => {
    const commonProps = {
      note,
      isEditing,
      onSave: handleSave,
      onCancel: handleCancelEdit,
      loading
    };

    switch (note.tipoNota) {
      case 'bloc_notas':
        return <TextNoteViewer {...commonProps} />;
      case 'todo_list':
        return <TodoListViewer {...commonProps} />;
      case 'build_rpg':
        return <BuildViewer {...commonProps} />;
      default:
        return <div>Tipo de nota no reconocido</div>;
    }
  };

  console.log('Note data in modal:', note); // Debug
  console.log('BuildRPG data:', note?.buildRPG); // Debug adicional

  if (!isOpen || !note) return null;

  return createPortal(
    <div className="edit-note-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-note-modal">
        <div className="modal-header">
          <div className="header-left">
            <h2>{note.titulo}</h2>
            <span className="note-type-badge">{getTypeLabel()}</span>
          </div>
          <div className="header-actions">
            {!isEditing && (
              <button onClick={handleEdit} className="edit-btn">
                ✏️ Editar
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="game-info">
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
        
        <div className="modal-content">
          {renderNoteContent()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditNoteModal;
