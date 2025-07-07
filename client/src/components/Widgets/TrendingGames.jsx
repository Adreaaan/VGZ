import React, { useState, useEffect, useCallback } from 'react';
import './TrendingGames.css'; // Assuming you have a CSS file for styling

const TrendingGames = ({ onGameClick }) => {
  const [trendingGames, setTrendingGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingGames();
  }, []);

  const fetchTrendingGames = async () => {
    try {
      const response = await fetch('/api/videojuegos?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setTrendingGames(data.videojuegos || []);
    } catch (error) {
      console.error('Error fetching trending games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = useCallback((e, game) => {
    e.preventDefault();
    e.stopPropagation();
    if (onGameClick) {
      onGameClick(game);
    }
  }, [onGameClick]);

  const renderGameItem = useCallback((game, index) => (
    <div 
      key={game._id} 
      className="trending-game"
      onClick={(e) => handleGameClick(e, game)}
      style={{ cursor: 'pointer' }}
    >
      <span className="trending-rank">#{index + 1}</span>
      <img 
        src={game.imagen} 
        alt={game.nombre} 
        className="trending-game-image"
        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
      />
      <div className="trending-game-info">
        <h4>{game.nombre}</h4>
      </div>
    </div>
  ), [handleGameClick]);

  if (loading) {
    return (
      <div className="widget">
        <h3>Juegos en tendencia</h3>
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3>Juegos en tendencia</h3>
      <div className="trending-games">
        <div className="trending-games-list">
          {trendingGames.map(renderGameItem)}
        </div>
      </div>
    </div>
  );
};


export default TrendingGames;
