import React, { useState, useEffect } from 'react';
import { FutureTechLogo } from './FutureTechLogo';
import { api } from '../services/api';
import { User, InviteStats } from '../types';
import {
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  initialReferralCode?: string;
  onAuthSuccess: (user: User, inviteStats: InviteStats) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  initialReferralCode = '',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  
  // Register fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+256');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // User Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Admin Login specific fields
  const [adminUsername, setAdminUsername] = useState('kabandaaiman');
  const [adminPassword, setAdminPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<{ username: string; code: string } | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
      checkReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const checkReferralCode = async (code: string) => {
    if (!code || code.trim().length < 3) {
      setReferrerInfo(null);
      return;
    }
    try {
      const res = await api.validateReferralCode(code.trim().toUpperCase());
      if (res.valid) {
        setReferrerInfo({ username: res.username, code: res.code });
      } else {
        setReferrerInfo(null);
      }
    } catch {
      setReferrerInfo(null);
    }
  };

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must accept the terms and conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        username,
        email,
        phoneNumber,
        password,
        referralCode: referralCode || undefined,
        agreedToTerms
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessMsg('Account created successfully! Connecting to decentralized grid...');
      setTimeout(() => {
        onAuthSuccess(res.user, res.inviteStats);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier || !loginPassword) {
      setError('Please provide your email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        identifier: loginIdentifier,
        password: loginPassword
      });

      setSuccessMsg('Authentication verified. Accessing dashboard...');
      setTimeout(() => {
        onAuthSuccess(res.user, res.inviteStats);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminUsername || !adminPassword) {
      setError('Please enter the administrator username and security password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        identifier: adminUsername,
        password: adminPassword
      });

      if (res.user.role !== 'admin') {
        setError('Unauthorized: Account does not have administrative privileges.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Admin credentials verified. Launching Admin Control Center...');
      setTimeout(() => {
        onAuthSuccess(res.user, res.inviteStats);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Admin authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      <div className="relative w-full max-w-md my-8 rounded-3xl bg-[#091224] border border-cyan-500/50 glow-border-cyan shadow-2xl p-6 sm:p-8 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#050a14] border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-400 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header with New F Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <FutureTechLogo size="md" />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {mode === 'register'
              ? 'Join the Decentralized Computing Grid'
              : mode === 'admin'
              ? 'Administrative Security & System Access'
              : 'Enter Secure Node Credentials'}
          </p>
        </div>

        {/* 3-Slot Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#050a14] border border-cyan-900/40 mb-6 text-center">
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-[11px] font-orbitron font-bold rounded-lg transition ${
              mode === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(0,180,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-[11px] font-orbitron font-bold rounded-lg transition ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(0,180,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User Login
          </button>

          <button
            id="auth-tab-admin"
            type="button"
            onClick={() => {
              setMode('admin');
              setError(null);
            }}
            className={`py-2 text-[11px] font-orbitron font-bold rounded-lg transition flex items-center justify-center gap-1 ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>

        {/* Referral Detected Banner */}
        {referrerInfo && mode === 'register' && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-950/70 border border-cyan-400/60 flex items-center gap-2.5 text-xs text-cyan-200 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">You were invited by </span>
              <strong className="text-white font-orbitron">@{referrerInfo.username}</strong>
              <span className="text-[10px] block font-mono text-cyan-300">
                Referral Code: {referrerInfo.code} (5% bonus linked)
              </span>
            </div>
          </div>
        )}

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="reg-username"
                  type="text"
                  required
                  placeholder="e.g. cyber_miner"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="+256772123456"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Referral / Invite Code</span>
                <span className="text-[10px] text-cyan-400">Auto-detected from link</span>
              </div>
              <input
                id="reg-referral-code"
                type="text"
                placeholder="e.g. FT-8K29X4"
                value={referralCode}
                onChange={e => {
                  setReferralCode(e.target.value);
                  checkReferralCode(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono uppercase focus:outline-none transition"
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="reg-terms-checkbox"
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded bg-[#050a14] border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
              <label htmlFor="reg-terms-checkbox" className="text-[11px] text-slate-300 cursor-pointer select-none">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  Terms & Conditions
                </button>{' '}
                and understand machine yields are performance estimates.
              </label>
            </div>

            <button
              id="reg-create-account-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,180,255,0.4)] disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Security Keys...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* USER LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Phone Number or Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  placeholder="+256772123456 or user@futuretech.com"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions dispatched to your registered email or phone.')}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-[#050a14] border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Remember me on this node</span>
              </label>

              <button
                type="button"
                onClick={() => setMode('admin')}
                className="text-amber-400 hover:text-amber-300 font-mono text-[10px] flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Admin Slot</span>
              </button>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,180,255,0.4)] disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Login to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ADMIN LOGIN SLOT */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2.5 text-xs text-amber-200">
              <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white font-orbitron block text-[11px]">ADMIN CONTROL GATEWAY</strong>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  Restricted portal for system administrators and hardware operations.
                </span>
              </div>
            </div>

            {/* Admin Name Slot */}
            <div>
              <label className="block text-xs font-mono text-amber-300 mb-1">
                Admin Username / Identifier
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  id="admin-username-slot"
                  type="text"
                  required
                  placeholder="kabandaaiman"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050a14] border border-amber-500/50 focus:border-amber-400 text-amber-200 text-xs font-mono focus:outline-none transition shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                />
              </div>
            </div>

            {/* Admin Password Slot (Hidden / Masked with password type) */}
            <div>
              <label className="block text-xs font-mono text-amber-300 mb-1">
                Admin Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  id="admin-password-slot"
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#050a14] border border-amber-500/50 focus:border-amber-400 text-white text-xs font-mono focus:outline-none transition shadow-[0_0_10px_rgba(245,158,11,0.15)] tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-3 text-amber-400/70 hover:text-amber-300"
                  aria-label="Toggle password visibility"
                >
                  {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Password is securely masked and authenticated via server-side cryptographic hash.
              </p>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Admin Session</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="max-w-lg w-full rounded-2xl bg-[#081224] border border-cyan-500/50 p-6 text-slate-300 text-xs space-y-3 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-orbitron font-bold text-white">FUTURE TECH Terms & Service</h3>
            <p>1. Computing machines represent decentralized hardware compute shares leased for 30-day continuous terms.</p>
            <p>2. Daily earnings are estimates based on active network processing difficulty and are credited upon verification at 12:00 PM.</p>
            <p>3. Payments in Uganda via MTN Mobile Money (*165#) and Airtel Money (*185#) are processed securely without storing user carrier PINs.</p>
            <p>4. Referral rewards (5%) are credited upon legitimate referred user rentals. Self-referrals are strictly disallowed.</p>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full mt-4 py-2 rounded-xl bg-cyan-500 text-black font-bold font-orbitron text-xs uppercase"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
