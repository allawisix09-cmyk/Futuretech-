import React, { useState } from 'react';
import { Machine, User } from '../types';
import { CpuVisual } from './CpuVisual';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Smartphone,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MachineDetailModalProps {
  machine: Machine | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRent: (machineId: string, paymentMethod: 'wallet' | 'mobile_money', phone?: string) => Promise<void>;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  machine,
  user,
  isOpen,
  onClose,
  onConfirmRent,
  onOpenAuth,
  onOpenDeposit
}) => {
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mobile_money'>('wallet');
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState(user?.phoneNumber || '+256');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !machine) return null;

  const hasEnoughWalletBalance = user ? user.walletBalanceUGX >= machine.rentalPriceUGX : false;

  const handleProceedToConfirm = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setStep('confirm');
    setError(null);
  };

  const handleExecuteRental = async () => {
    setError(null);
    setLoading(true);

    try {
      await onConfirmRent(
        machine.id,
        paymentMethod,
        paymentMethod === 'mobile_money' ? mobileMoneyPhone : undefined
      );

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      onClose();
      setStep('details');
    } catch (err: any) {
      setError(err.message || 'Failed to complete machine rental.');
    } finally {
      setLoading(false);
    }
  };

  const isGold = machine.tier === 'gold';
  const isSilver = machine.tier === 'silver';
  const badgeColor = isGold
    ? 'bg-amber-400 text-black'
    : isSilver
    ? 'bg-slate-200 text-black'
    : 'bg-blue-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#081224] border border-cyan-500/50 glow-border-cyan shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            setStep('details');
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#040813] border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-400 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'details' ? (
          /* STEP 1: COMPREHENSIVE MACHINE DETAILS & SPECS */
          <div className="space-y-6">
            
            {/* Header with Visual & Title */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-cyan-900/40">
              <CpuVisual tier={machine.tier} size="md" />
              <div className="text-center sm:text-left space-y-1">
                <span className={`px-3 py-0.5 rounded-full font-orbitron font-extrabold text-[10px] uppercase inline-block ${badgeColor}`}>
                  {machine.badge}
                </span>
                <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white">
                  {machine.name}
                </h3>
                <p className="text-xs font-mono text-cyan-400">
                  {machine.computingPower} • {machine.durationDays} Days Dedicated Lease
                </p>
                <p className="text-xs text-slate-300 font-normal leading-relaxed pt-1">
                  {machine.description}
                </p>
              </div>
            </div>

            {/* Price & Output Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-2xl bg-[#050a14] border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Rental Cost</span>
                <strong className="text-sm font-orbitron font-bold text-white mt-1 block">
                  UGX {(machine.rentalPriceUGX ?? 0).toLocaleString()}
                </strong>
                <span className="text-[9px] text-slate-400">(${machine.rentalPriceUSD ?? 0} USD)</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#050a14] border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block uppercase">Est. Daily Output</span>
                <strong className="text-sm font-orbitron font-bold text-emerald-300 mt-1 block">
                  UGX {(machine.dailyEstimatedYieldUGX ?? 0).toLocaleString()}
                </strong>
                <span className="text-[9px] text-emerald-500">~{machine.dailyEstimatedYieldPercent ?? 0}% / day</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#050a14] border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 block uppercase">Est. Total Return</span>
                <strong className="text-sm font-orbitron font-bold text-cyan-300 mt-1 block">
                  UGX {(machine.totalEstimatedYieldUGX ?? 0).toLocaleString()}
                </strong>
                <span className="text-[9px] text-cyan-400">+{machine.totalEstimatedYieldPercent ?? 0}% total</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#050a14] border border-amber-500/30">
                <span className="text-[10px] text-amber-400 block uppercase">Availability</span>
                <strong className="text-sm font-orbitron font-bold text-amber-300 mt-1 block">
                  {machine.availableUnits ?? 0} / {machine.totalUnits ?? 0}
                </strong>
                <span className="text-[9px] text-slate-400">Stock remaining</span>
              </div>
            </div>

            {/* Hardware Specifications Table */}
            <div>
              <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Technical Hardware Specifications</span>
              </h4>
              <div className="rounded-2xl bg-[#050a14] border border-slate-800 p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Working Days Schedule:</span>
                  <span className="text-cyan-400 font-bold">
                    {machine.workingDaysSchedule || 'Monday – Friday (5 Days/Week)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Weekend Status:</span>
                  <span className="text-amber-300 font-semibold">{machine.weekendStatus || 'Offline on Saturday & Sunday'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Daily Payout Milestone:</span>
                  <span className="text-emerald-400 font-semibold">Automatic at 12:00 PM (Mon–Fri)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Processor Cores:</span>
                  <span className="text-slate-200 font-semibold">{machine.specifications.cores}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Silicon Architecture:</span>
                  <span className="text-slate-200 font-semibold">{machine.specifications.architecture}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Cache / Memory:</span>
                  <span className="text-slate-200 font-semibold">{machine.specifications.memory}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Power Consumption:</span>
                  <span className="text-slate-200 font-semibold">{machine.specifications.powerConsumption}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Cooling Matrix:</span>
                  <span className="text-slate-200 font-semibold">{machine.specifications.cooling}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Uptime SLA:</span>
                  <span className="text-emerald-400 font-semibold">{machine.specifications.uptimeGuarantee}</span>
                </div>
              </div>
            </div>

            {/* Terms & Estimated Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-amber-400 font-semibold font-orbitron text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Financial Transparency Notice</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All daily yields displayed are transparent <strong className="text-white">Estimates / Projections</strong> based on current algorithmic hash difficulty and network workload. Earnings are calculated hourly and are not guaranteed fixed interest.
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2">
              {user ? (
                <button
                  id="proceed-rent-btn"
                  onClick={handleProceedToConfirm}
                  className="w-full py-4 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,180,255,0.4)]"
                >
                  <span>Proceed to Rent {machine.tier.toUpperCase()} CPU</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-4 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2"
                >
                  <span>Login / Register to Rent Machine</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : (
          /* STEP 2: PURCHASE CONFIRMATION SCREEN */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Confirm Machine Purchase
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-orbitron font-extrabold text-[10px] uppercase ${badgeColor}`}>
                {machine.badge}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-300 font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Purchase Confirmation Summary */}
            <div className="p-5 rounded-2xl bg-[#050a14] border border-cyan-500/40 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
                <span className="text-slate-400">Machine:</span>
                <strong className="text-white text-sm font-orbitron">{machine.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
                <span className="text-slate-400">Price:</span>
                <strong className="text-amber-300 text-sm font-orbitron">UGX {(machine.rentalPriceUGX ?? 0).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
                <span className="text-slate-400">Wallet Balance:</span>
                <strong className={`text-sm font-orbitron ${hasEnoughWalletBalance ? 'text-cyan-400' : 'text-rose-400'}`}>
                  UGX {(user?.walletBalanceUGX ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
                <span className="text-slate-400">Available Units:</span>
                <strong className="text-slate-200">{machine.availableUnits ?? 0} units available</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Balance After Purchase:</span>
                <strong className="text-emerald-400 font-orbitron">
                  {hasEnoughWalletBalance
                    ? `UGX ${((user?.walletBalanceUGX ?? 0) - (machine.rentalPriceUGX ?? 0)).toLocaleString()}`
                    : 'Insufficient Funds'}
                </strong>
              </div>
            </div>

            {/* Insufficient Balance Notice */}
            {!hasEnoughWalletBalance && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <strong className="font-bold">Insufficient wallet balance. Please make a deposit first.</strong>
                </div>
                <p className="text-slate-300 text-[11px]">
                  You need an additional <strong className="text-amber-300 font-orbitron">UGX {Math.max(0, (machine.rentalPriceUGX ?? 0) - (user?.walletBalanceUGX ?? 0)).toLocaleString()}</strong> in your wallet to purchase this machine.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase transition shadow-[0_0_15px_rgba(245,180,27,0.3)]"
                >
                  Deposit Funds Now →
                </button>
              </div>
            )}

            {/* Confirm & Cancel Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setError(null);
                }}
                className="w-1/3 py-3 rounded-xl bg-[#050a14] border border-slate-700 text-slate-300 hover:text-white font-orbitron font-bold text-xs uppercase"
              >
                Cancel
              </button>

              <button
                type="button"
                id="confirm-purchase-btn"
                disabled={loading || !hasEnoughWalletBalance || (machine.availableUnits ?? 0) <= 0}
                onClick={handleExecuteRental}
                className="w-2/3 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,180,255,0.4)] disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing Purchase...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Confirm Purchase</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
