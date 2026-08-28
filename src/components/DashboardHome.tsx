import React, { useState } from 'react';
import { User, InviteStats, Machine, MachineRental, Transaction } from '../types';
import { CpuVisual } from './CpuVisual';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Cpu,
  TrendingUp,
  Clock,
  Zap,
  Activity,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
  Smartphone,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardHomeProps {
  user: User;
  inviteStats: InviteStats;
  machines: Machine[];
  myRentals: MachineRental[];
  onNavigate: (tab: string) => void;
  onSelectMachine: (machine: Machine) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onClaimAll: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  user,
  inviteStats,
  machines,
  myRentals,
  onNavigate,
  onSelectMachine,
  onDeposit,
  onWithdraw,
  onClaimAll
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const activeRentals = myRentals.filter(r => r.status === 'active');
  const totalHashRate = activeRentals.reduce((sum, r) => sum + r.hashRate, 0);
  const totalUnclaimed = activeRentals.reduce((sum, r) => sum + r.unclaimedEarningsUGX, 0);

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      setShareNotice(type === 'link' ? 'Special referral link copied to clipboard!' : 'Referral code copied to clipboard!');
      setTimeout(() => setShareNotice(null), 3000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const triggerShare = (channel: string, shareUrl: string, text: string) => {
    try {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    } catch (e) {}
    setShareNotice(`Invitation copied to clipboard! (Opening ${channel}...)`);
    setTimeout(() => setShareNotice(null), 3500);
    try {
      window.open(shareUrl, '_blank');
    } catch (err) {
      console.warn('Popup blocked:', err);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `🚀 Join FUTURE TECH and earn daily profits by renting quantum computing power!\n\nUse my personal link to get a UGX 10,000 welcome credit:\n${user.referralLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    triggerShare('WhatsApp', url, text);
  };

  const shareViaSMS = () => {
    const text = `Join FUTURE TECH computing grid with my code ${user.referralCode} and start earning: ${user.referralLink}`;
    const url = `sms:?body=${encodeURIComponent(text)}`;
    triggerShare('SMS', url, text);
  };

  const shareViaTelegram = () => {
    const text = `Power the Future. Earn from Technology with FUTURE TECH computing clusters! Link: ${user.referralLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(user.referralLink)}&text=${encodeURIComponent(text)}`;
    triggerShare('Telegram', url, text);
  };

  return (
    <div id="dashboard-home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">

      {shareNotice && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/70 flex items-center gap-2 text-xs font-mono text-cyan-200 animate-pulse">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{shareNotice}</span>
        </div>
      )}
      
      {/* 1. Profile Welcome & Account Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#0b1b3b] to-[#081226] border border-cyan-500/40 glow-border-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center font-orbitron font-black text-xl shadow-[0_0_15px_rgba(0,210,255,0.4)]">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-orbitron font-extrabold text-white">
                Welcome, {user.username}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-[10px] font-mono text-cyan-300">
                ACTIVE NODE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Account ID: <span className="text-slate-300">{user.id}</span> | Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Balance Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="dash-deposit-btn"
            onClick={onDeposit}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            id="dash-withdraw-btn"
            onClick={onWithdraw}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-slate-200 hover:text-white bg-[#060c18] border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center gap-2 transition"
          >
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* 2. Financial Metrics Grid (Balances, Today's Earnings, Total Earnings) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-cyan-500/30 glow-border-blue relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Available Balance</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-orbitron font-black text-white mt-2">
            UGX {(user.walletBalanceUGX ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            ≈ ${((user.walletBalanceUGX ?? 0) / 3750).toFixed(2)} USD (Ready to withdraw)
          </p>
        </div>

        {/* Today's Earnings */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-emerald-500/30 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Today's Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-orbitron font-black text-emerald-400 mt-2">
            +UGX {(user.todayEarningsUGX ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            From {activeRentals.length} active machines + yields
          </p>
        </div>

        {/* Total Deposited */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-blue-500/30 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Deposited</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-orbitron font-bold text-white mt-2">
            UGX {(user.totalDepositedUGX ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            MTN / Airtel Mobile Money
          </p>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-purple-500/30 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Withdrawn</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-orbitron font-bold text-white mt-2">
            UGX {(user.totalWithdrawnUGX ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            Settled to Mobile Money
          </p>
        </div>

      </div>

      {/* 3. High-Priority Section: MY SPECIAL LINK & MY INVITES CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: MY SPECIAL LINK */}
        <div id="my-special-link-card" className="p-6 sm:p-7 rounded-3xl bg-[#081226] border border-cyan-500/50 glow-border-cyan flex flex-col justify-between relative shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-orbitron font-bold text-base sm:text-lg text-white uppercase tracking-wide">
                  MY SPECIAL LINK
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-[10px] font-orbitron font-bold text-amber-300">
                5% Lifetime Bonus
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Share your personal link. When new users register, the backend automatically links them to your account and pays you 5% of their machine rentals!
            </p>

            {/* Special Link Display Box */}
            <div className="p-3.5 rounded-2xl bg-[#040813] border border-cyan-500/40 flex items-center justify-between gap-2">
              <div className="truncate font-mono text-xs text-cyan-300 font-semibold select-all">
                {user.referralLink}
              </div>
              <button
                id="copy-special-link-btn"
                onClick={() => copyToClipboard(user.referralLink, 'link')}
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white border border-cyan-500/30 transition shrink-0"
                title="Copy Special Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Referral Code Quick Copy */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>Your Referral Code: <strong className="text-white">{user.referralCode}</strong></span>
              <button
                onClick={() => copyToClipboard(user.referralCode, 'code')}
                className="text-cyan-400 hover:underline"
              >
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Supported Share Action Buttons */}
          <div className="mt-6 pt-4 border-t border-cyan-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="share-whatsapp-btn"
              onClick={shareViaWhatsApp}
              className="py-2.5 px-2 rounded-xl bg-[#0d2a1b] hover:bg-[#133d27] border border-emerald-500/40 text-emerald-300 font-orbitron font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              id="share-sms-btn"
              onClick={shareViaSMS}
              className="py-2.5 px-2 rounded-xl bg-[#132238] hover:bg-[#1a2e4c] border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS</span>
            </button>

            <button
              id="share-telegram-btn"
              onClick={shareViaTelegram}
              className="py-2.5 px-2 rounded-xl bg-[#0d2238] hover:bg-[#122e4d] border border-blue-500/40 text-blue-300 font-orbitron font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              id="share-qrcode-btn"
              onClick={() => setShowQrModal(true)}
              className="py-2.5 px-2 rounded-xl bg-[#1f1a09] hover:bg-[#2c250d] border border-amber-500/40 text-amber-300 font-orbitron font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* CARD 2: MY INVITES CARD */}
        <div id="my-invites-card" className="p-6 sm:p-7 rounded-3xl bg-[#081226] border border-cyan-500/50 glow-border-blue flex flex-col justify-between relative shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-base sm:text-lg text-white uppercase tracking-wide">
                  MY INVITES
                </h3>
              </div>
              <button
                id="view-invites-btn"
                onClick={() => onNavigate('invites')}
                className="text-xs font-orbitron font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
              >
                <span>View Invites</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* Big Headline Number */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-orbitron font-black text-cyan-400">
                {inviteStats.successfulInvites}
              </span>
              <p className="text-xs text-slate-300 font-mono">
                People joined using your link
              </p>
            </div>

            {/* Live Backend Statistics Table Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
              <div className="p-3 rounded-2xl bg-[#040813] border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Total Invites</span>
                <strong className="text-base font-orbitron font-bold text-white mt-1 block">
                  {inviteStats.totalInvites}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-[#040813] border border-cyan-500/40">
                <span className="text-[10px] text-cyan-400 block uppercase">Successful</span>
                <strong className="text-base font-orbitron font-bold text-cyan-300 mt-1 block">
                  {inviteStats.successfulInvites}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-[#040813] border border-amber-500/30">
                <span className="text-[10px] text-amber-400 block uppercase">Pending</span>
                <strong className="text-base font-orbitron font-bold text-amber-300 mt-1 block">
                  {inviteStats.pendingInvites}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-[#040813] border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 block uppercase">Active Users</span>
                <strong className="text-base font-orbitron font-bold text-emerald-300 mt-1 block">
                  {inviteStats.activeInvites}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-900/40 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Referral Earnings:</span>
            <strong className="text-emerald-400 font-orbitron font-bold text-sm">
              UGX {(inviteStats?.totalReferralRewardsUGX ?? 0).toLocaleString()}
            </strong>
          </div>
        </div>

      </div>

      {/* 4. Active Computing Node Rentals Monitor */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#070f20] border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="font-orbitron font-bold text-lg text-white">
                Active Compute Node Clusters ({activeRentals.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Combined Hash Power: <strong className="text-cyan-300">{totalHashRate} TH/s</strong> | 24/7 Continuous Output
            </p>
          </div>

          {totalUnclaimed > 0 && (
            <button
              onClick={onClaimAll}
              className="px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-[0_0_15px_rgba(245,180,27,0.4)] flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Claim Yields (UGX {(totalUnclaimed ?? 0).toLocaleString()})</span>
            </button>
          )}
        </div>

        {activeRentals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#040813] border border-dashed border-slate-800">
            <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="font-orbitron text-sm font-bold text-slate-300">No active machines rented</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Rent a Gold, Silver, or Normal CPU to activate dedicated computing power and start receiving daily yields.
            </p>
            <button
              onClick={() => onNavigate('machines')}
              className="mt-4 px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary"
            >
              Rent a CPU Machine →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRentals.map(rental => (
              <div
                key={rental.id}
                className="p-4 rounded-2xl bg-[#050a14] border border-cyan-500/40 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <CpuVisual tier={rental.machineTier} size="sm" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-orbitron font-bold text-xs sm:text-sm text-white">
                        {rental.machineName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        rental.isWorkingToday !== false
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}>
                        {rental.isWorkingToday !== false ? '● Active Today (12 PM Update)' : '⏸ Weekend / Off Schedule'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                      {rental.workingDaysSchedule || (rental.machineTier === 'gold' ? 'Everyday' : rental.machineTier === 'silver' ? '6 Days/Wk' : 'Mon–Fri')} • UGX {(rental.dailyEstimatedYieldUGX ?? 0).toLocaleString()}/Day
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Accrued: <strong className="text-emerald-400">UGX {(rental.accumulatedEarningsUGX ?? 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    rental.isWorkingToday !== false
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                  }`}>
                    {rental.isWorkingToday !== false ? 'ONLINE' : 'WEEKEND OFF'}
                  </span>
                  <p className="text-[9px] font-mono text-slate-500 mt-2">
                    Auto 12 PM
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Available Computing Machines Catalog Quick View */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-lg text-white">
              Available Computing Machines
            </h3>
          </div>
          <button
            onClick={() => onNavigate('machines')}
            className="text-xs font-orbitron font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {machines.map(m => (
            <div
              key={m.id}
              onClick={() => onSelectMachine(m)}
              className="p-5 rounded-2xl bg-[#081224] border border-cyan-500/30 hover:border-cyan-400 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-center py-2">
                  <CpuVisual tier={m.tier} size="sm" />
                </div>
                <h4 className="font-orbitron font-bold text-sm text-white text-center mt-2 group-hover:text-cyan-300 transition">
                  {m.name}
                </h4>
                <p className="text-[11px] font-mono text-cyan-400 text-center">{m.computingPower}</p>
                
                <div className="mt-4 space-y-1.5 py-2.5 border-y border-slate-800 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Daily Yield (Est):</span>
                    <strong className="text-emerald-400">UGX {(m.dailyEstimatedYieldUGX ?? 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Term:</span>
                    <strong className="text-white">{m.durationDays} Days</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono">Price</span>
                  <div className="font-orbitron font-bold text-sm text-white">
                    UGX {(m.rentalPriceUGX ?? 0).toLocaleString()}
                  </div>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl font-orbitron font-bold text-[10px] uppercase text-white bg-blue-600 hover:bg-cyan-500 transition">
                  Rent →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="max-w-xs w-full rounded-3xl bg-[#091224] border border-cyan-500/50 p-6 text-center text-white space-y-4">
            <h4 className="font-orbitron font-bold text-sm">Your Personal QR Code</h4>
            
            {/* High-Tech Stylized QR Visual */}
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block shadow-[0_0_20px_rgba(0,210,255,0.4)]">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <rect width="100" height="100" fill="white" />
                {/* Corner markers */}
                <rect x="10" y="10" width="25" height="25" fill="#050914" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="19" y="19" width="7" height="7" fill="#0088ff" />

                <rect x="65" y="10" width="25" height="25" fill="#050914" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="74" y="19" width="7" height="7" fill="#0088ff" />

                <rect x="10" y="65" width="25" height="25" fill="#050914" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="19" y="74" width="7" height="7" fill="#0088ff" />

                {/* Simulated Data matrix points */}
                <rect x="42" y="15" width="6" height="6" fill="#050914" />
                <rect x="52" y="25" width="6" height="6" fill="#050914" />
                <rect x="42" y="38" width="6" height="6" fill="#0088ff" />
                <rect x="52" y="48" width="6" height="6" fill="#050914" />
                <rect x="65" y="45" width="6" height="6" fill="#050914" />
                <rect x="75" y="55" width="6" height="6" fill="#0088ff" />
                <rect x="42" y="65" width="6" height="6" fill="#050914" />
                <rect x="55" y="75" width="6" height="6" fill="#050914" />
                <rect x="70" y="80" width="6" height="6" fill="#0088ff" />
                <rect x="85" y="70" width="6" height="6" fill="#050914" />
              </svg>
            </div>

            <p className="text-xs font-mono text-cyan-300 font-semibold">{user.referralCode}</p>
            <p className="text-[11px] text-slate-400 font-mono">Scan with camera to register through special invite link.</p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-orbitron font-bold text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
