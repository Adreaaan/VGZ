import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameCard from '../../components/Game/GameCard';

describe('GameCard', () => {
  const mockGame = {
    id: 1,
    nombre: 'Test Game',
    descripcion: 'Test description',
    generos: ['Action', 'Adventure'],
    plataformas: 'PC, PS5',
    precio: 59.99,
    desarrollador: 'Test Developer',
    imagen: 'test-image.jpg',
    fechaLanzamiento: '2023-01-01',
    valoraciones: {
      loRecomiendo: 80,
      noLoRecomiendo: 10,
      meh: 10
    }
  };

  const mockGameWithoutRatings = {
    ...mockGame,
    valoraciones: null
  };

  test('debería renderizar información básica del juego', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText(/Test Developer/)).toBeInTheDocument();
  });

  test('debería calcular y mostrar valoración principal correctamente', () => {
    render(<GameCard game={mockGame} />);

    // Con 80% de "lo recomiendo", debería mostrar esa valoración
    expect(screen.getByText(/80% Lo recomiendan/)).toBeInTheDocument();
  });

  test('debería mostrar "Sin valoraciones" cuando no hay valoraciones', () => {
    render(<GameCard game={mockGameWithoutRatings} />);

    expect(screen.getByText('Sin valoraciones')).toBeInTheDocument();
  });

  test('debería mostrar valoración del usuario en modo PostCard', () => {
    render(<GameCard game={mockGame} userRating="lo_recomiendo" showAsPostCard={true} />);

    // En modo PostCard debería mostrar la valoración del usuario
    expect(screen.getByText(/Lo recomiendo/)).toBeInTheDocument();
  });

  test('debería llamar onGameClick cuando se hace clic en la card', () => {
    const mockOnGameClick = jest.fn();
    render(<GameCard game={mockGame} onGameClick={mockOnGameClick} />);

    const gameCard = document.querySelector('.game-card');
    fireEvent.click(gameCard);

    expect(mockOnGameClick).toHaveBeenCalledTimes(1);
  });

  test('debería mostrar diferentes tipos de valoraciones principales', () => {
    const gameWithNegativeRating = {
      ...mockGame,
      valoraciones: {
        loRecomiendo: 10,
        noLoRecomiendo: 80,
        meh: 10
      }
    };

    render(<GameCard game={gameWithNegativeRating} />);
    expect(screen.getByText(/80% No lo recomiendan/)).toBeInTheDocument();

    const gameWithMehRating = {
      ...mockGame,
      valoraciones: {
        loRecomiendo: 10,
        noLoRecomiendo: 10,
        meh: 80
      }
    };

    render(<GameCard game={gameWithMehRating} />);
    expect(screen.getByText(/80% Meh/)).toBeInTheDocument();
  });

  test('debería mostrar géneros correctamente', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();
  });

  test('debería manejar imágenes faltantes', () => {
    const gameWithoutImage = { ...mockGame, imagen: null };
    render(<GameCard game={gameWithoutImage} />);

    // Verificar que el componente se renderiza sin errores
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  test('debería renderizar en modo PostCard cuando showAsPostCard es true', () => {
    render(<GameCard game={mockGame} showAsPostCard={true} />);

    // Verificar que aún muestra la información básica
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    // Verificar que tiene la clase correcta
    expect(document.querySelector('.game-card-post')).toBeInTheDocument();
  });

  test('debería mostrar valoraciones de usuario con diferentes tipos en modo PostCard', () => {
    const { rerender } = render(<GameCard game={mockGame} userRating="no_lo_recomiendo" showAsPostCard={true} />);
    expect(screen.getByText(/No lo recomiendo/)).toBeInTheDocument();

    rerender(<GameCard game={mockGame} userRating="meh" showAsPostCard={true} />);
    expect(screen.getByText(/Meh/)).toBeInTheDocument();
  });

  test('debería calcular porcentajes correctamente con números decimales', () => {
    const gameWithDecimalRatings = {
      ...mockGame,
      valoraciones: {
        loRecomiendo: 33,
        noLoRecomiendo: 33,
        meh: 34
      }
    };

    render(<GameCard game={gameWithDecimalRatings} />);

    // Debería mostrar el mayor porcentaje (meh con 34%)
    expect(screen.getByText(/34% Meh/)).toBeInTheDocument();
  });

  test('debería mostrar fecha de lanzamiento formateada', () => {
    render(<GameCard game={mockGame} />);

    // Verificar que se muestra alguna fecha
    expect(screen.getByText(/enero/)).toBeInTheDocument();
  });

  test('debería mostrar desarrollador con icono', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText(/🏢 Test Developer/)).toBeInTheDocument();
  });

  test('debería mostrar total de valoraciones', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText(/100 valoraciones/)).toBeInTheDocument();
  });

  test('debería manejar juegos sin géneros', () => {
    const gameWithoutGenres = { ...mockGame, generos: null };
    render(<GameCard game={gameWithoutGenres} />);

    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  test('debería limitar géneros mostrados a 2', () => {
    const gameWithManyGenres = {
      ...mockGame,
      generos: ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy']
    };

    render(<GameCard game={gameWithManyGenres} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();
    // No debería mostrar el tercer género
    expect(screen.queryByText('RPG')).not.toBeInTheDocument();
  });
});
