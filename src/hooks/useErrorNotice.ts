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

export function useErrorNotice(): UseErrorNoticeReturn {
  const [notice, setNotice] = React.useState<ErrorNotice | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const showError = React.useCallback((title: string, description: string) => {
    setNotice({ title, description });
    setIsOpen(true);
  }, []);

  const closeError = React.useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setNotice(null), 300);
  }, []);

  return { notice, isOpen, showError, closeError };
}