import React, { useState, useCallback } from 'react';
import './NoteEditors.css';

const BuildEditor = ({ game, onSave, onCancel, loading, setLoading }) => {
  const [title, setTitle] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState('');
  const [stats, setStats] = useState({
    fuerza: '',
    destreza: '',
    inteligencia: '',
    sabiduria: '',
    constitucion: '',
    carisma: ''
  });
  const [equipment, setEquipment] = useState({
    weapon: '',
    armor: '',
    shield: '',
    accessories: ''
  });
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const statLabels = {
    fuerza: 'Fuerza',
    destreza: 'Destreza',
    inteligencia: 'Inteligencia', 
    sabiduria: 'Sabiduría',
    constitucion: 'Constitución',
    carisma: 'Carisma'
  };

  const handleStatChange = useCallback((stat, value) => {
    setStats(prev => ({ ...prev, [stat]: value }));
  }, []);

  const handleEquipmentChange = useCallback((slot, value) => {
    setEquipment(prev => ({ ...prev, [slot]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      alert('Por favor, añade un título');
      return;
    }

    if (!characterName.trim()) {
      alert('Por favor, añade el nombre del personaje');
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
          tipo: 'build',
          videojuego: game._id,
          esPrivada: isPrivate,
          contenido: {
            characterName: characterName.trim(),
            characterClass: characterClass.trim(),
            level: level.trim(),
            stats,
            equipment,
            notes: notes.trim()
          }
        })
      });

      if (response.ok) {
        const newNote = await response.json();
        onSave(newNote);
      } else {
        throw new Error('Error al crear la nota');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error al guardar la nota');
    } finally {
      setLoading(false);
    }
  }, [title, characterName, characterClass, level, stats, equipment, notes, isPrivate, game, onSave, setLoading]);

  return (
    <div className="note-editor">
      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Título del build</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Build Mago de Hielo"
            className="title-input"
            maxLength={100}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="characterName">Nombre del personaje</label>
            <input
              id="characterName"
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Nombre del personaje"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="characterClass">Clase</label>
            <input
              id="characterClass"
              type="text"
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value)}
              placeholder="Clase del personaje"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">Nivel</label>
            <input
              id="level"
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Nivel"
              className="input-field"
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Estadísticas</label>
          <div className="stats-grid">
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="stat-input">
                <label htmlFor={stat}>
                  {statLabels[stat] || stat}
                </label>
                <input
                  id={stat}
                  type="number"
                  value={value}
                  onChange={(e) => handleStatChange(stat, e.target.value)}
                  placeholder="0"
                  className="stat-field"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Equipamiento</label>
          <div className="equipment-grid">
            <div className="equipment-input">
              <label htmlFor="weapon">Arma</label>
              <input
                id="weapon"
                type="text"
                value={equipment.weapon}
                onChange={(e) => handleEquipmentChange('weapon', e.target.value)}
                placeholder="Arma principal"
                className="input-field"
              />
            </div>
            <div className="equipment-input">
              <label htmlFor="armor">Armadura</label>
              <input
                id="armor"
                type="text"
                value={equipment.armor}
                onChange={(e) => handleEquipmentChange('armor', e.target.value)}
                placeholder="Set de armadura"
                className="input-field"
              />
            </div>
            <div className="equipment-input">
              <label htmlFor="shield">Escudo</label>
              <input
                id="shield"
                type="text"
                value={equipment.shield}
                onChange={(e) => handleEquipmentChange('shield', e.target.value)}
                placeholder="Escudo"
                className="input-field"
              />
            </div>
            <div className="equipment-input">
              <label htmlFor="accessories">Accesorios</label>
              <input
                id="accessories"
                type="text"
                value={equipment.accessories}
                onChange={(e) => handleEquipmentChange('accessories', e.target.value)}
                placeholder="Anillos, amuletos, etc."
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notas adicionales</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Estrategias, consejos, rotaciones..."
            className="notes-textarea"
            rows={4}
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
              🔒 Build privado (solo visible para mí)
            </label>
          </div>
        </div>
      </div>

      <div className="editor-actions">
        <button onClick={onCancel} className="cancel-btn" disabled={loading}>
          Cancelar
        </button>
        <button onClick={handleSave} className="save-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Build'}
        </button>
      </div>
    </div>
  );
};

export default BuildEditor;
