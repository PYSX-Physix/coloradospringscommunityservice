import React from 'react';

export type ReportState = 'closed' | 'form' | 'confirmation';

interface UseReportPostReturn {
  state: ReportState;
  category: string;
  details: string;
  isSubmitting: boolean;
  error: string | null;
  setReportState: (state: ReportState) => void;
  setCategory: (category: string) => void;
  setDetails: (details: string) => void;
  submitReport: (postId: number) => Promise<boolean>;
  resetForm: () => void;
  isFormValid: () => boolean;
}

export function useReportPost(onError?: (error: string) => void): UseReportPostReturn {
  const [state, setState] = React.useState<ReportState>('closed');
  const [category, setCategory] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isFormValid = React.useCallback(() => {
    if (!category) {
      const err = 'Please select a report category.';
      setError(err);
      onError?.(err);
      return false;
    }
    if (!details || details.trim().length < 10) {
      const err = 'Please provide at least 10 characters of details.';
      setError(err);
      onError?.(err);
      return false;
    }
    return true;
  }, [category, details, onError]);

  const resetForm = React.useCallback(() => {
    setCategory('');
    setDetails('');
    setError(null);
  }, []);

  const submitReport = React.useCallback(async (postId: number): Promise<boolean> => {
    setError(null);
    if (!isFormValid()) return false;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId, category, description: details || 'No additional details provided' }),
      });

      if (res.ok) {
        resetForm();
        setState('confirmation');
        return true;
      } else {
        const errorData = await res.json();
        const errorMsg = errorData.error?.toString() || 'Failed to submit report.';
        setError(errorMsg);
        onError?.(errorMsg);
        return false;
      }
    } catch {
      const errorMsg = 'An error occurred while submitting your report.';
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [category, details, isFormValid, onError, resetForm]);

  const setReportState = React.useCallback((newState: ReportState) => {
    setState(newState);
    if (newState === 'closed') resetForm();
  }, [resetForm]);

  return { state, category, details, isSubmitting, error, setReportState, setCategory, setDetails, submitReport, resetForm, isFormValid };
}