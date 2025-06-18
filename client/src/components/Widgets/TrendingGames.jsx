import React, { useState, useEffect } from 'react';
import './Widgets.css';

const TrendingGames = () => {
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
        {trendingGames.map((game, index) => (
          <div key={game._id} className="trending-game-item">
            <span className="rank">#{index + 1}</span>
            <img src={game.imagen || '/placeholder-game.jpg'} alt={game.nombre} />
            <div className="game-details">
              <span className="game-title">{game.nombre}</span>
              <span className="game-genre">{game.generos[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingGames;
