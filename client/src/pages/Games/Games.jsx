import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import GameCard from '../../components/Game/GameCard';
import './Games.css';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
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

        <div className="games-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando juegos...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="empty-games">
              <div className="empty-icon">🎮</div>
              <h3>No hay juegos disponibles</h3>
              <p>No se encontraron juegos</p>
            </div>
          ) : (
            games.map(game => (
              <GameCard 
                key={game._id} 
                game={game}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Games;
