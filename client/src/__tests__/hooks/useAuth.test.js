import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { setupTest, mockLocalStorage } from '../utils/testUtils';

describe('useAuth', () => {
  beforeEach(() => {
    setupTest();
  });

  test('debería inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('debería cargar datos del localStorage al inicializar', () => {
    const mockUser = { id: 1, nombre: 'Test User', email: 'test@test.com' };
    const mockToken = 'test-token';

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'token') return mockToken;
      return null;
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
  });

  test('debería hacer login correctamente', () => {
    const { result } = renderHook(() => useAuth());
    const mockUser = { id: 1, nombre: 'Test User', email: 'test@test.com' };
    const mockToken = 'test-token';

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  test('debería hacer logout correctamente', () => {
    const { result } = renderHook(() => useAuth());
    const mockUser = { id: 1, nombre: 'Test User', email: 'test@test.com' };
    const mockToken = 'test-token';

    // Primero hacer login
    act(() => {
      result.current.login(mockUser, mockToken);
    });

    // Luego hacer logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('debería manejar localStorage vacío sin errores', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('debería manejar JSON inválido en localStorage', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return 'invalid-json';
      if (key === 'token') return 'test-token';
      return null;
    });

    // Mock console.error para evitar logs en las pruebas
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
