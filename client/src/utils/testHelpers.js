import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../contexts/UserContext';

// Wrapper para componentes que requieren React Router
export const renderWithRouter = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Wrapper para componentes que requieren React Router y User Context
export const renderWithProviders = (ui, options = {}) => {
  const { mockUser, ...renderOptions } = options;
  
  // Mock localStorage antes de crear el provider
  const originalGetItem = Storage.prototype.getItem;
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'user') {
      return JSON.stringify(mockUser || {
        _id: '123456789',
        id: '123456789',
        username: 'testuser',
        email: 'test@example.com',
        avatar: null
      });
    }
    return null;
  });
  
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <UserProvider>
        {children}
      </UserProvider>
    </BrowserRouter>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });
  
  // Restaurar localStorage
  Storage.prototype.getItem = originalGetItem;
  
  return result;
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
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null),
  };
})();

// Función para configurar el entorno de test (sin beforeEach interno)
export const setupTest = (options = {}) => {
  // Configurar mocks de localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Configurar fetch mock
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );

  return options;
};

// Función simplificada para tests que solo necesitan configuración básica
export const setupSimpleTest = () => {
  return setupTest();
};
