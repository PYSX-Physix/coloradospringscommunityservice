import React from 'react';
import { useSession } from './lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

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
    </div>
  );
}