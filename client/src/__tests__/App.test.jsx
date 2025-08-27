import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simplemente verificar que el testing setup funciona
describe('App', () => {
  test('debería funcionar el setup de testing', () => {
    // Esta es una prueba básica para verificar que el entorno de testing funciona
    const div = document.createElement('div');
    expect(div).toBeDefined();
    expect(div.tagName).toBe('DIV');
  });
});