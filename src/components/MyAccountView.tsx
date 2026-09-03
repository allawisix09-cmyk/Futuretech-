import React, { useState } from 'react';
import { User, InviteStats } from '../types';
import { FutureTechLogo } from './FutureTechLogo';
import { api } from '../services/api';
import {
  User as UserIcon,
  ShieldCheck,
  Key,
  Smartphone,
  Mail,
  Copy,
  Check,
  LogOut,
  HelpCircle,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface MyAccountViewProps {
  user: User;
  inviteStats: InviteStats;
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToInvites: () => void;
}

export const MyAccountView: React.FC<MyAccountViewProps> = ({
  user,
  inviteStats,
  onLogout,
  onNavigateToAdmin,
  onNavigateToInvites
}) => {
  const [copied, setCopied] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword);
      setPasswordMsg(res.message || 'Password successfully updated.');
      setTimeout(() => {
        setPasswordMsg(null);
        setShowPasswordChange(false);
        setOldPassword('');
        setNewPassword('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div id="my-account-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">
      
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#0b1c3e] to-[#071124] border border-cyan-500/40 glow-border-cyan flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-orbitron font-bold text-2xl text-white shadow-[0_0_20px_rgba(0,210,255,0.4)]">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white">{user.username}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                {user.role === 'admin' ? '⚡ ROOT ADMIN' : 'COMPUTE NODE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-orbitron font-bold uppercase flex items-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Node</span>
        </button>
      </div>

      {/* Admin Panel Access Banner if Role === Admin */}
      {user.role === 'admin' && onNavigateToAdmin && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-[#081224] border border-amber-500/50 glow-border-gold flex items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-orbitron font-extrabold uppercase">
              Admin Privileges
            </span>
            <h3 className="font-orbitron font-bold text-lg text-white mt-1">Platform Control Room</h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Review user registrations, approve transactions, manage machine stock, and broadcast announcements.
            </p>
          </div>
          <button
            onClick={onNavigateToAdmin}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase tracking-wider shrink-0 transition shadow-[0_0_15px_rgba(245,180,27,0.4)]"
          >
            Open Admin Panel →
          </button>
        </div>
      )}

      {/* Account Details & Security Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Node Profile Details */}
        <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4">
          <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <span>Profile Specifications</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Node Identifier:</span>
              <span className="text-white font-semibold">{user.id}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Registered Phone:</span>
              <span className="text-white font-semibold">{user.phoneNumber}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Referral Code:</span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold">{user.referralCode}</span>
                <button onClick={handleCopyCode} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Member Since:</span>
              <span className="text-white font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={onNavigateToInvites}
            className="w-full py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Manage Special Link & Invites</span>
          </button>
        </div>

        {/* Security & Cryptographic Protection */}
        <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4">
          <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Security & Cryptography</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-white font-semibold block">Two-Factor Authentication</span>
                <span className="text-[10px] text-slate-400">Biometric or SMS USSD challenge</span>
              </div>
              <button
                type="button"
                onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                  twoFaEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white block" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-white font-semibold block">Password Hash Standard</span>
                <span className="text-[10px] text-slate-400">HMAC-SHA256 Multi-Round Salt</span>
              </div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px]"
              >
                {showPasswordChange ? 'Cancel' : 'Change'}
              </button>
            </div>
          </div>

          {showPasswordChange && (
            <form onSubmit={handleSavePassword} className="p-4 rounded-2xl bg-[#050a14] border border-cyan-500/40 space-y-3 font-mono text-xs">
              {passwordMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{passwordMsg}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#081224] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">New Password (Min. 6 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#081224] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase transition disabled:opacity-50"
              >
                {passwordLoading ? 'Updating Credentials...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Corporate & 20-Year Uganda Government Partnership */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#061224] via-[#091b38] to-[#061224] border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇨🇳 🇺🇬</span>
            <div>
              <h3 className="font-orbitron font-black text-base text-white">Future Tech Corporation — Uganda Branch</h3>
              <p className="text-xs text-emerald-300 font-mono">Bilateral 20-Year State Concession & Operations Agreement</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            2026 – 2046 Active Mandate
          </span>
        </div>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          Future Tech is a premier computing enterprise headquartered in China. Future Tech has established its official new branch in Uganda under a landmark 20-year official agreement and contract with the Ugandan Government to operate high-performance compute nodes, deliver real-time cloud computing yields, and power instant mobile money payouts nationwide.
        </p>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Frequently Asked Questions & Support</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#050a14] border border-slate-800 space-y-1">
            <h4 className="text-white font-bold">How are machine yields accrued?</h4>
            <p className="text-slate-400 leading-relaxed">
              Yields accumulate continuously every hour according to real cluster hash execution and can be claimed to your balance at any time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050a14] border border-slate-800 space-y-1">
            <h4 className="text-white font-bold">How fast are Mobile Money payouts in Uganda?</h4>
            <p className="text-slate-400 leading-relaxed">
              MTN MoMo and Airtel Money withdrawals are queued and processed automatically to your registered telecom number.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050a14] border border-slate-800 space-y-1">
            <h4 className="text-white font-bold">What is the Special Link referral commission?</h4>
            <p className="text-slate-400 leading-relaxed">
              You receive a 5% commission on all machine rental leases completed by users who register through your link.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050a14] border border-slate-800 space-y-1">
            <h4 className="text-white font-bold">Need direct support?</h4>
            <p className="text-slate-400 leading-relaxed">
              Reach the network administrators at <code className="text-cyan-300">support@futuretech.com</code> or on official Telegram @futuretech_ops.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
