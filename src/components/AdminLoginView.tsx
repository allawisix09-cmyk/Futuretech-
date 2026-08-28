import React, { useState } from 'react';
import { api } from '../services/api';
import { User, InviteStats } from '../types';
import { FutureTechLogo } from './FutureTechLogo';
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: (user: User, inviteStats: InviteStats) => void;
  onBackToHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const [username, setUsername] = useState('kabandaaiman');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(password, username);
      onLoginSuccess(res.user, res.inviteStats);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-view" className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Back button */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 z-10">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081224] border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to User Site</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] font-mono text-amber-300">
          <ShieldCheck className="w-3 h-3" />
          <span>Port 3000 Secured</span>
        </div>
      </div>

      {/* Admin Login Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#091428] to-[#050b16] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,180,27,0.15)] relative z-10">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <FutureTechLogo size="lg" glow={true} className="mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-orbitron font-extrabold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            <span>Root Admin Authentication</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-orbitron font-black text-white">
            FUTURE TECH Admin Platform
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Restricted control room for platform management and telemetry
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-xs font-mono text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Admin Identifier */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
              Administrator Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="kabandaaiman"
                className="w-full px-4 py-3 rounded-2xl bg-[#040813] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Admin Password (MASKED) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono text-slate-300 font-semibold">
                Administrator Password
              </label>
              <span className="text-[10px] font-mono text-amber-400/80">Protected Credential</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#040813] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Masked for security. Passwords are never logged or exposed in plain text.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-orbitron font-black text-xs uppercase tracking-wider transition duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,180,27,0.4)] disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse font-mono text-xs">Authenticating Keys...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Log In to Admin Platform</span>
              </>
            )}
          </button>
        </form>

        {/* Security Warning Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
            All administrative actions, status toggles, machine creations, and transaction reviews are cryptographically recorded in tamper-proof audit trails.
          </p>
        </div>
      </div>
    </div>
  );
};
