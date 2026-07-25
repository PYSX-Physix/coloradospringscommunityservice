import React from 'react';
import { Dialog } from './Dialog';
import { startTwoFactorSetup, confirmTwoFactorSetup } from '../lib/auth-client';
import { CheckCircleIcon, XCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

type Step = 'loading' | 'scan' | 'verify' | 'recovery' | 'done';

interface TwoFactorSetupProps {
  open: boolean;
  onClose: () => void;
  onEnabled: () => void;
}

export function TwoFactorSetup({ open, onClose, onEnabled }: TwoFactorSetupProps) {
  const [step, setStep] = React.useState<Step>('loading');
  const [qrCode, setQrCode] = React.useState('');
  const [secret, setSecret] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);
  const [savedConfirmed, setSavedConfirmed] = React.useState(false);

  const reset = React.useCallback(() => {
    setStep('loading');
    setQrCode('');
    setSecret('');
    setCode('');
    setError('');
    setSubmitting(false);
    setRecoveryCodes([]);
    setCopied(false);
    setSavedConfirmed(false);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    reset();
    startTwoFactorSetup()
      .then((data) => {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('scan');
      })
      .catch((err) => {
        setError(err.message || 'Failed to start setup');
        setStep('scan');
      });
  }, [open, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await confirmTwoFactorSetup(code);
      setRecoveryCodes(data.recoveryCodes);
      setStep('recovery');
    } catch (err: any) {
      setError(err.message || 'Invalid authentication code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; user can still select/copy manually.
    }
  };

  const handleFinish = () => {
    setStep('done');
    onEnabled();
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Enable Two-Factor Authentication" maxWidth="max-w-md">
      {step === 'loading' && (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {step === 'scan' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Step 1 of 3 — Scan this QR code with Google Authenticator, Microsoft Authenticator, 1Password, Bitwarden, Authy, or any other authenticator app.
          </p>

          {qrCode ? (
            <div className="flex justify-center bg-white rounded-lg p-4">
              <img src={qrCode} alt="Two-factor authentication QR code" className="w-48 h-48" />
            </div>
          ) : (
            <div className="text-sm text-red-400">{error || 'Could not load QR code.'}</div>
          )}

          {secret && (
            <div>
              <label className="label">Can't scan? Enter this key manually</label>
              <code className="block w-full text-center text-sm text-gray-200 bg-neutral-800 rounded-lg px-3 py-2 tracking-wider break-all">
                {secret}
              </code>
            </div>
          )}

          <button className="btn-primary w-full" onClick={() => setStep('verify')} disabled={!qrCode}>
            Next
          </button>
        </div>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-gray-400">
            Step 2 of 3 — Enter the 6-digit code from your authenticator app to confirm setup.
          </p>
          <div>
            <label className="label">Verification Code</label>
            <input
              className="input text-center text-lg tracking-[0.3em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
              <XCircleIcon className="w-4 h-4" /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting || code.length !== 6}>
            {submitting ? 'Verifying...' : 'Verify & Enable'}
          </button>
        </form>
      )}

      {step === 'recovery' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Step 3 of 3 — Save these recovery codes somewhere safe. Each code can be used once to sign in if you lose access to your authenticator app. They won't be shown again.
          </p>

          <div className="grid grid-cols-2 gap-2 bg-neutral-800 rounded-lg p-4">
            {recoveryCodes.map((rc) => (
              <code key={rc} className="text-sm text-gray-200 text-center tracking-wide">{rc}</code>
            ))}
          </div>

          <button type="button" className="btn-secondary w-full flex items-center justify-center gap-2" onClick={handleCopyRecoveryCodes}>
            <ClipboardDocumentIcon className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Codes'}
          </button>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 rounded"
              checked={savedConfirmed}
              onChange={(e) => setSavedConfirmed(e.target.checked)}
            />
            <span className="text-sm text-gray-400">I've saved these recovery codes somewhere safe.</span>
          </label>

          <button type="button" className="btn-primary w-full" disabled={!savedConfirmed} onClick={handleFinish}>
            Continue
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4 text-center py-4">
          <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto" />
          <div>
            <h3 className="text-white font-semibold">Two-factor authentication enabled</h3>
            <p className="text-sm text-gray-400 mt-1">Your account is now protected with an authenticator app.</p>
          </div>
          <button type="button" className="btn-primary w-full" onClick={handleClose}>
            Done
          </button>
        </div>
      )}
    </Dialog>
  );
}
