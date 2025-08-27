import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Modal from '../../components/UI/Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Restaurar el overflow del body
    document.body.style.overflow = 'unset';
  });

  test('no debería renderizarse cuando isOpen es false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('debería renderizarse cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('debería mostrar el título cuando se proporciona', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  test('debería llamar onClose cuando se hace clic en el botón de cerrar', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('debería llamar onClose cuando se hace clic en el overlay', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const overlay = document.querySelector('.modal-overlay');
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('no debería llamar onClose cuando se hace clic en el contenido del modal', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const modalContent = screen.getByText('Modal content');
    await user.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('debería llamar onClose cuando se presiona Escape', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('no debería llamar onClose cuando se presiona otra tecla', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('debería establecer overflow hidden en el body cuando está abierto', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  test('debería restaurar el overflow del body cuando se cierra', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  test('debería limpiar event listeners al desmontarse', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  test('debería renderizar múltiples elementos hijos', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>First element</div>
        <div>Second element</div>
        <button>Action button</button>
      </Modal>
    );

    expect(screen.getByText('First element')).toBeInTheDocument();
    expect(screen.getByText('Second element')).toBeInTheDocument();
    expect(screen.getByText('Action button')).toBeInTheDocument();
  });

  test('debería manejar cambios en isOpen correctamente', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });
});