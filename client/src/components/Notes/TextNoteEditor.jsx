import React, { useState, useCallback } from 'react';
import './NoteEditors.css';

const TextNoteEditor = ({ game, onSave, onCancel, loading, setLoading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      alert('Por favor, completa el título y el contenido');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: title.trim(),
          tipo: 'text',
          videojuego: game._id,
          esPrivada: isPrivate,
          contenido: {
            texto: content.trim()
          }
        })
      });

      if (response.ok) {
        const newNote = await response.json();
        onSave(newNote);
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData); // Debug
        throw new Error(errorData.mensaje || 'Error al crear la nota');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error al guardar la nota');
    } finally {
      setLoading(false);
    }
  }, [title, content, isPrivate, game, onSave, setLoading]);

  return (
    <div className="note-editor">
      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Título de la nota</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un título para tu nota..."
            className="title-input"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Contenido</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tus notas aquí..."
            className="content-textarea"
            rows={12}
          />
        </div>

        <div className="form-group">
          <div className="privacy-checkbox">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="privacy-input"
            />
            <label htmlFor="isPrivate" className="privacy-label">
              🔒 Nota privada (solo visible para mí)
            </label>
          </div>
        </div>
      </div>

      <div className="editor-actions">
        <button onClick={onCancel} className="cancel-btn" disabled={loading}>
          Cancelar
        </button>
        <button onClick={handleSave} className="save-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Nota'}
        </button>
      </div>
    </div>
  );
};

export default TextNoteEditor;
