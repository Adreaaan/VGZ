import React, { useMemo, useCallback } from 'react';
import './GameCard.css';

const GameCard = ({ game, userRating, showAsPostCard = false, onGameClick }) => {
  
  const mainRating = useMemo(() => {
    const { loRecomiendo, noLoRecomiendo, meh } = game.valoraciones || {};
    const total = (loRecomiendo || 0) + (noLoRecomiendo || 0) + (meh || 0);
    
    if (total === 0) return { type: 'Sin valoraciones', percentage: 0, color: '#a0aec0', total: 0 };
    
    const percentages = {
      loRecomiendo: Math.round(((loRecomiendo || 0) / total) * 100),
      noLoRecomiendo: Math.round(((noLoRecomiendo || 0) / total) * 100),
      meh: Math.round(((meh || 0) / total) * 100)
    };
    
    const maxPercentage = Math.max(percentages.loRecomiendo, percentages.noLoRecomiendo, percentages.meh);
    
    if (percentages.loRecomiendo === maxPercentage) {
      return { type: `👍 ${percentages.loRecomiendo}% Lo recomiendan`, percentage: percentages.loRecomiendo, color: '#38a169', total };
    } else if (percentages.noLoRecomiendo === maxPercentage) {
      return { type: `👎 ${percentages.noLoRecomiendo}% No lo recomiendan`, percentage: percentages.noLoRecomiendo, color: '#e53e3e', total };
    } else {
      return { type: `😐 ${percentages.meh}% Meh`, percentage: percentages.meh, color: '#a0aec0', total };
    }
  }, [game.valoraciones]);

  const displayUserRating = useMemo(() => {
    if (!userRating) return null;
    
    const ratings = {
      'lo_recomiendo': { text: '👍 Lo recomiendo', color: '#38a169' },
      'no_lo_recomiendo': { text: '👎 No lo recomiendo', color: '#e53e3e' },
      'meh': { text: '😐 Meh', color: '#a0aec0' }
    };
    
    return ratings[userRating] || null;
  }, [userRating]);

  const formattedDate = useMemo(() => {
    return new Date(game.fechaLanzamiento).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  }, [game.fechaLanzamiento]);

  const handleImageError = useCallback((e) => {
    e.target.src = '/placeholder-game.jpg';
    e.target.onerror = null; // Prevent infinite loop
  }, []);

  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onGameClick) {
      // Asegurar que el juego tenga la estructura correcta
      const gameToPass = {
        ...game,
        valoraciones: game.valoraciones || { loRecomiendo: 0, noLoRecomiendo: 0, meh: 0 }
      };
      onGameClick(gameToPass);
    }
  }, [onGameClick, game]);

  if (showAsPostCard) {
    return (
      <div 
        className="game-card-post"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="game-image-post">
          <img 
            src={game.imagen || '/placeholder-game.jpg'} 
            alt={game.nombre}
            onError={handleImageError}
            
          />
        </div>
        
        <div className="game-info-post">
          <h4 className="game-title-post">{game.nombre}</h4>
          {displayUserRating && (
            <div className="user-rating-post" style={{ color: displayUserRating.color }}>
              {displayUserRating.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="game-card" onClick={handleCardClick}>
      <div className="game-image-container">
        <img 
          src={game.imagen || '/placeholder-game.jpg'} 
          alt={game.nombre}
          className="game-image"
          onError={(e) => {
            e.target.src = '/placeholder-game.jpg';
          }}
          
        />
        <div className="game-overlay">
          <div className="game-genres">
            {(game.generos || []).slice(0, 2).map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="game-content">
        <div className="game-header">
          <h3 className="game-title">{game.nombre}</h3>
          <div className="game-meta">
            <span className="developer">🏢 {game.desarrollador}</span>
            <span className="release-date">📅 {formattedDate}</span>
          </div>
        </div>
        
        <div className="game-rating-section">
          <div className="main-rating" style={{ color: mainRating.color }}>
            {mainRating.type}
          </div>
          {mainRating.total > 0 && (
            <div className="rating-details">
              <span className="rating-count">{mainRating.total} valoraciones</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameCard);



