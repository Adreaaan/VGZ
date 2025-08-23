import React, { useState, useEffect, useCallback } from 'react';
import './GameFilters.css';

const GameFilters = ({ onFilterChange }) => {
  const [genres, setGenres] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch genres and developers
      const [genresResponse, developersResponse] = await Promise.all([
        fetch('/api/videojuegos/genres', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/videojuegos/developers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (genresResponse.ok && developersResponse.ok) {
        const genresData = await genresResponse.json();
        const developersData = await developersResponse.json();
        
        setGenres(genresData || []);
        setDevelopers(developersData || []);
      }
    } catch (error) {
      console.error('Error fetching filters data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedGenre(value);
    onFilterChange({ genre: value, developer: selectedDeveloper });
  }, [selectedDeveloper, onFilterChange]);

  const handleDeveloperChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedDeveloper(value);
    onFilterChange({ genre: selectedGenre, developer: value });
  }, [selectedGenre, onFilterChange]);

  const clearFilters = useCallback(() => {
    setSelectedGenre('');
    setSelectedDeveloper('');
    onFilterChange({ genre: '', developer: '' });
  }, [onFilterChange]);

  if (loading) {
    return (
      <div className="game-filters">
        <div className="filters-header">
          <h3>Filtros</h3>
        </div>
        <div className="filters-loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="game-filters">
      <div className="filters-header">
        <h3>Filtros</h3>
        {(selectedGenre || selectedDeveloper) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Limpiar
          </button>
        )}
      </div>
      
      <div className="filter-group">
        <label htmlFor="genre-select">Género</label>
        <select
          id="genre-select"
          value={selectedGenre}
          onChange={handleGenreChange}
          className="filter-select"
        >
          <option value="">Todos los géneros</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="developer-select">Desarrollador</label>
        <select
          id="developer-select"
          value={selectedDeveloper}
          onChange={handleDeveloperChange}
          className="filter-select"
        >
          <option value="">Todos los desarrolladores</option>
          {developers.map(developer => (
            <option key={developer} value={developer}>{developer}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default React.memo(GameFilters);
