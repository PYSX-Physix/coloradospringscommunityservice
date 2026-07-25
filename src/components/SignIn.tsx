import React from 'react';
import { signIn, signUp, verifyTwoFactorLogin } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function SignIn() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const navigate = useNavigate();

  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [useRecoveryCode, setUseRecoveryCode] = React.useState(false);
  const [recoveryCode, setRecoveryCode] = React.useState('');
  const [twoFactorSubmitting, setTwoFactorSubmitting] = React.useState(false);
  const [twoFactorError, setTwoFactorError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, name);
        alert('Account created! Please sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        const result = await signIn(email, password);
        if (result.requires2FA) {
          setChallengeId(result.challengeId);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setTwoFactorError('');
    setTwoFactorSubmitting(true);
    try {
      await verifyTwoFactorLogin(
        useRecoveryCode ? { challengeId, recoveryCode } : { challengeId, code: twoFactorCode },
      );
      navigate('/');
    } catch (err: any) {
      setTwoFactorError(err.message || 'Verification failed');
    } finally {
      setTwoFactorSubmitting(false);
    }
  };

  if (challengeId) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <span className="text-white font-bold text-lg">CS</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {useRecoveryCode ? 'Enter one of your recovery codes' : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              {useRecoveryCode ? (
                <div>
                  <label className="label">Recovery Code</label>
                  <input
                    className="input text-center tracking-widest"
                    value={recoveryCode}
                    onChange={e => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="ABCD-EFGH"
                    autoFocus
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="label">Verification Code</label>
                  <input
                    className="input text-center text-lg tracking-[0.3em]"
                    value={twoFactorCode}
                    onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
              )}

              {twoFactorError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{twoFactorError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={twoFactorSubmitting || (useRecoveryCode ? !recoveryCode : twoFactorCode.length !== 6)}
                className="btn-primary w-full"
              >
                {twoFactorSubmitting ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            <div className="divider mt-4" />

            <button
              onClick={() => { setUseRecoveryCode(!useRecoveryCode); setTwoFactorError(''); setTwoFactorCode(''); setRecoveryCode(''); }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-200 transition-colors mt-2"
            >
              {useRecoveryCode ? 'Use authenticator app instead' : "Can't access your authenticator app? Use a recovery code"}
            </button>
            <button
              onClick={() => { setChallengeId(null); setTwoFactorCode(''); setRecoveryCode(''); setTwoFactorError(''); setUseRecoveryCode(false); }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors mt-2"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <span className="text-white font-bold text-lg">CS</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {isSignUp ? 'Sign up to create community service events' : 'CO Springs Community Service Hub'}
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="label">Username</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Do not use your real name!"
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-1"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  required
                />
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="/policies/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="/policies/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</a>
                </span>
              </label>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignUp && !agreed)}
              className="btn-primary w-full"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="divider mt-4" />

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setPassword(''); }}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-200 transition-colors mt-2"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}