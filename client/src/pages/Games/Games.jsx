import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import GameCard from '../../components/Game/GameCard';
import './Games.css';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/videojuegos?sortBy=fechaLanzamiento&order=desc', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setGames(data.videojuegos || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const memoizedGames = useMemo(() => games, [games]);

  const renderGameCard = useCallback((game) => (
    <GameCard 
      key={game._id} 
      game={game}
    />
  ), []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando juegos...</p>
        </div>
      );
    }

    if (memoizedGames.length === 0) {
      return (
        <div className="empty-games">
          <div className="empty-icon">🎮</div>
          <h3>No hay juegos disponibles</h3>
          <p>No se encontraron juegos</p>
        </div>
      );
    }

    return (
      <div className="games-grid">
        {memoizedGames.map(renderGameCard)}
      </div>
    );
  };

  return (
    <div style={{ 
      background: '#1a2332', 
      minHeight: '100vh', 
      color: 'white', 
      padding: '20px' 
    }}>
      <Sidebar />
      
      <main className="games-content">
        <div className="games-header">
          <h1>Juegos</h1>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default React.memo(Games);
