import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Wrapper para componentes que requieren React Router
export const renderWithRouter = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock para localStorage
export const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock para fetch
export const mockFetch = (response) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      ...response,
    })
  );
};

// Setup global antes de cada test
export const setupTest = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
  mockLocalStorage.clear();
};

// Prueba básica para el archivo de utilidades
describe('Test Utils', () => {
  test('debería exportar funciones de utilidad', () => {
    expect(typeof renderWithRouter).toBe('function');
    expect(typeof mockLocalStorage).toBe('object');
    expect(typeof mockFetch).toBe('function');
    expect(typeof setupTest).toBe('function');
  });
});