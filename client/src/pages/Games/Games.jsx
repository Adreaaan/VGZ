import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import GameCard from '../../components/Game/GameCard';
import GameFilters from '../../components/Games/GameFilters';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import GameDetailModal from '../../components/Game/GameDetailModal';
import './Games.css';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filters, setFilters] = useState({ genre: '', developer: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameDetail, setShowGameDetail] = useState(false);

  const fetchGames = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        sortBy: 'fechaLanzamiento',
        order: 'desc',
        page: pageNum,
        limit: 12
      });
      
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.developer) params.append('developer', filters.developer);
      
      const response = await fetch(`/api/videojuegos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (append) {
        setGames(prev => [...prev, ...(data.videojuegos || [])]);
      } else {
        setGames(data.videojuegos || []);
      }
      
      setHasMore((data.videojuegos || []).length === 12);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching games:', error);
      if (!append) setGames([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMoreGames = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchGames(page + 1, true);
  }, [fetchGames, page, hasMore, loading]);

  const [isFetchingMore] = useInfiniteScroll(fetchMoreGames);

  useEffect(() => {
    fetchGames(1, false);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  const memoizedGames = useMemo(() => games, [games]);

  const handleSearchChange = useCallback(async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setShowSearchResults(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/videojuegos/buscar?q=${encodeURIComponent(value)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching games:', error);
      setSearchResults([]);
    }
  }, []);

  const handleGameSelect = useCallback((game) => {
    setSearchTerm(game.nombre);
    setShowSearchResults(false);
    handleGameClick(game);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setShowSearchResults(false);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleGameClick = useCallback((game) => {
    setSelectedGame(game);
    setShowGameDetail(true);
  }, []);

  const handleCloseGameDetail = useCallback(() => {
    setShowGameDetail(false);
    setSelectedGame(null);
  }, []);

  const renderGameCard = useCallback((game) => (
    <GameCard 
      key={game._id} 
      game={game}
      onGameClick={handleGameClick}
    />
  ), [handleGameClick]);

  const renderContent = () => {
    if (loading && games.length === 0) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando juegos...</p>
        </div>
      );
    }

    if (games.length === 0) {
      return (
        <div className="empty-games">
          <div className="empty-icon">🎮</div>
          <h3>No hay juegos disponibles</h3>
          <p>No se encontraron juegos</p>
        </div>
      );
    }

    return (
      <>
        <div className="games-grid">
          {games.map(renderGameCard)}
        </div>
        {isFetchingMore && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <p>Cargando más juegos...</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="games-container">
      <Sidebar />
      <GameFilters onFilterChange={handleFilterChange} />
      
      <main className="games-content">
        <div className="games-header">
          <h1>Juegos</h1>
          <div className="games-search">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="games-search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  ✕
                </button>
              )}
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="games-search-results">
                  {searchResults.map(game => (
                    <div
                      key={game._id}
                      className="game-search-result"
                      onClick={() => handleGameSelect(game)}
                    >
                      <img src={game.imagen} alt={game.nombre} className="game-search-thumb" />
                      <span>{game.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {renderContent()}
      </main>

      <GameDetailModal
        isOpen={showGameDetail}
        onClose={handleCloseGameDetail}
        game={selectedGame}
      />
    </div>
  );
};

export default React.memo(Games);
