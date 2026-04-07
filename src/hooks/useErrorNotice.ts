import React from 'react';

export interface ErrorNotice {
  title: string;
  description: string;
}

interface UseErrorNoticeReturn {
  notice: ErrorNotice | null;
  isOpen: boolean;
  showError: (title: string, description: string) => void;
  closeError: () => void;
}

/**
 * Custom hook for centralized error handling and display.
 * Manages error state and provides a consistent way to show errors via NoticeDialog.
 * 
 * @returns Object containing error state and handlers
 */
export function useErrorNotice(): UseErrorNoticeReturn {
  const [notice, setNotice] = React.useState<ErrorNotice | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  /**
   * Show an error message.
   */
  const showError = React.useCallback((title: string, description: string) => {
    setNotice({ title, description });
    setIsOpen(true);
  }, []);

  /**
   * Close the error dialog.
   */
  const closeError = React.useCallback(() => {
    setIsOpen(false);
    // Clear notice after animation
    setTimeout(() => setNotice(null), 300);
  }, []);

  return {
    notice,
    isOpen,
    showError,
    closeError,
  };
}
