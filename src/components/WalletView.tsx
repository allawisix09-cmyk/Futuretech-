import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction, DepositRecord } from '../types';
import { api } from '../services/api';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Copy,
  Check,
  Search,
  Receipt,
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletViewProps {
  user: User;
  transactions: Transaction[];
  onDeposit: (data: { amount: number; tid: string; screenshotUrl?: string; method?: string; phone?: string }) => Promise<void>;
  onWithdraw: (amount: number, method: string, phone?: string, name?: string) => Promise<void>;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  transactions,
  onDeposit,
  onWithdraw
}) => {
  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'transactions'>('deposits');

  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Deposits state
  const [myDeposits, setMyDeposits] = useState<DepositRecord[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Deposit Form
  const [depAmount, setDepAmount] = useState<number>(30000);
  const [depTid, setDepTid] = useState<string>('');
  const [depMethod, setDepMethod] = useState<string>('mtn_mobile_money');
  const [depPhone, setDepPhone] = useState<string>(user.phoneNumber || '+256');
  const [depScreenshot, setDepScreenshot] = useState<string>('');
  const [depLoading, setDepLoading] = useState(false);
  const [depError, setDepError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Withdraw Form
  const [withAmount, setWithAmount] = useState<number>(50000);
  const [withMethod, setWithMethod] = useState<string>('mtn_mobile_money');
  const [withPhone, setWithPhone] = useState<string>(user.phoneNumber || '+256772123456');
  const [withName, setWithName] = useState<string>(user.username);
  const [withLoading, setWithLoading] = useState(false);
  const [withError, setWithError] = useState<string | null>(null);

  // Filter state
  const [txFilter, setTxFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const withdrawalFeePercent = 15;
  const withdrawalFee = Math.round(withAmount * (withdrawalFeePercent / 100)); // 15% platform deduction
  const netWithdrawal = Math.max(0, withAmount - withdrawalFee);

  // Load user deposits
  const loadDeposits = async () => {
    setLoadingDeposits(true);
    try {
      const res = await api.getMyDeposits();
      setMyDeposits(res.deposits || []);
    } catch (err) {
      console.error('Failed to load user deposits:', err);
    } finally {
      setLoadingDeposits(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setDepError('Screenshot must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDepScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepError(null);

    const trimmedTid = depTid.trim();
    if (!trimmedTid) {
      setDepError('Transaction ID (TID) is strictly required.');
      return;
    }

    if (depAmount < 10000) {
      setDepError('Minimum deposit is UGX 10,000.');
      return;
    }

    setDepLoading(true);
    try {
      await onDeposit({
        amount: depAmount,
        tid: trimmedTid,
        screenshotUrl: depScreenshot || undefined,
        method: depMethod,
        phone: depPhone
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmissionFeedback(
        `Deposit request for UGX ${(depAmount ?? 0).toLocaleString()} (TID: ${trimmedTid}) submitted successfully! Your submission is now PENDING administrative review and verification.`
      );
      setShowDepositModal(false);
      setDepTid('');
      setDepScreenshot('');
      await loadDeposits();
    } catch (err: any) {
      setDepError(err.message || 'Failed to submit deposit.');
    } finally {
      setDepLoading(false);
    }
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithError(null);
    if (withAmount < 20000) {
      setWithError('Minimum withdrawal is UGX 20,000.');
      return;
    }
    if (withAmount > user.walletBalanceUGX) {
      setWithError('Insufficient wallet balance for this withdrawal amount.');
      return;
    }
    setWithLoading(true);
    try {
      await onWithdraw(withAmount, withMethod, withPhone, withName);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      setShowWithdrawModal(false);
    } catch (err: any) {
      setWithError(err.message || 'Withdrawal processing failed.');
    } finally {
      setWithLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = txFilter === 'all' || tx.type === txFilter;
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.tid && tx.tid.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingDepositsCount = myDeposits.filter(d => d.status === 'PENDING').length;

  return (
    <div id="wallet-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">
      
      {/* Header & Balances */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#091b3b] to-[#071124] border border-cyan-500/40 glow-border-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>Secure Verified Mobile-Money Vault</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white">
            Wallet & Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1">
            Deposit via mobile money, track TID approval status, and use wallet balances to purchase computing clusters.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="wallet-deposit-action-btn"
            onClick={() => setShowDepositModal(true)}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,180,255,0.4)]"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Make Deposit</span>
          </button>
          <button
            id="wallet-withdraw-action-btn"
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider text-slate-200 hover:text-white bg-[#060c18] border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center gap-2 transition"
          >
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/60 flex items-start justify-between gap-3 text-amber-200 text-xs font-mono">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="font-bold text-amber-300 block font-orbitron text-xs">
                DEPOSIT PENDING ADMINISTRATIVE VERIFICATION
              </strong>
              <p className="mt-0.5 leading-relaxed">{submissionFeedback}</p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionFeedback(null)}
            className="text-amber-400 hover:text-white font-bold px-2 py-0.5 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Available Wallet Balance */}
        <div className="p-5 rounded-2xl bg-[#081224] border border-cyan-500/30 font-mono">
          <span className="text-[10px] uppercase text-slate-400 font-bold">Verified Wallet Balance</span>
          <div className="text-2xl sm:text-3xl font-orbitron font-black text-cyan-400 mt-1">
            UGX {(user.walletBalanceUGX ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Available to purchase machines</span>
        </div>

        {/* Pending Deposits */}
        <div className="p-5 rounded-2xl bg-[#081224] border border-amber-500/30 font-mono">
          <span className="text-[10px] uppercase text-amber-400 font-bold">Pending Verification</span>
          <div className="text-2xl sm:text-3xl font-orbitron font-black text-amber-300 mt-1">
            {pendingDepositsCount}
          </div>
          <span className="text-[10px] text-slate-400">
            {pendingDepositsCount > 0 ? 'Under review by admin' : 'No deposits currently pending'}
          </span>
        </div>

        {/* Total Deposited */}
        <div className="p-5 rounded-2xl bg-[#081224] border border-emerald-500/30 font-mono">
          <span className="text-[10px] uppercase text-emerald-400 font-bold">Total Approved Deposits</span>
          <div className="text-2xl sm:text-3xl font-orbitron font-black text-emerald-300 mt-1">
            UGX {(user.totalDepositedUGX ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Credited directly to node vault</span>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-[#081224] border border-purple-500/30 font-mono">
          <span className="text-[10px] uppercase text-purple-400 font-bold">Total Withdrawn</span>
          <div className="text-2xl sm:text-3xl font-orbitron font-black text-purple-300 mt-1">
            UGX {(user.totalWithdrawnUGX ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Settled to mobile money</span>
        </div>

      </div>

      {/* Official Payment Instruction Card (Always Visible For Ease of Use) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0a1835] via-[#081329] to-[#050d1a] border border-amber-500/40 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base text-white">
                Official Future Tech Deposit Payment Instructions
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Send your payment to our official verified recipient, then submit your TID below.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase self-start sm:self-auto">
            MTN & AIRTEL UGANDA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          
          {/* Payment Number Card */}
          <div className="p-4 rounded-2xl bg-[#040814] border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Payment Number:</span>
              <span className="text-lg sm:text-xl font-orbitron font-bold text-amber-300 select-all">
                0795829784
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('0795829784', 'number')}
              className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-1.5 transition font-orbitron font-bold"
            >
              {copiedField === 'number' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Registered Name Card */}
          <div className="p-4 rounded-2xl bg-[#040814] border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Registered Name:</span>
              <span className="text-base sm:text-lg font-orbitron font-bold text-white select-all">
                JAMADAH SSEMOGERERE
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('JAMADAH SSEMOGERERE', 'name')}
              className="px-3 py-1.5 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-xs flex items-center gap-1.5 transition font-orbitron font-bold"
            >
              {copiedField === 'name' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Step-by-step guideline */}
        <div className="p-4 rounded-2xl bg-[#040814]/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs font-orbitron">
            <Info className="w-3.5 h-3.5" />
            <span>How to Deposit in 3 Simple Steps:</span>
          </div>
          <p className="text-slate-400">
            1. Open MTN Mobile Money (<strong>*165#</strong>) or Airtel Money (<strong>*185#</strong>) on your phone.
          </p>
          <p className="text-slate-400">
            2. Send your deposit amount to <strong>0795829784</strong> (Confirm recipient name is <strong>JAMADAH SSEMOGERERE</strong>).
          </p>
          <p className="text-slate-400">
            3. Copy the <strong>TID (Transaction ID)</strong> from your SMS receipt and click <strong className="text-cyan-300 cursor-pointer underline" onClick={() => setShowDepositModal(true)}>Submit Deposit</strong> to submit your TID.
          </p>
          <div className="pt-2 text-[11px] text-amber-400/90 border-t border-slate-800">
            ⚠️ <strong>Verification Notice:</strong> Wallets are NOT automatically credited simply by submitting a TID. All submissions are verified against telecom carrier statements by our administrators before your wallet is credited.
          </div>
        </div>
      </div>

      {/* Main Content Tabs: Deposit Submissions Tracker vs. Wallet Transaction History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-6">
        
        {/* Navigation Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('deposits')}
              className={`px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase transition flex items-center gap-2 ${
                activeSubTab === 'deposits'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                  : 'bg-[#040813] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Deposit Submissions ({myDeposits.length})</span>
              {pendingDepositsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-black animate-pulse">
                  {pendingDepositsCount} PENDING
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase transition flex items-center gap-2 ${
                activeSubTab === 'transactions'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                  : 'bg-[#040813] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Full Transaction Ledger ({transactions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'deposits' && (
              <button
                onClick={loadDeposits}
                disabled={loadingDeposits}
                className="p-2 rounded-xl bg-[#040813] border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
                title="Refresh Deposit Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDeposits ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,180,27,0.3)]"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ Submit New TID</span>
            </button>
          </div>
        </div>

        {/* SUBTAB 1: DEPOSITS SUBMISSIONS TRACKER */}
        {activeSubTab === 'deposits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Track the verification and approval progress of your mobile money deposits.</span>
              <span className="text-cyan-400 font-bold">{myDeposits.length} Records</span>
            </div>

            {loadingDeposits ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs animate-pulse">
                Fetching latest deposit verification statuses...
              </div>
            ) : myDeposits.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#040813] border border-dashed border-slate-800 space-y-3 font-mono">
                <p className="text-slate-400 text-xs">You have not submitted any deposit TIDs yet.</p>
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-orbitron font-bold text-xs uppercase"
                >
                  Submit Your First Deposit
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-cyan-900/50 text-slate-400">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">TID Number</th>
                      <th className="py-3 px-4">Channel / Method</th>
                      <th className="py-3 px-4 text-right">Amount (UGX)</th>
                      <th className="py-3 px-4 text-center">Screenshot</th>
                      <th className="py-3 px-4 text-center">Verification Status</th>
                      <th className="py-3 px-4 text-slate-400">Admin Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {myDeposits.map(dep => {
                      const isPending = dep.status === 'PENDING';
                      const isApproved = dep.status === 'APPROVED';
                      const isRejected = dep.status === 'REJECTED';

                      return (
                        <tr key={dep.id} className="hover:bg-cyan-950/20 transition">
                          <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                            <div>{new Date(dep.createdAt).toLocaleDateString()}</div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-amber-300 font-mono tracking-wide text-xs">
                              {dep.tid}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-300">
                            {dep.paymentMethod ? dep.paymentMethod.replace('_', ' ') : 'Mobile Money'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-orbitron font-bold text-white text-sm">
                            UGX {(dep.amountUGX ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {dep.screenshotUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewScreenshot(dep.screenshotUrl!)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10px] inline-flex items-center gap-1 transition"
                                title="View payment receipt image"
                              >
                                <ImageIcon className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase inline-flex items-center gap-1.5 ${
                                isApproved
                                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                  : isPending
                                  ? 'bg-amber-950 border border-amber-500/50 text-amber-300 animate-pulse shadow-[0_0_10px_rgba(245,180,27,0.2)]'
                                  : 'bg-rose-950 border border-rose-500/50 text-rose-300'
                              }`}
                            >
                              {isApproved && <CheckCircle2 className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isRejected && <AlertTriangle className="w-3 h-3" />}
                              <span>{dep.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px]">
                            {isApproved && (
                              <span className="text-emerald-400">
                                Verified by admin • UGX {(dep.amountUGX ?? 0).toLocaleString()} credited
                              </span>
                            )}
                            {isPending && (
                              <span className="text-amber-400/80">
                                Awaiting admin verification against carrier logs
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-rose-400 font-semibold">
                                {dep.rejectionReason || 'Invalid or duplicate TID provided.'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: FULL TRANSACTIONS LEDGER */}
        {activeSubTab === 'transactions' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-[#040813] p-1 rounded-xl border border-slate-800 text-[11px] font-mono overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'deposit', label: 'Deposits' },
                  { id: 'machine_purchase', label: 'Purchases' },
                  { id: 'withdrawal', label: 'Withdrawals' },
                  { id: 'machine_earnings', label: 'Earnings' },
                  { id: 'referral_bonus', label: 'Referrals' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setTxFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                      txFilter === f.id
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search reference, TID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#040813] border border-dashed border-slate-800 text-slate-400 text-xs font-mono">
                No transactions matching the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-cyan-900/50 text-slate-400">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Channel / Details</th>
                      <th className="py-3 px-4 text-right">Amount (UGX)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTransactions.map(tx => {
                      const isPositive = ['deposit', 'machine_earnings', 'referral_bonus'].includes(tx.type);

                      return (
                        <tr key={tx.id} className="hover:bg-cyan-950/20 transition">
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white uppercase text-[10px]">
                            {tx.type.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 text-cyan-300 font-mono text-[11px]">
                            <div>{tx.reference}</div>
                            {tx.tid && (
                              <span className="text-[9px] text-amber-300">TID: {tx.tid}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-[11px] capitalize">
                            {tx.description || (tx.method ? tx.method.replace('_', ' ') : 'System')}
                          </td>
                          <td className={`py-3 px-4 text-right font-orbitron font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : '-'}UGX {(tx.amountUGX ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                tx.status === 'completed'
                                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                                  : tx.status === 'pending'
                                  ? 'bg-amber-950 border border-amber-500/40 text-amber-300'
                                  : 'bg-rose-950 border border-rose-500/40 text-rose-300'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition"
                              title="View Digital Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </div>

      {/* DEPOSIT MODAL (WITH TID SUBMISSION & PAYMENT DETAILS) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-lg w-full rounded-3xl bg-[#091428] border border-cyan-500/50 shadow-2xl p-6 sm:p-8 text-white space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setShowDepositModal(false);
                setDepError(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#040813] border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-amber-400" />
                <h3 className="font-orbitron font-bold text-lg text-white">Deposit via Mobile Money</h3>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">
                Send your deposit to the official number below, then submit your TID for admin verification.
              </p>
            </div>

            {/* Official Payment Destination Card */}
            <div className="p-4 rounded-2xl bg-[#050b17] border border-amber-500/40 font-mono space-y-3">
              <div className="text-[11px] text-amber-300 font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Future Tech Payment Recipient</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Payment Number:</span>
                  <div className="flex items-center justify-between mt-1">
                    <strong className="text-base font-orbitron text-amber-300 select-all">0795829784</strong>
                    <button
                      type="button"
                      onClick={() => handleCopy('0795829784', 'modal_num')}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Number"
                    >
                      {copiedField === 'modal_num' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Registered Name:</span>
                  <div className="flex items-center justify-between mt-1">
                    <strong className="text-xs font-orbitron text-white select-all">JAMADAH SSEMOGERERE</strong>
                    <button
                      type="button"
                      onClick={() => handleCopy('JAMADAH SSEMOGERERE', 'modal_name')}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Name"
                    >
                      {copiedField === 'modal_name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {depError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{depError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteDeposit} className="space-y-4">
              
              {/* Payment Gateway Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Select Carrier Used</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepMethod('mtn_mobile_money')}
                    className={`p-3 rounded-xl border text-left transition ${
                      depMethod === 'mtn_mobile_money'
                        ? 'bg-amber-950/60 border-amber-400 text-white'
                        : 'bg-[#040813] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-orbitron font-bold text-xs block text-amber-300">MTN MoMo</span>
                    <span className="text-[10px] font-mono text-slate-400">*165# Dial Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepMethod('airtel_money')}
                    className={`p-3 rounded-xl border text-left transition ${
                      depMethod === 'airtel_money'
                        ? 'bg-rose-950/60 border-rose-400 text-white'
                        : 'bg-[#040813] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-orbitron font-bold text-xs block text-rose-300">Airtel Money</span>
                    <span className="text-[10px] font-mono text-slate-400">*185# Dial Code</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Amount Paid (UGX) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  required
                  placeholder="e.g. 30000"
                  value={depAmount}
                  onChange={e => setDepAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border border-slate-700 focus:border-amber-400 text-white text-sm font-mono focus:outline-none"
                />
                
                {/* Quick amount presets */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[30000, 60000, 150000, 300000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepAmount(amt)}
                      className="px-2.5 py-1 rounded-lg bg-[#040813] border border-slate-700 hover:border-amber-400 text-[10px] font-mono text-amber-300 transition"
                    >
                      +{(amt ?? 0).toLocaleString()} UGX
                    </button>
                  ))}
                </div>
              </div>

              {/* TID / Transaction ID Input (REQUIRED) */}
              <div>
                <label className="block text-xs font-mono text-amber-300 font-bold mb-1">
                  TID / Transaction ID Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24892019482 (from telecom SMS)"
                  value={depTid}
                  onChange={e => setDepTid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border-2 border-amber-500/70 focus:border-amber-400 text-white text-sm font-mono focus:outline-none uppercase tracking-wider"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Find this in your carrier confirmation SMS (e.g. "Trans ID: 24892019482").
                </span>
              </div>

              {/* Phone number used */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Your Sender Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={depPhone}
                  onChange={e => setDepPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Optional Payment Screenshot Upload */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Payment Screenshot <span className="text-slate-500">(Optional but recommended)</span>
                </label>

                {depScreenshot ? (
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 p-2 bg-[#040813] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={depScreenshot}
                        alt="Screenshot Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                      />
                      <span className="text-xs font-mono text-cyan-300">Screenshot Attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDepScreenshot('')}
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl bg-[#040813] border border-dashed border-slate-700 hover:border-cyan-400 cursor-pointer text-center space-y-1 transition"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <span className="text-xs font-mono text-slate-300 block">
                      Click to upload payment SMS receipt or screenshot
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">PNG, JPG, or JPEG up to 5MB</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Verification notice */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] font-mono text-amber-300/90 leading-relaxed">
                📌 <strong>Important:</strong> Your wallet will NOT be credited immediately. An administrator will verify the submitted TID against carrier statements before approving your funds.
              </div>

              <button
                type="submit"
                disabled={depLoading || !depTid.trim()}
                className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 transition shadow-[0_0_15px_rgba(245,180,27,0.3)]"
              >
                {depLoading ? 'Submitting TID for Review...' : `Submit Deposit (UGX ${(depAmount ?? 0).toLocaleString()})`}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-md w-full rounded-3xl bg-[#091224] border border-cyan-500/50 p-6 sm:p-8 text-white space-y-5">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#040813] border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-lg">Withdraw Funds</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Withdraw directly to your MTN or Airtel Mobile Money phone.
              </p>
            </div>

            {withError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300">
                {withError}
              </div>
            )}

            <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#040813] border border-cyan-500/30 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Available:</span>
                <strong className="text-cyan-300 font-orbitron">UGX {(user.walletBalanceUGX ?? 0).toLocaleString()}</strong>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithMethod('mtn_mobile_money')}
                    className={`p-3 rounded-xl border text-left transition ${
                      withMethod === 'mtn_mobile_money'
                        ? 'bg-amber-950/60 border-amber-400 text-white'
                        : 'bg-[#040813] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-orbitron font-bold text-xs block text-amber-300">MTN MoMo</span>
                    <span className="text-[10px] font-mono text-slate-400">Direct Payout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithMethod('airtel_money')}
                    className={`p-3 rounded-xl border text-left transition ${
                      withMethod === 'airtel_money'
                        ? 'bg-rose-950/60 border-rose-400 text-white'
                        : 'bg-[#040813] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-orbitron font-bold text-xs block text-rose-300">Airtel Money</span>
                    <span className="text-[10px] font-mono text-slate-400">Direct Payout</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
                  <span>Withdrawal Amount (UGX)</span>
                  <span className="text-[10px] text-cyan-400">Min: UGX 20,000</span>
                </div>
                <input
                  type="number"
                  step="5000"
                  min="20000"
                  max={user.walletBalanceUGX}
                  required
                  value={withAmount}
                  onChange={e => setWithAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border border-slate-700 focus:border-cyan-400 text-white text-base font-orbitron font-bold focus:outline-none"
                />

                {/* Quick amount presets */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[20000, 50000, 100000].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWithAmount(preset)}
                      className={`py-1 rounded-lg text-[10px] font-mono border transition ${
                        withAmount === preset
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-[#040813] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithAmount(user.walletBalanceUGX || 0)}
                    className={`py-1 rounded-lg text-[10px] font-mono border transition ${
                      withAmount === user.walletBalanceUGX
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-[#040813] border-slate-800 text-amber-400/80 hover:text-amber-300'
                    }`}
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Dynamic 15% Deduction & Amount to be Received Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#061226] to-[#040916] border border-cyan-500/40 space-y-2 shadow-inner">
                <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                  <span>Requested Withdrawal:</span>
                  <span className="text-white font-bold font-orbitron">UGX {(withAmount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-rose-400">
                  <span className="flex items-center gap-1">
                    <span>15% Platform Deduction:</span>
                  </span>
                  <span className="font-bold font-mono">- UGX {(withdrawalFee ?? 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-300 block">Amount to be Received:</span>
                    <span className="text-[10px] font-mono text-slate-400">Direct to registered Mobile Money</span>
                  </div>
                  <span className="text-base font-orbitron font-black text-emerald-400">
                    UGX {(netWithdrawal ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Recipient Phone Number</label>
                <input
                  type="tel"
                  required
                  value={withPhone}
                  onChange={e => setWithPhone(e.target.value)}
                  placeholder="+256770000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={withLoading || withAmount > user.walletBalanceUGX || withAmount < 20000}
                className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary disabled:opacity-50"
              >
                {withLoading
                  ? 'Processing Settlement...'
                  : `Confirm Withdraw (Receive UGX ${(netWithdrawal ?? 0).toLocaleString()})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-xl w-full rounded-2xl bg-[#081224] border border-cyan-500/50 p-4 space-y-3 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-orbitron font-bold text-xs text-cyan-300">Deposit Proof of Payment</span>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="p-1 rounded-lg bg-[#040813] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-800 flex justify-center bg-black">
              <img
                src={previewScreenshot}
                alt="Receipt screenshot"
                className="max-h-[68vh] object-contain rounded-lg"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-orbitron font-bold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-sm w-full rounded-3xl bg-[#091224] border border-cyan-500/50 p-6 text-white space-y-4 font-mono text-xs">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#040813] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-3 border-b border-cyan-900/40">
              <span className="text-cyan-400 font-orbitron font-bold text-sm block">FUTURE TECH</span>
              <span className="text-[10px] text-slate-500">Official Cryptographic Transaction Receipt</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="text-white font-bold">{selectedTx.reference}</span>
              </div>
              {selectedTx.tid && (
                <div className="flex justify-between">
                  <span className="text-slate-500">TID:</span>
                  <span className="text-amber-300 font-bold">{selectedTx.tid}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-white capitalize">{selectedTx.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="text-emerald-400 font-bold font-orbitron text-sm">UGX {(selectedTx.amountUGX ?? 0).toLocaleString()}</span>
              </div>
              {selectedTx.balanceBefore !== undefined && selectedTx.balanceAfter !== undefined && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>Balance Before:</span>
                    <span>UGX {(selectedTx.balanceBefore ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-cyan-300">
                    <span>Balance After:</span>
                    <span>UGX {(selectedTx.balanceAfter ?? 0).toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 uppercase font-bold">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-300">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-orbitron font-bold text-xs uppercase mt-2"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
