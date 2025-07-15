import React, { useState, useCallback, useEffect } from 'react';
import './NoteViewers.css';

const BuildViewer = ({ note, isEditing, onSave, onCancel, loading }) => {
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

  useEffect(() => {
    if (note?.buildRPG) {
      const build = note.buildRPG;
      setCharacterName(build.nombre || ''); // Volver a usar nombre
      setCharacterClass(build.clase || '');
      setLevel(build.nivel || '');
      
      // Usar directamente las estadísticas del modelo
      if (build.estadisticas) {
        setStats({
          fuerza: build.estadisticas.fuerza || '',
          destreza: build.estadisticas.destreza || '',
          inteligencia: build.estadisticas.inteligencia || '',
          sabiduria: build.estadisticas.sabiduria || '',
          constitucion: build.estadisticas.constitucion || '',
          carisma: build.estadisticas.carisma || ''
        });
      }
      
      // Mapear equipamiento del modelo real
      const equipamientoMap = {
        weapon: build.arma || '',
        armor: build.armadura || '',
        shield: build.escudo || '',
        accessories: build.accesorios || ''
      };
      
      setEquipment(equipamientoMap);
      setNotes(build.estrategia || '');
    } else if (note?.contenido) {
      const content = note.contenido;
      setCharacterName(content.characterName || '');
      setCharacterClass(content.characterClass || '');
      setLevel(content.level || '');
      setStats(content.stats || {
        fuerza: '',
        destreza: '',
        inteligencia: '',
        sabiduria: '',
        constitucion: '',
        carisma: ''
      });
      setEquipment(content.equipment || {
        weapon: '',
        armor: '',
        shield: '',
        accessories: ''
      });
      setNotes(content.notes || '');
    }
    
    // Fix privacy state - if esPublica exists, convert to isPrivate
    if (note?.esPublica !== undefined) {
      setIsPrivate(!note.esPublica);
    } else if (note?.esPrivada !== undefined) {
      setIsPrivate(note.esPrivada);
    } else {
      setIsPrivate(false); // Default to public (not private)
    }
  }, [note]);

  const handleStatChange = useCallback((stat, value) => {
    setStats(prev => ({ ...prev, [stat]: value }));
  }, []);

  const handleEquipmentChange = useCallback((slot, value) => {
    setEquipment(prev => ({ ...prev, [slot]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave({
      characterName,
      characterClass,
      level,
      stats,
      equipment,
      notes
    }, isPrivate);
  }, [characterName, characterClass, level, stats, equipment, notes, isPrivate, onSave]);

  const statLabels = {
    fuerza: 'Fuerza',
    destreza: 'Destreza', 
    inteligencia: 'Inteligencia',
    sabiduria: 'Sabiduría',
    constitucion: 'Constitución',
    carisma: 'Carisma'
  };

  const equipmentLabels = {
    weapon: 'Arma',
    armor: 'Armadura',
    shield: 'Escudo',
    accessories: 'Accesorios'
  };

  if (isEditing) {
    return (
      <div className="note-viewer editing">
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
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
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
      <div className="build-viewer">
        <div className="build-section">
          <h4>Información del Personaje</h4>
          <div className="character-info">
            <div className="info-item">
              <span className="info-label">Nombre</span>
              <span className="info-value">{characterName || 'Sin nombre'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Clase</span>
              <span className="info-value">{characterClass || 'Sin clase'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nivel</span>
              <span className="info-value">{level || 'Sin nivel'}</span>
            </div>
          </div>
        </div>

        <div className="build-section">
          <h4>Estadísticas</h4>
          <div className="stats-grid">
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="stat-item">
                <div className="stat-name">
                  {statLabels[stat] || stat}
                </div>
                <div className="stat-value">{value || '0'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="build-section">
          <h4>Equipamiento</h4>
          <div className="equipment-grid">
            {Object.entries(equipment).map(([slot, item]) => (
              <div key={slot} className="equipment-item">
                <div className="equipment-slot">
                  {equipmentLabels[slot] || slot}
                </div>
                <div className="equipment-name">{item || 'Sin equipar'}</div>
              </div>
            ))}
          </div>
        </div>

        {notes && (
          <div className="build-section">
            <h4>Estrategia</h4>
            <div className="build-notes">{notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildViewer;
