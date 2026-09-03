import React, { useState } from 'react';
import { User, MachineRental, EarningsSummary } from '../types';
import { CpuVisual } from './CpuVisual';
import {
  TrendingUp,
  Zap,
  Clock,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EarningsDashboardProps {
  user: User | null;
  myRentals: MachineRental[];
  earningsSummary: EarningsSummary | null;
  onClaimAll: () => Promise<void>;
  onClaimSingle: (rentalId: string) => Promise<void>;
  onOpenAuth?: () => void;
}

export const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  user,
  myRentals,
  earningsSummary,
  onClaimAll,
  onClaimSingle,
  onOpenAuth
}) => {
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const activeRentals = (myRentals || []).filter(r => r.status === 'active');
  const totalUnclaimed = activeRentals.reduce((sum, r) => sum + (r.unclaimedEarningsUGX || 0), 0);

  const handleClaimAll = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (totalUnclaimed <= 0) return;
    setClaiming(true);
    setClaimError(null);
    try {
      await onClaimAll();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      setClaimSuccess(`Successfully claimed UGX ${(totalUnclaimed ?? 0).toLocaleString()} to your wallet balance.`);
      setTimeout(() => setClaimSuccess(null), 4000);
    } catch (err: any) {
      setClaimError(err.message || 'Claim failed. Please try again.');
      setTimeout(() => setClaimError(null), 5000);
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimSingle = async (rentalId: string, amount: number) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (amount <= 0) return;
    setClaiming(true);
    setClaimError(null);
    try {
      await onClaimSingle(rentalId);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      setClaimSuccess(`Claimed UGX ${(amount ?? 0).toLocaleString()} to your wallet balance.`);
      setTimeout(() => setClaimSuccess(null), 4000);
    } catch (err: any) {
      setClaimError(err.message || 'Claim failed. Please try again.');
      setTimeout(() => setClaimError(null), 5000);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div id="earnings-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#0b1f47] to-[#071124] border border-cyan-500/50 glow-border-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time Yield Streaming Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white">
            Earnings & Computations Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-mono leading-relaxed">
            Monitor and claim accrued compute payouts. Your yields accumulate continuously and can be moved directly to your withdrawable wallet.
          </p>
        </div>

        {/* Big Claim All Action */}
        <div className="w-full md:w-auto p-5 rounded-2xl bg-[#040813] border border-cyan-500/40 text-center md:text-right space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Unclaimed Accrued Yields
          </span>
          <div className="text-2xl font-orbitron font-black text-amber-400">
            UGX {(totalUnclaimed ?? 0).toLocaleString()}
          </div>
          <button
            onClick={handleClaimAll}
            disabled={claiming || totalUnclaimed <= 0}
            className="w-full px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 disabled:opacity-40 transition shadow-[0_0_15px_rgba(245,180,27,0.3)] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>
              {claiming ? 'Streaming to Wallet...' : 'Claim All to Wallet'}
            </span>
          </button>
        </div>
      </div>

      {claimSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 flex items-center gap-3 text-xs text-emerald-200 animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{claimSuccess}</span>
        </div>
      )}

      {claimError && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 flex items-center gap-3 text-xs text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{claimError}</span>
        </div>
      )}

      {/* 4 Financial Period Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#091224] border border-cyan-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Today's Output</span>
          <div className="text-xl sm:text-2xl font-orbitron font-black text-cyan-300 mt-1">
            UGX {(user?.todayEarningsUGX ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Calculated 24h cycle</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#091224] border border-blue-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">7-Day Projected</span>
          <div className="text-xl sm:text-2xl font-orbitron font-black text-blue-300 mt-1">
            UGX {((user?.todayEarningsUGX ?? 0) * 7).toLocaleString()}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Based on active clusters</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#091224] border border-purple-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">30-Day Monthly Projected</span>
          <div className="text-xl sm:text-2xl font-orbitron font-black text-purple-300 mt-1">
            UGX {((user?.todayEarningsUGX ?? 0) * 30).toLocaleString()}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Full 30-day lease term</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#091224] border border-emerald-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Lifetime Earned</span>
          <div className="text-xl sm:text-2xl font-orbitron font-black text-emerald-400 mt-1">
            UGX {(user?.totalEarningsUGX ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Total claimed yields</p>
        </div>
      </div>

      {/* Active Machine Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30">
        <h3 className="font-orbitron font-bold text-base sm:text-lg text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Active Machine Yields Breakdown ({activeRentals.length})</span>
        </h3>

        {activeRentals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#040813] border border-slate-800 text-slate-400 text-xs font-mono">
            <span>No active machines producing yields right now. Rent a machine from the marketplace to begin streaming returns.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRentals.map(rental => (
              <div
                key={rental.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#050a14] border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <CpuVisual tier={rental.machineTier} size="sm" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-orbitron font-bold text-sm text-white">
                        {rental.machineName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                        rental.isWorkingToday !== false
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}>
                        {rental.isWorkingToday !== false ? '● Active Today (12 PM Update)' : '⏸ Weekend Pause (Sat & Sun Off)'}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                      Schedule: <strong className="text-white">{rental.workingDaysSchedule || 'Monday – Friday (5 Days / Wk)'}</strong> • Output: UGX {(rental.dailyEstimatedYieldUGX ?? 0).toLocaleString()}/day
                    </p>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-1 flex-wrap">
                      <span>Total Earned: <strong className="text-emerald-400">UGX {(rental.accumulatedEarningsUGX ?? 0).toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Unclaimed: <strong className="text-amber-400">UGX {(rental.unclaimedEarningsUGX ?? 0).toLocaleString()}</strong></span>
                      <span>•</span>
                      <span className="text-slate-500">Auto Payout: 12:00 PM Daily</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right font-mono text-xs hidden sm:block">
                    <span className="text-[10px] text-slate-500 block uppercase">Ready to Claim</span>
                    <strong className="text-amber-400 font-orbitron font-bold">
                      UGX {(rental.unclaimedEarningsUGX ?? 0).toLocaleString()}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleClaimSingle(rental.id, rental.unclaimedEarningsUGX)}
                    disabled={claiming || rental.unclaimedEarningsUGX <= 0}
                    className="px-4 py-2 rounded-xl font-orbitron font-bold text-xs uppercase text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-40 transition"
                  >
                    Claim Single
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Disclaimer & Transparency */}
      <div className="p-6 rounded-3xl bg-[#060c18] border border-cyan-500/20 text-xs font-mono text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-orbitron font-bold text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Financial Policy & Transparency Notice</span>
        </div>
        <p className="leading-relaxed">
          FUTURE TECH computes real network returns without simulated or fabricated financial values. All output yields are generated through dedicated server leasing and can be withdrawn directly via MTN Mobile Money (*165#) and Airtel Money (*185#). Projections are estimates and fluctuate based on computational network difficulty.
        </p>
      </div>

    </div>
  );
};
