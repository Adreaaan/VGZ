import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AddNoteModal from '../../components/Notes/AddNoteModal';
import NoteCard from '../../components/Notes/NoteCard';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
        setFilteredNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note => 
        note.videojuego?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);

  const handleAddNote = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleNoteCreated = useCallback((newNote) => {
    setNotes(prev => [newNote, ...prev]);
    setShowAddModal(false);
  }, []);

  const handleDeleteNote = useCallback(async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notas/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, []);

  const handleUpdateNote = useCallback(async (noteId, updatedNote) => {
    console.log('Updating note in list:', noteId, updatedNote); // Debug
    setNotes(prev => prev.map(note => 
      note._id === noteId ? { ...note, ...updatedNote } : note
    ));
  }, []);

  return (
    <div className="notes-container">
      <Sidebar />
      
      <main className="main-content">
        <div className="notes-header">
          <h1>Mis Notas</h1>
          <button onClick={handleAddNote} className="add-note-btn">
            <span>➕</span>
            Añadir Nota
          </button>
        </div>

        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por juego..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Cargando notas...</p>
          </div>
        ) : (
          <div className="notes-content">
            {filteredNotes.length > 0 ? (
              <div className="notes-grid">
                {filteredNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onDelete={handleDeleteNote}
                    onUpdate={handleUpdateNote}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-notes">
                <div className="empty-icon">📝</div>
                <h3>
                  {searchTerm 
                    ? 'No se encontraron notas'
                    : 'No tienes notas aún'
                  }
                </h3>
                <p>
                  {searchTerm
                    ? 'Intenta con otro término de búsqueda'
                    : 'Crea tu primera nota para empezar a organizar tus juegos'
                  }
                </p>
                {!searchTerm && (
                  <button onClick={handleAddNote} className="create-first-note-btn">
                    Crear mi primera nota
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <AddNoteModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onNoteCreated={handleNoteCreated}
      />
    </div>
  );
};

export default Notes;
