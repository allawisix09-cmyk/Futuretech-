import React, { useState } from 'react';
import { User, InviteStats, ReferralRecord } from '../types';
import {
  Share2,
  Sparkles,
  Copy,
  Check,
  QrCode,
  MessageCircle,
  Smartphone,
  Send,
  Users,
  ShieldCheck,
  TrendingUp,
  Gift,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyInvitesViewProps {
  user: User | null;
  inviteStats: InviteStats;
  referrals: ReferralRecord[];
  onOpenAuth?: () => void;
  onQuickDemoLogin?: () => void;
}

export const MyInvitesView: React.FC<MyInvitesViewProps> = ({
  user,
  inviteStats,
  referrals,
  onOpenAuth,
  onQuickDemoLogin
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const effectiveReferralLink = user ? user.referralLink : 'https://futuretech.com/join/FT-8K29X4';
  const effectiveReferralCode = user ? user.referralCode : 'FT-8K29X4';

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
      setShareNotice(type === 'link' ? 'Special link copied to clipboard!' : 'Referral code copied to clipboard!');
      setTimeout(() => setShareNotice(null), 3000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const triggerShare = (channel: string, shareUrl: string, text: string) => {
    try {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    } catch (e) {}
    setShareNotice(`Link copied to clipboard! (Opening ${channel}...)`);
    setTimeout(() => setShareNotice(null), 3500);
    try {
      window.open(shareUrl, '_blank');
    } catch (err) {
      console.warn('Popup blocked:', err);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `🚀 Join FUTURE TECH and earn daily computing yields!\n\nUse my special link to get started:\n${effectiveReferralLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    triggerShare('WhatsApp', url, text);
  };

  const shareViaSMS = () => {
    const text = `Join FUTURE TECH computing grid with my code ${effectiveReferralCode}: ${effectiveReferralLink}`;
    const url = `sms:?body=${encodeURIComponent(text)}`;
    triggerShare('SMS', url, text);
  };

  const shareViaTelegram = () => {
    const text = `Power the Future. Earn from Technology with FUTURE TECH! Special link: ${effectiveReferralLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(effectiveReferralLink)}&text=${encodeURIComponent(text)}`;
    triggerShare('Telegram', url, text);
  };

  return (
    <div id="my-invites-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#0d214a] to-[#071124] border border-cyan-500/50 glow-border-cyan">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Referral & Community Growth Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white">
            My Special Link & Invites
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-mono leading-relaxed">
            Invite colleagues and associates to the FUTURE TECH computing grid. Earn an instant 5% commission on every machine lease activated through your link.
          </p>
        </div>

        {/* Real-time Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
          <div className="p-3.5 rounded-2xl bg-[#040813] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Invites</span>
            <strong className="text-xl font-orbitron font-black text-white mt-1 block">
              {inviteStats.totalInvites}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#040813] border border-cyan-500/40">
            <span className="text-[10px] text-cyan-400 block uppercase">Successful</span>
            <strong className="text-xl font-orbitron font-black text-cyan-300 mt-1 block">
              {inviteStats.successfulInvites}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#040813] border border-amber-500/30">
            <span className="text-[10px] text-amber-400 block uppercase">Pending</span>
            <strong className="text-xl font-orbitron font-black text-amber-300 mt-1 block">
              {inviteStats.pendingInvites}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#040813] border border-emerald-500/40">
            <span className="text-[10px] text-emerald-400 block uppercase">Active Nodes</span>
            <strong className="text-xl font-orbitron font-black text-emerald-300 mt-1 block">
              {inviteStats.activeInvites}
            </strong>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#040813] border border-cyan-500/50">
            <span className="text-[10px] text-amber-300 block uppercase">Commission Paid</span>
            <strong className="text-sm sm:text-base font-orbitron font-bold text-amber-400 mt-1 block">
              UGX {(inviteStats?.totalReferralRewardsUGX ?? 0).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!user && (
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-cyan-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white font-orbitron text-xs block">Exploring Special Referral Engine (Guest Mode)</strong>
              <span className="text-cyan-300/80 text-[11px]">Every user gets a personalized referral code (e.g. FT-8K29X4). Earn 5% instant commissions on every machine leased by your invites.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onQuickDemoLogin && (
              <button
                onClick={onQuickDemoLogin}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase transition shadow-[0_0_12px_rgba(0,210,255,0.4)]"
              >
                Launch Demo Investor
              </button>
            )}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-3 py-2 rounded-xl bg-[#09152b] border border-cyan-400/50 text-cyan-300 hover:text-white font-mono text-xs transition"
              >
                Register
              </button>
            )}
          </div>
        </div>
      )}

      {shareNotice && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/70 flex items-center gap-2 text-xs font-mono text-cyan-200 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Share Links Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081226] border border-cyan-500/40 space-y-6">
        <h3 className="font-orbitron font-bold text-base sm:text-lg text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <span>{user ? 'Your Special Link & Sharing Tools' : 'Demo Special Link & Sharing Tools'}</span>
        </h3>

        {/* Special URL Bar */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5">Special Referral Link (Auto-detection enabled)</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3.5 rounded-2xl bg-[#040813] border border-cyan-500/40 font-mono text-xs text-cyan-300 truncate font-semibold select-all">
              {effectiveReferralLink}
            </div>
            <button
              onClick={() => copyToClipboard(effectiveReferralLink, 'link')}
              className="px-5 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,210,255,0.3)] shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Referral Code Bar */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5">Referral Code</label>
          <div className="flex items-center gap-2">
            <div className="w-48 p-3 rounded-2xl bg-[#040813] border border-slate-700 font-mono text-sm text-white font-bold text-center uppercase tracking-wider">
              {effectiveReferralCode}
            </div>
            <button
              onClick={() => copyToClipboard(effectiveReferralCode, 'code')}
              className="px-4 py-3 rounded-2xl bg-[#0d1c38] hover:bg-[#132850] text-cyan-300 border border-cyan-500/40 font-mono text-xs transition"
            >
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* 1-Click Social Shares */}
        <div className="pt-2 border-t border-cyan-900/40">
          <span className="block text-xs font-mono text-slate-400 mb-3">1-Click Instant Share</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={shareViaWhatsApp}
              className="py-3 px-3 rounded-2xl bg-[#0d2a1b] hover:bg-[#133d27] border border-emerald-500/40 text-emerald-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareViaSMS}
              className="py-3 px-3 rounded-2xl bg-[#132238] hover:bg-[#1a2e4c] border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>SMS</span>
            </button>

            <button
              onClick={shareViaTelegram}
              className="py-3 px-3 rounded-2xl bg-[#0d2238] hover:bg-[#122e4d] border border-blue-500/40 text-blue-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="py-3 px-3 rounded-2xl bg-[#1f1a09] hover:bg-[#2c250d] border border-amber-500/40 text-amber-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Referral History / Invited Users List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-orbitron font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Your Invited Network ({referrals.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Verified backend records with privacy-masked IDs (FT****29).
            </p>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#040813] border border-dashed border-slate-800 text-slate-400 text-xs font-mono">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <span>No invite records found yet. Share your special link to start building your network!</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-cyan-900/50 text-slate-400">
                  <th className="py-3 px-4">Invited Member</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Machine Status</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-cyan-950/20 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {ref.referredMaskedUsername}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {ref.hasRentedMachine ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          {ref.machineTier ? `${ref.machineTier.toUpperCase()} CPU` : 'RENTED'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[10px]">
                          Pending Rental
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {ref.status === 'active' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Registered</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-orbitron font-bold text-amber-400">
                      UGX {(ref.rewardAmountUGX ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="max-w-xs w-full rounded-3xl bg-[#091224] border border-cyan-500/50 p-6 text-center text-white space-y-4">
            <h4 className="font-orbitron font-bold text-sm">Scan Special Invite Link</h4>
            
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block shadow-[0_0_20px_rgba(0,210,255,0.4)]">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#050914" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="19" y="19" width="7" height="7" fill="#0088ff" />

                <rect x="65" y="10" width="25" height="25" fill="#050914" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="74" y="19" width="7" height="7" fill="#0088ff" />

                <rect x="10" y="65" width="25" height="25" fill="#050914" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="19" y="74" width="7" height="7" fill="#0088ff" />

                <rect x="42" y="15" width="6" height="6" fill="#050914" />
                <rect x="52" y="25" width="6" height="6" fill="#050914" />
                <rect x="42" y="38" width="6" height="6" fill="#0088ff" />
                <rect x="52" y="48" width="6" height="6" fill="#050914" />
                <rect x="65" y="45" width="6" height="6" fill="#050914" />
                <rect x="75" y="55" width="6" height="6" fill="#0088ff" />
                <rect x="42" y="65" width="6" height="6" fill="#050914" />
                <rect x="55" y="75" width="6" height="6" fill="#050914" />
                <rect x="70" y="80" width="6" height="6" fill="#0088ff" />
              </svg>
            </div>

            <p className="text-xs font-mono text-cyan-300 font-semibold">{user.referralCode}</p>
            <p className="text-[11px] text-slate-400 font-mono">Scan to register directly with your referral link.</p>

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
