import '@testing-library/jest-dom';

// Mock localStorage globalmente
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = { 
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Mock console.error para pruebas más limpias
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});
