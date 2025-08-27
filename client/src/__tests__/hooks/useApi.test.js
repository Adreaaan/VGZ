import { renderHook, act } from '@testing-library/react';
import { useApi } from '../../hooks/useApi';
import { setupTest, mockLocalStorage } from '../utils/testUtils';

// Mock global fetch
global.fetch = jest.fn();

describe('useApi', () => {
  beforeEach(() => {
    setupTest();
    fetch.mockClear();
  });

  test('debería inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.apiCall).toBe('function');
  });

  test('debería hacer una llamada API exitosa', async () => {
    const mockResponse = { data: 'test data' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useApi());

    let response;
    await act(async () => {
      response = await result.current.apiCall('/api/test');
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/test', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('debería incluir token de autorización si está presente', async () => {
    const mockToken = 'test-token';
    mockLocalStorage.getItem.mockReturnValue(mockToken);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.apiCall('/api/test');
    });

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
    });
  });

  test('debería manejar errores HTTP', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.apiCall('/api/test');
      } catch (error) {
        expect(error.message).toBe('HTTP error! status: 404');
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('HTTP error! status: 404');
  });

  test('debería manejar errores de red', async () => {
    const networkError = new Error('Network error');
    fetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.apiCall('/api/test');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  test('debería establecer loading a true durante la llamada', async () => {
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({}),
      }), 100))
    );

    const { result } = renderHook(() => useApi());

    act(() => {
      result.current.apiCall('/api/test');
    });

    expect(result.current.loading).toBe(true);
  });

  test('debería pasar opciones personalizadas a fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useApi());
    const customOptions = {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'Custom-Header': 'value',
      },
    };

    await act(async () => {
      await result.current.apiCall('/api/test', customOptions);
    });

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'Content-Type': 'application/json',
        'Custom-Header': 'value',
      },
    });
  });
});