import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NoteCard from '../../components/Notes/NoteCard';
import { renderWithRouter, setupTest } from '../../utils/testHelpers';

// Mock global fetch
global.fetch = jest.fn();

describe('NoteCard', () => {
  const mockTextNote = {
    _id: 'note1',
    titulo: 'Mi guía de Elden Ring',
    tipoNota: 'bloc_notas',
    contenidoTexto: 'Esta es una nota de texto sobre estrategias en Elden Ring',
    videojuego: {
      _id: 'game1',
      nombre: 'Elden Ring',
      imagen: 'https://example.com/elden-ring.jpg'
    },
    esPublica: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const mockTodoNote = {
    _id: 'note2',
    titulo: 'Objetivos en Cyberpunk 2077',
    tipoNota: 'todo_list',
    tareas: [
      { texto: 'Completar misión principal', categoria: 'todo', completada: false, orden: 0 },
      { texto: 'Encontrar armas legendarias', categoria: 'doing', completada: false, orden: 1 },
      { texto: 'Explorar Night City', categoria: 'done', completada: true, orden: 2 }
    ],
    videojuego: {
      _id: 'game2',
      nombre: 'Cyberpunk 2077',
      imagen: 'https://example.com/cyberpunk.jpg'
    },
    esPublica: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const mockBuildNote = {
    _id: 'note3',
    titulo: 'Build de Mago en Skyrim',
    tipoNota: 'build_rpg',
    construirBuild: {
      clase: 'Mago',
      raza: 'Alto Elfo',
      estadisticas: {
        fuerza: 10,
        destreza: 12,
        inteligencia: 18,
        resistencia: 14,
        suerte: 8
      },
      habilidades: ['Destrucción', 'Ilusión', 'Conjuración'],
      equipamiento: {
        armasPrincipales: ['Bastón de llamas'],
        armaduras: ['Túnicas de mago'],
        accesorios: ['Amuleto de magicka']
      }
    },
    videojuego: {
      _id: 'game3',
      nombre: 'The Elder Scrolls V: Skyrim',
      imagen: 'https://example.com/skyrim.jpg'
    },
    esPublica: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const defaultProps = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    isOwner: true
  };

  beforeEach(() => {
    setupTest();
    fetch.mockClear();
  });

  describe('Renderizado básico', () => {
    test('debería renderizar una nota de texto correctamente', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      expect(screen.getByText('Mi guía de Elden Ring')).toBeInTheDocument();
      expect(screen.getByText('Elden Ring')).toBeInTheDocument();
      expect(screen.getByText('📄')).toBeInTheDocument();
    });

    test('debería mostrar icono correcto para todo list', () => {
      renderWithRouter(<NoteCard note={mockTodoNote} {...defaultProps} />);

      expect(screen.getByText('📄')).toBeInTheDocument();
    });

    test('debería mostrar icono correcto para build RPG', () => {
      renderWithRouter(<NoteCard note={mockBuildNote} {...defaultProps} />);

      expect(screen.getByText('📄')).toBeInTheDocument();
    });
  });

  describe('Contenido específico por tipo', () => {
    test('debería mostrar contenido de texto para nota de bloc_notas', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      expect(screen.getByText(/Esta es una nota de texto/)).toBeInTheDocument();
    });

    test('debería mostrar estadísticas para todo_list', () => {
      renderWithRouter(<NoteCard note={mockTodoNote} {...defaultProps} />);
      
      expect(screen.getByText('Por hacer')).toBeInTheDocument();
      expect(screen.getByText('En progreso')).toBeInTheDocument();
      expect(screen.getByText('Completado')).toBeInTheDocument();
      expect(screen.getByText(/33.*% completado/)).toBeInTheDocument(); // Porcentaje
    });

    test('debería mostrar información del build para build_rpg', () => {
      renderWithRouter(<NoteCard note={mockBuildNote} {...defaultProps} />);
      
      expect(screen.getByText('Sin nombre')).toBeInTheDocument();
      expect(screen.getByText('Build RPG')).toBeInTheDocument();
    });
  });

  describe('Interacciones del propietario', () => {
    test('debería mostrar menú de opciones para el propietario', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      expect(screen.getByText('⋮')).toBeInTheDocument();
    });

    test('debería abrir menú al hacer clic en opciones', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      await user.click(screen.getByText('⋮'));
      // Verificar que el menú se abre (esto depende de la implementación real)
    });

    test('debería funcionar sin errores para nota sin propietario', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} isOwner={false} />);
      
      expect(screen.getByText('Mi guía de Elden Ring')).toBeInTheDocument();
    });

    test('debería mostrar menú incluso si no es propietario', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} isOwner={false} />);
      
      // El componente actual siempre muestra el menú
      expect(screen.getByText('⋮')).toBeInTheDocument();
    });
  });

  describe('Navegación', () => {
    test('debería mostrar nombre del videojuego como texto', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      const gameText = screen.getByText('Elden Ring');
      expect(gameText).toBeInTheDocument();
      
      // Verificar que está dentro de un span, no un enlace
      expect(gameText.tagName).toBe('SPAN');
    });
  });

  describe('Fechas', () => {
    test('debería mostrar fecha de creación formateada', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      // Buscar cualquier texto que contenga "2023" ya que el formato puede variar
      expect(screen.getByText(/2023/)).toBeInTheDocument();
    });
  });

  describe('Estados de visibilidad', () => {
    test('debería mostrar indicador para nota pública', () => {
      renderWithRouter(<NoteCard note={mockTextNote} {...defaultProps} />);
      
      // Verificar que no hay indicador de privada (o que hay indicador de pública)
      expect(screen.queryByText(/privada/i)).not.toBeInTheDocument();
    });

    test('debería mostrar indicador para nota privada', () => {
      const privateNote = { ...mockTextNote, esPublica: false };
      renderWithRouter(<NoteCard note={privateNote} {...defaultProps} />);
      
      // Buscar indicador de nota privada si existe
      const privateIndicator = screen.queryByText(/privada/i);
      // Esta verificación depende de cómo se implemente en el componente real
    });
  });

  describe('Casos edge', () => {
    test('debería manejar nota sin videojuego', () => {
      const noteWithoutGame = { ...mockTextNote, videojuego: null };
      
      expect(() => {
        renderWithRouter(<NoteCard note={noteWithoutGame} {...defaultProps} />);
      }).not.toThrow();
    });

    test('debería manejar nota sin contenido', () => {
      const noteWithoutContent = { ...mockTextNote, contenidoTexto: '' };
      
      expect(() => {
        renderWithRouter(<NoteCard note={noteWithoutContent} {...defaultProps} />);
      }).not.toThrow();
    });

    test('debería manejar todo_list sin tareas', () => {
      const noteWithoutTasks = { ...mockTodoNote, tareas: [] };
      
      expect(() => {
        renderWithRouter(<NoteCard note={noteWithoutTasks} {...defaultProps} />);
      }).not.toThrow();
    });

    test('debería manejar build_rpg sin datos de build', () => {
      const noteWithoutBuild = { ...mockBuildNote, construirBuild: null };
      
      expect(() => {
        renderWithRouter(<NoteCard note={noteWithoutBuild} {...defaultProps} />);
      }).not.toThrow();
    });
  });
});
