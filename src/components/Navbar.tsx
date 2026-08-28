import React, { useState } from 'react';
import { FutureTechLogo } from './FutureTechLogo';
import { User, NotificationItem, NodeTelemetry } from '../types';
import {
  Bell,
  Wallet,
  ShieldCheck,
  Cpu,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  telemetry: NodeTelemetry | null;
  onQuickDeposit: () => void;
  onAdminClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  notifications,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  telemetry,
  onQuickDeposit,
  onAdminClick
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050914]/90 backdrop-blur-md border-b border-cyan-900/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab(user ? 'home' : 'landing')}
          className="cursor-pointer transition hover:opacity-90 flex items-center"
        >
          <FutureTechLogo size="md" />
        </div>

        {/* Global Node Telemetry Pill (Desktop) */}
        {telemetry && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#091224] border border-cyan-500/20 text-xs font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-slate-400">Nodes Online: <strong className="text-cyan-300 font-semibold">{telemetry.onlineNodes}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Hashrate: <strong className="text-blue-400 font-semibold">{telemetry.networkHashrate}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Latency: <strong className="text-emerald-400 font-semibold">{telemetry.networkLatencyMs}ms</strong></span>
          </div>
        )}

        {/* Right Side Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Quick Wallet Pill */}
              <div
                onClick={() => setActiveTab('wallet')}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091429] border border-cyan-500/30 hover:border-cyan-400 transition shadow-[0_0_10px_rgba(0,180,255,0.1)]"
              >
                <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-mono text-slate-400 leading-none">Wallet</span>
                  <span className="text-xs sm:text-sm font-orbitron font-bold text-white leading-tight">
                    UGX {(user.walletBalanceUGX ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Deposit Action */}
              <button
                id="navbar-deposit-btn"
                onClick={onQuickDeposit}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-[0_0_12px_rgba(0,180,255,0.3)] transition"
              >
                <span>+ Deposit</span>
              </button>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  id="notifications-bell-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 rounded-xl bg-[#0a1122] border border-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-white transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-black ring-2 ring-[#050914] animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#091122] border border-cyan-500/40 shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-orbitron text-sm font-bold text-white">Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllNotificationsRead}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center">No notifications at the moment.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => onMarkNotificationRead(n.id)}
                            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                              n.read
                                ? 'bg-[#060c18] border-slate-800/80 text-slate-400'
                                : 'bg-[#0d1c38] border-cyan-500/40 text-slate-200 shadow-[0_0_10px_rgba(0,180,255,0.15)]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {n.type === 'earnings' ? (
                                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : n.type === 'referral' ? (
                                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                              ) : (
                                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-white">{n.title}</p>
                                <p className="text-[11px] text-slate-300 mt-0.5">{n.message}</p>
                                <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#091429] border border-cyan-500/30 hover:border-cyan-400 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-orbitron font-bold text-xs shadow-[0_0_8px_rgba(0,210,255,0.4)]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">{user.username}</span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase leading-tight">
                      {user.role === 'admin' ? '⚡ Administrator' : 'Computing Node'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#091122] border border-cyan-500/40 shadow-2xl p-2 z-50 divide-y divide-cyan-900/40">
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-white">{user.username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono text-cyan-300">
                        Code: {user.referralCode}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('my');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-cyan-950/40 rounded-lg transition text-left"
                      >
                        <UserIcon className="w-4 h-4 text-cyan-400" />
                        <span>My Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('invites');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-cyan-950/40 rounded-lg transition text-left"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>My Special Link & Invites</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 rounded-lg transition text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-[#091224] border border-transparent hover:border-amber-500/30 transition"
                  title="Admin Platform Portal"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-[#091224] border border-cyan-500/30 hover:border-cyan-400 transition"
              >
                Login
              </button>
              <button
                id="nav-get-started-btn"
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white glow-btn-primary"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
