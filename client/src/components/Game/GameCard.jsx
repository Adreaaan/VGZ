import React from 'react';
import './GameCard.css';

const GameCard = ({ game }) => {
  const getMainRating = () => {
    const { loRecomiendo, noLoRecomiendo, meh } = game.valoraciones || {};
    const total = (loRecomiendo || 0) + (noLoRecomiendo || 0) + (meh || 0);
    
    if (total === 0) return { type: 'Sin valoraciones', percentage: 0, color: '#a0aec0' };
    
    const percentages = {
      loRecomiendo: Math.round(((loRecomiendo || 0) / total) * 100),
      noLoRecomiendo: Math.round(((noLoRecomiendo || 0) / total) * 100),
      meh: Math.round(((meh || 0) / total) * 100)
    };
    
    const maxPercentage = Math.max(percentages.loRecomiendo, percentages.noLoRecomiendo, percentages.meh);
    
    if (percentages.loRecomiendo === maxPercentage) {
      return { type: '👍 Lo recomiendo', percentage: percentages.loRecomiendo, color: '#38a169' };
    } else if (percentages.noLoRecomiendo === maxPercentage) {
      return { type: '👎 No lo recomiendo', percentage: percentages.noLoRecomiendo, color: '#e53e3e' };
    } else {
      return { type: '😐 Meh', percentage: percentages.meh, color: '#a0aec0' };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  const mainRating = getMainRating();

  return (
    <div className="game-card">
      <div className="game-image">
        <img 
          src={game.imagen || '/placeholder-game.jpg'} 
          alt={game.nombre}
          onError={(e) => {
            e.target.src = '/placeholder-game.jpg';
          }}
        />
        <div className="game-genres">
          {(game.generos || []).slice(0, 2).map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>
      </div>
      
      <div className="game-info">
        <h3 className="game-title">{game.nombre}</h3>
        <div className="main-rating" style={{ color: mainRating.color }}>
          {mainRating.type} ({mainRating.percentage}%)
        </div>
        
        <div className="game-details">
          <p className="release-date">📅 {formatDate(game.fechaLanzamiento)}</p>
          <p className="developer">🏢 {game.desarrollador}</p>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
