import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../../hooks/useToggle';

describe('useToggle', () => {
  test('debería inicializar con valor por defecto false', () => {
    const { result } = renderHook(() => useToggle());
    const [value] = result.current;

    expect(value).toBe(false);
  });

  test('debería inicializar con valor personalizado', () => {
    const { result } = renderHook(() => useToggle(true));
    const [value] = result.current;

    expect(value).toBe(true);
  });

  test('debería alternar el valor con toggle', () => {
    const { result } = renderHook(() => useToggle());
    const [initialValue, toggle] = result.current;

    expect(initialValue).toBe(false);

    act(() => {
      toggle();
    });

    const [newValue] = result.current;
    expect(newValue).toBe(true);

    act(() => {
      toggle();
    });

    const [finalValue] = result.current;
    expect(finalValue).toBe(false);
  });

  test('debería establecer valor a true con setTrue', () => {
    const { result } = renderHook(() => useToggle());
    const [, , setTrue] = result.current;

    act(() => {
      setTrue();
    });

    const [value] = result.current;
    expect(value).toBe(true);
  });

  test('debería establecer valor a false con setFalse', () => {
    const { result } = renderHook(() => useToggle(true));
    const [, , , setFalse] = result.current;

    act(() => {
      setFalse();
    });

    const [value] = result.current;
    expect(value).toBe(false);
  });

  test('debería mantener la misma referencia de funciones entre renders', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const [, toggle1, setTrue1, setFalse1] = result.current;

    rerender();

    const [, toggle2, setTrue2, setFalse2] = result.current;

    expect(toggle1).toBe(toggle2);
    expect(setTrue1).toBe(setTrue2);
    expect(setFalse1).toBe(setFalse2);
  });
});