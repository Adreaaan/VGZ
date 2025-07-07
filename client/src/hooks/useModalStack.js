import { useState, useCallback } from 'react';

export const useModalStack = () => {
  const [modalStack, setModalStack] = useState([]);

  const openModal = useCallback((modalData) => {
    setModalStack(prev => [...prev, modalData]);
  }, []);

  const closeModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const replaceModal = useCallback((modalData) => {
    setModalStack([modalData]);
  }, []);

  return {
    modalStack,
    openModal,
    closeModal,
    closeAllModals,
    replaceModal,
    currentModal: modalStack[modalStack.length - 1] || null
  };
};
