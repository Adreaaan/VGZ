import React, { useState, useCallback, useEffect } from 'react';
import './NoteViewers.css';

const TextNoteViewer = ({ note, isEditing, onSave, onCancel, loading }) => {
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    // Adaptarse a la estructura real del modelo
    if (note?.contenidoTexto) {
      setContent(note.contenidoTexto);
    } else if (note?.contenido?.texto) {
      setContent(note.contenido.texto);
    }
    if (note?.esPrivada !== undefined) {
      setIsPrivate(note.esPrivada);
    } else if (note?.esPublica !== undefined) {
      setIsPrivate(!note.esPublica);
    }
  }, [note]);

  const handleSave = useCallback(() => {
    onSave({
      texto: content
    }, isPrivate);
  }, [content, isPrivate, onSave]);

  if (isEditing) {
    return (
      <div className="note-viewer editing">
        <div className="editor-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-textarea"
            rows={15}
            placeholder="Escribe tus notas aquí..."
          />

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
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-viewer">
      <div className="text-content">
        {(note?.contenidoTexto || note?.contenido?.texto) ? (
          <div className="text-display">
            {(note.contenidoTexto || note.contenido.texto).split('\n').map((line, index) => (
              <p key={index}>{line || '\u00A0'}</p>
            ))}
          </div>
        ) : (
          <div className="empty-content">
            <p>Esta nota está vacía</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextNoteViewer;
