import React from 'react';
import { useSession, disableTwoFactor, getRecoveryCodesStatus, regenerateRecoveryCodes } from './lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon, ShieldExclamationIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Dialog } from './components/Dialog';
import { TwoFactorSetup } from './components/TwoFactorSetup';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export default function Settings() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [profileSave, setProfileSave] = React.useState<SaveState>('idle');
  const [passwordSave, setPasswordSave] = React.useState<SaveState>('idle');
  const [profileError, setProfileError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [recoveryRemaining, setRecoveryRemaining] = React.useState<number | null>(null);
  const [showSetup, setShowSetup] = React.useState(false);
  const [showDisable, setShowDisable] = React.useState(false);
  const [showRegen, setShowRegen] = React.useState(false);

  const refreshRecoveryStatus = React.useCallback(() => {
    getRecoveryCodesStatus().then(d => setRecoveryRemaining(d.remaining)).catch(() => setRecoveryRemaining(null));
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      setTwoFactorEnabled(!!session.user.twoFactorEnabled);
    }
  }, [session]);

  React.useEffect(() => {
    if (twoFactorEnabled) refreshRecoveryStatus();
    else setRecoveryRemaining(null);
  }, [twoFactorEnabled, refreshRecoveryStatus]);

  React.useEffect(() => {
    if (!isPending && !session) navigate('/auth');
  }, [session, isPending, navigate]);

  React.useEffect(() => {
    if (session?.user) { setName(session.user.name || ''); setEmail(session.user.email || ''); }
  }, [session]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSave('saving');
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ name, email }),
      });
      if (res.ok) { setProfileSave('success'); setTimeout(() => setProfileSave('idle'), 3000); }
      else { const d = await res.json(); setProfileError(d.error || 'Failed to update profile'); setProfileSave('error'); }
    } catch { setProfileError('Network error. Please try again.'); setProfileSave('error'); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    setPasswordSave('saving');
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPasswordSave('success');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setPasswordSave('idle'), 3000);
      } else { const d = await res.json(); setPasswordError(d.error || 'Failed to update password'); setPasswordSave('error'); }
    } catch { setPasswordError('Network error.'); setPasswordSave('error'); }
  };

  if (isPending) return (
    <div className="flex justify-center mt-12">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!session) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <div className="divider" />

      {/* Profile */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
        <p className="text-sm text-gray-400 mb-4">Your display name is shown to other users. Your email is private.</p>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="How you appear to other users" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          {profileSave === 'success' && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-700/50 rounded-lg px-3 py-2">
              <CheckCircleIcon className="w-4 h-4" /> Profile updated successfully.
            </div>
          )}
          {profileSave === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
              <XCircleIcon className="w-4 h-4" /> {profileError}
            </div>
          )}

          <button type="submit" disabled={profileSave === 'saving'} className="btn-primary">
            {profileSave === 'saving' ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Change Password</h2>
        <p className="text-sm text-gray-400 mb-4">Leave blank if you don't want to change your password.</p>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="label">Current Password *</label>
            <input type="password" className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">New Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-1">
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm New Password *</label>
            <input type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>

          {passwordSave === 'success' && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-700/50 rounded-lg px-3 py-2">
              <CheckCircleIcon className="w-4 h-4" /> Password changed successfully.
            </div>
          )}
          {passwordSave === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
              <XCircleIcon className="w-4 h-4" /> {passwordError}
            </div>
          )}

          <button type="submit" disabled={passwordSave === 'saving'} className="btn-primary">
            {passwordSave === 'saving' ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
      {/* Security */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
        <p className="text-sm text-gray-400 mb-4">Add an extra layer of protection with an authenticator app.</p>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {twoFactorEnabled ? (
              <ShieldCheckIcon className="w-8 h-8 text-green-400 shrink-0" />
            ) : (
              <ShieldExclamationIcon className="w-8 h-8 text-gray-500 shrink-0" />
            )}
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                {twoFactorEnabled && recoveryRemaining !== null && (
                  <> · {recoveryRemaining} recovery code{recoveryRemaining === 1 ? '' : 's'} remaining</>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {twoFactorEnabled ? (
              <>
                <button className="btn-secondary" onClick={() => setShowRegen(true)}>Regenerate Recovery Codes</button>
                <button className="btn-danger" onClick={() => setShowDisable(true)}>Disable</button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setShowSetup(true)}>Enable</button>
            )}
          </div>
        </div>
      </div>

      <TwoFactorSetup
        open={showSetup}
        onClose={() => setShowSetup(false)}
        onEnabled={() => { setTwoFactorEnabled(true); refreshRecoveryStatus(); }}
      />
      <DisableTwoFactorDialog
        open={showDisable}
        onClose={() => setShowDisable(false)}
        onDisabled={() => { setTwoFactorEnabled(false); setShowDisable(false); }}
      />
      <RegenerateRecoveryCodesDialog
        open={showRegen}
        onClose={() => setShowRegen(false)}
        onRegenerated={() => refreshRecoveryStatus()}
      />
    </div>
  );
}

function DisableTwoFactorDialog({ open, onClose, onDisabled }: { open: boolean; onClose: () => void; onDisabled: () => void }) {
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) { setPassword(''); setCode(''); setError(''); setSubmitting(false); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await disableTwoFactor({ password, code });
      onDisabled();
    } catch (err: any) {
      setError(err.message || 'Failed to disable two-factor authentication');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Disable Two-Factor Authentication" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-400">Confirm your password and a current authenticator code to disable two-factor authentication.</p>
        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="label">Authentication Code</label>
          <input
            className="input text-center tracking-[0.3em]"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
            <XCircleIcon className="w-4 h-4" /> {error}
          </div>
        )}

        <button type="submit" className="btn-danger w-full" disabled={submitting}>
          {submitting ? 'Disabling...' : 'Disable Two-Factor Authentication'}
        </button>
      </form>
    </Dialog>
  );
}

function RegenerateRecoveryCodesDialog({ open, onClose, onRegenerated }: { open: boolean; onClose: () => void; onRegenerated: () => void }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) { setPassword(''); setError(''); setSubmitting(false); setRecoveryCodes(null); setCopied(false); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await regenerateRecoveryCodes(password);
      setRecoveryCodes(data.recoveryCodes);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate recovery codes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!recoveryCodes) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — user can select/copy manually
    }
  };

  const handleClose = () => {
    if (recoveryCodes) onRegenerated();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Regenerate Recovery Codes" maxWidth="max-w-sm">
      {!recoveryCodes ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-400">
            This will invalidate your existing recovery codes. Confirm your password to generate a new set.
          </p>
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
              <XCircleIcon className="w-4 h-4" /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Generating...' : 'Regenerate Codes'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Save these new recovery codes somewhere safe. Your old codes no longer work, and these won't be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 bg-neutral-800 rounded-lg p-4">
            {recoveryCodes.map((rc) => (
              <code key={rc} className="text-sm text-gray-200 text-center tracking-wide">{rc}</code>
            ))}
          </div>
          <button type="button" className="btn-secondary w-full flex items-center justify-center gap-2" onClick={handleCopy}>
            <ClipboardDocumentIcon className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Codes'}
          </button>
          <button type="button" className="btn-primary w-full" onClick={handleClose}>Done</button>
        </div>
      )}
    </Dialog>
  );
}