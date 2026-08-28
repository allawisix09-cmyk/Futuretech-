import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  AdminOverviewStats,
  Transaction,
  User,
  Machine,
  MachineRental,
  ReferralRecord,
  PlatformSettings,
  MachineTier,
  DepositRecord,
  MachinePurchaseRecord
} from '../types';
import { FutureTechLogo } from './FutureTechLogo';
import { CpuVisual } from './CpuVisual';
import {
  ShieldAlert,
  Users,
  Cpu,
  Wallet,
  Activity,
  CheckCircle2,
  XCircle,
  Bell,
  Send,
  Search,
  Lock,
  RefreshCw,
  Server,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  Sliders,
  LogOut,
  Layers,
  FileText,
  Share2,
  ExternalLink,
  Save,
  Check,
  Eye,
  Zap,
  Image as ImageIcon,
  Copy,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToUserView: () => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToUserView,
  onLogoutAdmin
}) => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminMachines, setAdminMachines] = useState<Machine[]>([]);
  const [adminRentals, setAdminRentals] = useState<any[]>([]);
  const [adminTxs, setAdminTxs] = useState<Transaction[]>([]);
  const [adminReferrals, setAdminReferrals] = useState<ReferralRecord[]>([]);
  const [adminDeposits, setAdminDeposits] = useState<DepositRecord[]>([]);
  const [adminPurchases, setAdminPurchases] = useState<MachinePurchaseRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    websiteName: 'FUTURE TECH',
    contactEmail: 'futurettech01@gmail.com',
    contactPhone: '+256772123456',
    telegramSupport: '@futuretech_ops',
    announcementBanner: '🚀 Cloud Compute Cluster V4.2 active. Automated 12:00 PM yields online.',
    isAnnouncementActive: true,
    maintenanceMode: false,
    minDepositUGX: 10000,
    minWithdrawalUGX: 20000,
    withdrawalFeePercent: 2,
    referralCommissionPercent: 5,
    disclaimerNotice: 'Notice: Computational machine yields are performance estimates based on network hash difficulty and are not guaranteed income. Past performance does not guarantee future results.'
  });

  const [activeTab, setActiveTab] = useState<
    'overview' | 'deposits' | 'purchases' | 'users' | 'machines' | 'rentals' | 'transactions' | 'referrals' | 'audit' | 'settings' | 'broadcast'
  >('overview');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Deposit Management state
  const [depositStatusFilter, setDepositStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [depositSearch, setDepositSearch] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [rejectingDepositId, setRejectingDepositId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [copiedDepositTid, setCopiedDepositTid] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Purchase Management state
  const [purchaseSearch, setPurchaseSearch] = useState('');

  // Filters & Searches
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [rentalStatusFilter, setRentalStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('system');

  // Machine Modal state (Add / Edit)
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [machineForm, setMachineForm] = useState<Partial<Machine>>({
    tier: 'normal',
    name: '',
    tagline: '',
    description: '',
    rentalPriceUGX: 50000,
    durationDays: 30,
    dailyEstimatedYieldUGX: 3000,
    hashRate: 100,
    computingPower: '100 TH/s',
    isAvailable: true,
    availableUnits: 20,
    totalUnits: 50
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, machinesRes, rentalsRes, txsRes, referralsRes, auditRes, settingsRes, depositsRes, purchasesRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getMachines(),
        api.getAdminRentals(),
        api.getAdminTransactions(),
        api.getAdminReferrals(),
        api.getAuditLogs(),
        api.getAdminSettings(),
        api.getAdminDeposits(),
        api.getAdminPurchases()
      ]);
      setStats(overviewRes.stats);
      setAdminUsers(usersRes.users);
      setAdminMachines(machinesRes.machines);
      setAdminRentals(rentalsRes.rentals);
      setAdminTxs(txsRes.transactions);
      setAdminReferrals(referralsRes.referrals);
      setAuditLogs(auditRes.auditLogs);
      setAdminDeposits(depositsRes.deposits || []);
      setAdminPurchases(purchasesRes.purchases || []);
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Failed to load admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveDeposit = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await api.approveDeposit(id);
      setFeedback(`Deposit approved! Credited UGX ${(res.deposit.amountUGX ?? 0).toLocaleString()} to user wallet.`);
      await loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Deposit approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    setActionLoading(true);
    try {
      await api.rejectDeposit(id, rejectionReasonInput.trim() || 'Invalid or unverifiable TID');
      setFeedback('Deposit marked as REJECTED. Wallet remains unchanged.');
      setRejectingDepositId(null);
      setRejectionReasonInput('');
      await loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Deposit rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyTid = (tid: string) => {
    navigator.clipboard.writeText(tid);
    setCopiedDepositTid(tid);
    setTimeout(() => setCopiedDepositTid(null), 2000);
  };

  const handleToggleUser = async (id: string) => {
    try {
      await api.toggleUserStatus(id);
      setFeedback('User status successfully updated.');
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to toggle status');
    }
  };

  const handleApproveTx = async (id: string) => {
    try {
      await api.approveTransaction(id);
      setFeedback('Transaction successfully approved.');
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Approval failed');
    }
  };

  const handleUpdateRentalStatus = async (id: string, status: string) => {
    try {
      await api.updateRentalStatus(id, status);
      setFeedback(`Rental status updated to ${status}.`);
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update rental');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      await api.broadcastNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType
      });
      setFeedback('Notification dispatched across all network nodes!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Broadcast failed');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateAdminSettings(settings);
      setSettings(res.settings);
      setFeedback('Platform settings updated successfully.');
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update settings');
    }
  };

  const handleOpenAddMachine = () => {
    setEditingMachine(null);
    setMachineForm({
      tier: 'normal',
      name: 'Titan Core Standard Node',
      tagline: 'High-density algorithmic matrix computing node.',
      description: 'Standard compute cluster engineered for continuous tensor validation and rewards.',
      rentalPriceUGX: 35000,
      rentalPriceUSD: 10,
      durationDays: 30,
      dailyEstimatedYieldUGX: 2000,
      dailyEstimatedYieldPercent: 5.7,
      totalEstimatedYieldUGX: 60000,
      totalEstimatedYieldPercent: 171,
      hashRate: 75,
      computingPower: '75 TH/s',
      isAvailable: true,
      availableUnits: 25,
      totalUnits: 50,
      workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
      workingDaysPerWeek: 5,
      weekendStatus: 'Offline Sat & Sun',
      updateTime: 'Daily at 12:00 PM'
    });
    setShowMachineModal(true);
  };

  const handleOpenEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setMachineForm({ ...machine });
    setShowMachineModal(true);
  };

  const handleSaveMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await api.updateMachine(editingMachine.id, machineForm);
        setFeedback(`Machine "${machineForm.name}" updated successfully.`);
      } else {
        await api.createMachine(machineForm);
        setFeedback(`New machine "${machineForm.name}" created successfully.`);
      }
      setShowMachineModal(false);
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save machine');
    }
  };

  const handleDeleteMachine = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) {
      return;
    }
    try {
      await api.deleteMachine(id);
      setFeedback(`Machine "${name}" removed from catalog.`);
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete machine');
    }
  };

  const handleToggleMachineAvailability = async (machine: Machine) => {
    try {
      await api.updateMachine(machine.id, { isAvailable: !machine.isAvailable });
      setFeedback(`Machine "${machine.name}" is now ${!machine.isAvailable ? 'AVAILABLE' : 'DEACTIVATED'}.`);
      loadData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update machine status');
    }
  };

  return (
    <div id="admin-control-platform" className="min-h-screen bg-[#030712] text-white flex flex-col font-sans pb-24">
      
      {/* Top Root Bar */}
      <header className="sticky top-0 z-30 bg-[#050b18]/95 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FutureTechLogo size="sm" glow={true} />
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-700 pl-4">
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-orbitron font-extrabold text-[10px] uppercase tracking-wider">
              ADMIN PLATFORM
            </span>
            <span className="text-xs text-slate-400 font-mono">/admin/dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#081224] border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 transition"
            title="Refresh All Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={onBackToUserView}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-orbitron font-bold uppercase transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>User View</span>
          </button>

          <button
            onClick={onLogoutAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-orbitron font-bold uppercase transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Global Feedback Banner */}
        {feedback && (
          <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-xs text-amber-200 flex justify-between items-center font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-amber-400 hover:text-white font-bold text-sm px-2">×</button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 font-orbitron text-xs">
          {[
            { id: 'overview', label: 'Dashboard', icon: Activity },
            {
              id: 'deposits',
              label: `Deposits (${adminDeposits.length})`,
              icon: ArrowDownLeft,
              badge: adminDeposits.filter(d => d.status === 'PENDING').length
            },
            { id: 'purchases', label: `Purchases (${adminPurchases.length})`, icon: Zap },
            { id: 'users', label: `Users (${adminUsers.length})`, icon: Users },
            { id: 'machines', label: `Machines (${adminMachines.length})`, icon: Cpu },
            { id: 'rentals', label: `Rentals (${adminRentals.length})`, icon: Layers },
            { id: 'transactions', label: `Transactions (${adminTxs.length})`, icon: Wallet },
            { id: 'referrals', label: `Referrals (${adminReferrals.length})`, icon: Share2 },
            { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: FileText },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
            { id: 'broadcast', label: 'Broadcast', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl font-bold uppercase transition flex items-center gap-2 whitespace-nowrap relative ${
                  isActive
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,180,27,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400/80'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-mono font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Pending Deposit Callout Banner */}
            {adminDeposits.filter(d => d.status === 'PENDING').length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <strong className="font-orbitron font-bold text-sm text-amber-300">
                      ACTION REQUIRED: {adminDeposits.filter(d => d.status === 'PENDING').length} Pending Deposit Submission(s)
                    </strong>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      Users submitted mobile money transaction IDs (TIDs) awaiting verification against recipient 0795829784 (JAMADAH SSEMOGERERE).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('deposits')}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase transition whitespace-nowrap shadow-[0_0_15px_rgba(245,180,27,0.3)]"
                >
                  Review Deposits ({adminDeposits.filter(d => d.status === 'PENDING').length}) →
                </button>
              </div>
            )}
            
            {/* Top Stat Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="p-5 rounded-2xl bg-[#091224] border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 uppercase">Total Users</span>
                <div className="text-2xl font-orbitron font-black text-white mt-1">
                  {(stats?.totalUsersCount ?? stats?.totalUsers ?? adminUsers.length).toLocaleString()}
                </div>
                <span className="text-[10px] text-cyan-400">
                  {stats?.activeUsersCount ?? adminUsers.filter(u => u.status === 'active').length} active nodes
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#091224] border border-amber-500/30">
                <span className="text-[10px] text-slate-400 uppercase">Active Machines Rented</span>
                <div className="text-2xl font-orbitron font-black text-amber-300 mt-1">
                  {(stats?.activeRentalsCount ?? stats?.activeRentals ?? adminRentals.filter(r => r.status === 'active').length).toLocaleString()}
                </div>
                <span className="text-[10px] text-amber-400">
                  {stats?.totalHashRateTHs ?? stats?.totalHashRate ?? 0} TH/s network power
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#091224] border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 uppercase">Total Deposits / Revenue</span>
                <div className="text-xl font-orbitron font-black text-emerald-400 mt-1">
                  UGX {(stats?.totalDepositedUGX ?? 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">Inbound telecom & card volume</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#091224] border border-purple-500/30">
                <span className="text-[10px] text-slate-400 uppercase">Total Withdrawals Paid</span>
                <div className="text-xl font-orbitron font-black text-purple-300 mt-1">
                  UGX {(stats?.totalWithdrawnUGX ?? 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">Outbound telecom payouts</span>
              </div>
            </div>

            {/* Solvency & Liquidity Overview */}
            <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span>Platform Liquidity & Reserve Solvency</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">100% Fully Backed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Net Platform Reserve:</span>
                  <p className="text-xl font-orbitron font-bold text-cyan-300">
                    UGX {((stats?.totalDepositedUGX ?? 0) - (stats?.totalWithdrawnUGX ?? 0)).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Total Yields Distributed:</span>
                  <p className="text-xl font-orbitron font-bold text-emerald-400">
                    UGX {(stats?.totalEarningsPaidUGX ?? stats?.totalYieldsClaimedUGX ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
                  <span className="text-slate-400 block mb-1">Referral Rewards Dispatched:</span>
                  <p className="text-xl font-orbitron font-bold text-amber-400">
                    UGX {(stats?.totalReferralsRewardUGX ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 12:00 PM Automation System Status Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071329] via-[#091b3b] to-[#061226] border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-orbitron font-bold text-sm text-white">12:00 PM Automated Machine Payout Scheduler</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold">ACTIVE</span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Calculates exact cluster hash execution for working machines (Gold: 7 days, Silver: 6 days, Normal: 5 days). Automatically runs daily at 12:00 PM.
                </p>
              </div>

              <button
                onClick={async () => {
                  try {
                    const res = await api.trigger12PMDistribution();
                    setFeedback(res.message || '12:00 PM distribution executed.');
                    loadData();
                  } catch (e: any) {
                    setFeedback(e.message || 'Failed to trigger distribution');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-black text-xs uppercase tracking-wider transition shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Execute 12:00 PM Run Now
              </button>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Quick Jump Buttons */}
              <div className="p-6 rounded-3xl bg-[#081224] border border-slate-800 space-y-4">
                <h4 className="font-orbitron font-bold text-sm text-white">Direct Management Shortcuts</h4>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-3 rounded-xl bg-[#050a14] border border-slate-700 hover:border-cyan-400 text-left transition"
                  >
                    <Users className="w-4 h-4 text-cyan-400 mb-1" />
                    <div className="font-bold text-white">Manage Users</div>
                    <span className="text-[10px] text-slate-400">{adminUsers.length} registered accounts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('machines')}
                    className="p-3 rounded-xl bg-[#050a14] border border-slate-700 hover:border-amber-400 text-left transition"
                  >
                    <Cpu className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="font-bold text-white">Compute Catalog</div>
                    <span className="text-[10px] text-slate-400">{adminMachines.length} hardware tiers</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="p-3 rounded-xl bg-[#050a14] border border-slate-700 hover:border-emerald-400 text-left transition"
                  >
                    <Wallet className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="font-bold text-white">Transactions</div>
                    <span className="text-[10px] text-slate-400">{adminTxs.filter(t => t.status === 'pending').length} pending review</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-3 rounded-xl bg-[#050a14] border border-slate-700 hover:border-purple-400 text-left transition"
                  >
                    <SettingsIcon className="w-4 h-4 text-purple-400 mb-1" />
                    <div className="font-bold text-white">Site Settings</div>
                    <span className="text-[10px] text-slate-400">Announcements & Limits</span>
                  </button>
                </div>
              </div>

              {/* Recent Audit Actions */}
              <div className="p-6 rounded-3xl bg-[#081224] border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-orbitron font-bold text-sm text-white">Recent System Audit Events</h4>
                  <button onClick={() => setActiveTab('audit')} className="text-xs font-mono text-cyan-400 hover:underline">
                    View All →
                  </button>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {auditLogs.slice(0, 5).map((log: any) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-amber-400 font-bold uppercase text-[10px] mr-2">[{log.action}]</span>
                        <span className="text-slate-300 text-[11px]">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB: DEPOSITS VERIFICATION & APPROVAL */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            
            {/* Header & Instructions */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#091b3b] to-[#071124] border border-amber-500/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-300 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrative Financial Verification Center</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white">
                  User Deposit Submissions & TID Approvals
                </h2>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Recipient destination: <strong className="text-amber-300">0795829784</strong> (JAMADAH SSEMOGERERE). Verify carrier SMS before approving.
                </p>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-[#040813] border border-slate-700 hover:border-amber-400 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Metrics cards for deposits */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-[#081224] border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Pending Verification</span>
                <div className="text-2xl font-orbitron font-black text-amber-300 mt-1">
                  {adminDeposits.filter(d => d.status === 'PENDING').length}
                </div>
                <span className="text-[10px] text-slate-400">
                  UGX {adminDeposits.filter(d => d.status === 'PENDING').reduce((acc, d) => acc + (d.amountUGX || 0), 0).toLocaleString()} awaiting review
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#081224] border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Approved & Credited</span>
                <div className="text-2xl font-orbitron font-black text-emerald-300 mt-1">
                  {adminDeposits.filter(d => d.status === 'APPROVED').length}
                </div>
                <span className="text-[10px] text-slate-400">
                  UGX {adminDeposits.filter(d => d.status === 'APPROVED').reduce((acc, d) => acc + (d.amountUGX || 0), 0).toLocaleString()} credited
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#081224] border border-rose-500/30">
                <span className="text-[10px] text-rose-400 font-bold uppercase">Rejected Submissions</span>
                <div className="text-2xl font-orbitron font-black text-rose-300 mt-1">
                  {adminDeposits.filter(d => d.status === 'REJECTED').length}
                </div>
                <span className="text-[10px] text-slate-400">
                  Unverified / invalid TIDs
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#081224] border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">Total Submissions</span>
                <div className="text-2xl font-orbitron font-black text-cyan-300 mt-1">
                  {adminDeposits.length}
                </div>
                <span className="text-[10px] text-slate-400">
                  All recorded TID requests
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                
                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-[#040813] p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
                  {[
                    { id: 'all', label: 'All Deposits' },
                    { id: 'PENDING', label: `Pending (${adminDeposits.filter(d => d.status === 'PENDING').length})` },
                    { id: 'APPROVED', label: `Approved (${adminDeposits.filter(d => d.status === 'APPROVED').length})` },
                    { id: 'REJECTED', label: `Rejected (${adminDeposits.filter(d => d.status === 'REJECTED').length})` }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setDepositStatusFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                        depositStatusFilter === f.id
                          ? 'bg-amber-400 text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search TID, user ID, phone..."
                    value={depositSearch}
                    onChange={e => setDepositSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

              </div>

              {/* Deposits Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cyan-900/50 text-slate-400">
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">User & Contact</th>
                      <th className="py-3 px-3">TID Number</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3 text-right">Amount (UGX)</th>
                      <th className="py-3 px-3 text-center">Screenshot</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {adminDeposits
                      .filter(d => {
                        const matchesFilter = depositStatusFilter === 'all' || d.status === depositStatusFilter;
                        const matchesSearch =
                          (d.tid && d.tid.toLowerCase().includes(depositSearch.toLowerCase())) ||
                          (d.username && d.username.toLowerCase().includes(depositSearch.toLowerCase())) ||
                          (d.userId && d.userId.toLowerCase().includes(depositSearch.toLowerCase())) ||
                          (d.phoneNumber && d.phoneNumber.includes(depositSearch));
                        return matchesFilter && matchesSearch;
                      })
                      .map(dep => {
                        const isPending = dep.status === 'PENDING';
                        const isApproved = dep.status === 'APPROVED';
                        const isRejected = dep.status === 'REJECTED';

                        return (
                          <tr key={dep.id} className="hover:bg-cyan-950/20 transition">
                            <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                              <div>{new Date(dep.createdAt).toLocaleDateString()}</div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <strong className="text-white block font-orbitron">{dep.username || dep.userId.substring(0, 10)}</strong>
                              <span className="text-[10px] text-slate-400">{dep.phoneNumber || 'No phone'}</span>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-amber-300 font-mono tracking-wider text-xs">
                                  {dep.tid}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTid(dep.tid)}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                  title="Copy TID"
                                >
                                  {copiedDepositTid === dep.tid ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 capitalize text-slate-300">
                              {dep.paymentMethod ? dep.paymentMethod.replace('_', ' ') : 'Mobile Money'}
                            </td>

                            <td className="py-3.5 px-3 text-right font-orbitron font-bold text-white text-sm">
                              UGX {(dep.amountUGX ?? 0).toLocaleString()}
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              {dep.screenshotUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedScreenshot(dep.screenshotUrl!)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10px] inline-flex items-center gap-1 transition"
                                >
                                  <ImageIcon className="w-3 h-3" />
                                  <span>View</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-600">None</span>
                              )}
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase inline-flex items-center gap-1 ${
                                  isApproved
                                    ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                                    : isPending
                                    ? 'bg-amber-950 border border-amber-500/50 text-amber-300 animate-pulse'
                                    : 'bg-rose-950 border border-rose-500/50 text-rose-300'
                                }`}
                              >
                                {isApproved && <CheckCircle2 className="w-2.5 h-2.5" />}
                                {isPending && <Clock className="w-2.5 h-2.5" />}
                                {isRejected && <XCircle className="w-2.5 h-2.5" />}
                                <span>{dep.status}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              {isPending ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApproveDeposit(dep.id)}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-bold text-[10px] uppercase transition shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-50"
                                  >
                                    Approve & Credit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingDepositId(dep.id);
                                      setRejectionReasonInput('Unverified TID - not found in telecom statement');
                                    }}
                                    disabled={actionLoading}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-orbitron font-bold text-[10px] uppercase transition disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : isApproved ? (
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  Credited on {dep.approvedAt ? new Date(dep.approvedAt).toLocaleDateString() : 'Yes'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-400 font-mono" title={dep.rejectionReason}>
                                  {dep.rejectionReason || 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB: MACHINE PURCHASES AUDIT & ANALYTICS */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#07132a] via-[#081a38] to-[#040c1a] border border-cyan-500/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Hardware Sales Ledger</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white">
                  Machine Purchases & Hardware Cluster Sales
                </h2>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Track machine purchases made using user wallet balances. Balances are strictly validated and deducted on the backend.
                </p>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-[#040813] border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Sales Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-[#081224] border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">Total Purchases</span>
                <div className="text-2xl font-orbitron font-black text-white mt-1">
                  {adminPurchases.length}
                </div>
                <span className="text-[10px] text-slate-400">Node activations</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#081224] border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Total Machine Sales Revenue</span>
                <div className="text-2xl font-orbitron font-black text-emerald-300 mt-1">
                  UGX {adminPurchases.reduce((acc, p) => acc + (p.priceUGX || 0), 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">From wallet deductions</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#081224] border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold uppercase">🥇 Gold CPU Sold</span>
                <div className="text-2xl font-orbitron font-black text-amber-300 mt-1">
                  {adminPurchases.filter(p => p.machineTier === 'gold').length}
                </div>
                <span className="text-[10px] text-slate-400">UGX 150,000 / unit</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#081224] border border-slate-700">
                <span className="text-[10px] text-slate-300 font-bold uppercase">🥈 Silver & Normal Sold</span>
                <div className="text-2xl font-orbitron font-black text-slate-200 mt-1">
                  {adminPurchases.filter(p => p.machineTier === 'silver' || p.machineTier === 'normal').length}
                </div>
                <span className="text-[10px] text-slate-400">Clusters operating</span>
              </div>
            </div>

            {/* Purchases Table */}
            <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-orbitron font-bold text-base text-white">Machine Purchase Records</h3>
                  <p className="text-[11px] text-slate-400">Complete immutable record of user purchases and wallet changes.</p>
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search buyer, tier..."
                    value={purchaseSearch}
                    onChange={e => setPurchaseSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cyan-900/50 text-slate-400">
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Machine</th>
                      <th className="py-3 px-3">Buyer Username</th>
                      <th className="py-3 px-3 text-right">Price Paid (UGX)</th>
                      <th className="py-3 px-3 text-right">Wallet Before</th>
                      <th className="py-3 px-3 text-right">Wallet After</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {adminPurchases
                      .filter(p => {
                        const term = purchaseSearch.toLowerCase();
                        return (
                          (p.username && p.username.toLowerCase().includes(term)) ||
                          (p.machineName && p.machineName.toLowerCase().includes(term)) ||
                          (p.machineTier && p.machineTier.toLowerCase().includes(term))
                        );
                      })
                      .map(p => (
                        <tr key={p.id} className="hover:bg-cyan-950/20 transition">
                          <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                            <div>{new Date(p.purchasedAt).toLocaleDateString()}</div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(p.purchasedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <strong className="text-white font-orbitron block">{p.machineName}</strong>
                            <span className="text-[10px] text-cyan-400 uppercase">{p.machineTier} CPU Tier</span>
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {p.username || p.userId.substring(0, 10)}
                          </td>
                          <td className="py-3 px-3 text-right font-orbitron font-bold text-amber-300">
                            UGX {(p.priceUGX ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            UGX {(p.balanceBefore ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                            UGX {(p.balanceAfter ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">User Accounts Directory</h3>
                <p className="text-[11px] text-slate-400">Manage user accounts, balances, and permissions.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userStatusFilter}
                  onChange={e => setUserStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search user, phone, code..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cyan-900/50 text-slate-400">
                    <th className="py-3 px-3">Username & ID</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Special Code</th>
                    <th className="py-3 px-3">Balance (UGX)</th>
                    <th className="py-3 px-3">Rentals</th>
                    <th className="py-3 px-3">Registered</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminUsers
                    .filter(u => {
                      if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
                      const q = userSearch.toLowerCase();
                      return (
                        u.username.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.phoneNumber.toLowerCase().includes(q) ||
                        u.referralCode.toLowerCase().includes(q)
                      );
                    })
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{u.username}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{u.id}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <div>{u.email}</div>
                          <span className="text-[10px] text-cyan-300">{u.phoneNumber}</span>
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-bold">{u.referralCode}</td>
                        <td className="py-3 px-3 font-orbitron font-bold text-white">
                          UGX {(u.walletBalanceUGX ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {(u as any).activeRentalsCount ?? 0} active
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[10px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              u.status === 'active' ? 'text-emerald-300 bg-emerald-950 border border-emerald-500/40' : 'text-rose-300 bg-rose-950 border border-rose-500/40'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-orbitron font-bold transition ${
                              u.status === 'active'
                                ? 'bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900'
                                : 'bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MACHINES */}
        {activeTab === 'machines' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <span>Computing Machine Hardware Catalog</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Configure hardware specifications, rental prices, daily yields, and availability. Updates sync dynamically to user marketplace.
                </p>
              </div>

              <button
                onClick={handleOpenAddMachine}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,180,27,0.35)] transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Machine</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminMachines.map(machine => (
                <div
                  key={machine.id}
                  className={`p-6 rounded-3xl bg-[#081224] border transition flex flex-col justify-between ${
                    machine.isAvailable ? 'border-cyan-500/30' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                        {machine.tier.toUpperCase()} TIER
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${machine.isAvailable ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                        {machine.isAvailable ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <CpuVisual tier={machine.tier} size="sm" />
                      <div>
                        <h4 className="font-orbitron font-bold text-sm text-white">{machine.name}</h4>
                        <span className="text-[11px] font-mono text-cyan-300">{machine.computingPower}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-mono line-clamp-2">
                      {machine.description}
                    </p>

                    <div className="p-3 rounded-xl bg-[#050a14] border border-slate-800 space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rental Price:</span>
                        <span className="text-white font-bold">UGX {(machine.rentalPriceUGX ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white font-bold">{machine.durationDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Daily Yield:</span>
                        <span className="text-emerald-400 font-bold">~UGX {(machine.dailyEstimatedYieldUGX ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Schedule:</span>
                        <span className="text-amber-300 font-bold">{machine.workingDaysSchedule || '5-7 Days/Wk'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleMachineAvailability(machine)}
                      className={`px-3 py-1.5 rounded-lg font-orbitron font-bold text-[10px] uppercase transition ${
                        machine.isAvailable ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200'
                      }`}
                    >
                      {machine.isAvailable ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditMachine(machine)}
                        className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white transition"
                        title="Edit Machine Specifications"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMachine(machine.id, machine.name)}
                        className="p-2 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-300 hover:text-white transition"
                        title="Delete Machine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RENTALS */}
        {activeTab === 'rentals' && (
          <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">Machine Lease & Rental Contracts</h3>
                <p className="text-[11px] text-slate-400">All current and historical computing leases.</p>
              </div>

              <select
                value={rentalStatusFilter}
                onChange={e => setRentalStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs"
              >
                <option value="all">All Rentals</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cyan-900/50 text-slate-400">
                    <th className="py-3 px-3">Rental ID</th>
                    <th className="py-3 px-3">Renter Node</th>
                    <th className="py-3 px-3">Machine</th>
                    <th className="py-3 px-3">Lease Price</th>
                    <th className="py-3 px-3">Yield Accrued</th>
                    <th className="py-3 px-3">Start Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminRentals
                    .filter(r => (rentalStatusFilter === 'all' ? true : r.status === rentalStatusFilter))
                    .map(r => (
                      <tr key={r.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 text-cyan-300 font-bold">{r.id}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{r.userName || r.userId}</div>
                          <span className="text-[10px] text-slate-500">{r.userPhone || ''}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-white font-semibold">{r.machineName}</div>
                          <span className="text-[10px] text-amber-300">{r.hashRate} TH/s</span>
                        </td>
                        <td className="py-3 px-3 font-orbitron font-bold text-white">
                          UGX {(r.rentalPriceUGX ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-orbitron font-bold text-emerald-400">
                          UGX {(r.accumulatedYieldUGX ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[10px]">
                          {new Date(r.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              r.status === 'active'
                                ? 'text-emerald-300 bg-emerald-950 border border-emerald-500/40'
                                : r.status === 'completed'
                                ? 'text-cyan-300 bg-cyan-950 border border-cyan-500/40'
                                : 'text-slate-400 bg-slate-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {r.status === 'active' ? (
                            <button
                              onClick={() => handleUpdateRentalStatus(r.id, 'completed')}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] uppercase"
                            >
                              Complete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateRentalStatus(r.id, 'active')}
                              className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] uppercase"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">Financial Transactions & Settlements</h3>
                <p className="text-[11px] text-slate-400">Inbound deposits and outbound telecom withdrawals.</p>
              </div>

              <select
                value={txStatusFilter}
                onChange={e => setTxStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs"
              >
                <option value="all">All Transactions</option>
                <option value="pending">Pending Approval Only</option>
                <option value="completed">Completed Only</option>
                <option value="failed">Failed Only</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cyan-900/50 text-slate-400">
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Amount (UGX)</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminTxs
                    .filter(t => (txStatusFilter === 'all' ? true : t.status === txStatusFilter))
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 text-cyan-300 font-bold">{tx.reference}</td>
                        <td className="py-3 px-3 capitalize font-semibold">{tx.type.replace('_', ' ')}</td>
                        <td className="py-3 px-3 capitalize text-slate-300">{tx.paymentMethod.replace('_', ' ')}</td>
                        <td className="py-3 px-3 font-orbitron font-bold text-white">
                          UGX {(tx.amountUGX ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[10px]">
                          {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3 uppercase font-bold text-[10px]">
                          <span
                            className={`px-2.5 py-0.5 rounded-full ${
                              tx.status === 'completed'
                                ? 'text-emerald-300 bg-emerald-950 border border-emerald-500/40'
                                : tx.status === 'pending'
                                ? 'text-amber-300 bg-amber-950 border border-amber-500/40'
                                : 'text-rose-300 bg-rose-950'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {tx.status === 'pending' && (
                            <button
                              onClick={() => handleApproveTx(tx.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-orbitron font-bold text-[10px] uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)] transition"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: REFERRALS */}
        {activeTab === 'referrals' && (
          <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
            <h3 className="font-orbitron font-bold text-base text-white">Special Link Referral Connections</h3>
            <p className="text-[11px] text-slate-400">All registered referrals, code bindings, and 5% lease rewards.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cyan-900/50 text-slate-400">
                    <th className="py-3 px-3">Record ID</th>
                    <th className="py-3 px-3">Referrer User</th>
                    <th className="py-3 px-3">Referred User</th>
                    <th className="py-3 px-3">Code Used</th>
                    <th className="py-3 px-3">Commission Earned</th>
                    <th className="py-3 px-3">Date Joined</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminReferrals.map(ref => (
                    <tr key={ref.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 text-cyan-300 font-bold">{ref.id}</td>
                      <td className="py-3 px-3 text-white font-semibold">{ref.referrerUsername}</td>
                      <td className="py-3 px-3 text-slate-300">{ref.referredUsername}</td>
                      <td className="py-3 px-3 text-amber-300 font-bold">{ref.referralCode}</td>
                      <td className="py-3 px-3 font-orbitron font-bold text-emerald-400">
                        UGX {(ref.rewardAmountUGX ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[10px]">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase">
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/30 space-y-4 font-mono text-xs">
            <h3 className="font-orbitron font-bold text-base text-white">Cryptographic Audit Trail</h3>
            <p className="text-[11px] text-slate-400">
              Tamper-evident logs of administrative actions, user toggles, payouts, and system modifications.
            </p>

            <div className="space-y-2">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-[#050a14] border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-amber-400 font-bold uppercase text-[10px] mr-2">[{log.action}]</span>
                    <span className="text-white">{log.details}</span>
                    <span className="text-[10px] text-slate-500 ml-2">by {log.username || log.performedBy || 'admin'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30 max-w-3xl space-y-6">
            <div>
              <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-cyan-400" />
                <span>Global Platform Settings & Policy Control</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Customize website identity, contact coordinates, financial limits, and global banner alerts.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 font-mono text-xs">
              
              {/* Branding and Logo Info */}
              <div className="p-4 rounded-2xl bg-[#050a14] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FutureTechLogo size="sm" />
                  <div>
                    <span className="text-white font-bold block">Brand Logo</span>
                    <span className="text-[10px] text-slate-400">Stylized Aerodynamic F Logo (Active across entire platform)</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-bold">Standardized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Website Brand Name</label>
                  <input
                    type="text"
                    required
                    value={settings.websiteName}
                    onChange={e => setSettings({ ...settings, websiteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Support Contact Email</label>
                  <input
                    type="email"
                    required
                    value={settings.contactEmail}
                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Support Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={settings.contactPhone}
                    onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Telegram Support Handle</label>
                  <input
                    type="text"
                    required
                    value={settings.telegramSupport}
                    onChange={e => setSettings({ ...settings, telegramSupport: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-semibold">Announcement Banner Message</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Show Banner:</span>
                    <input
                      type="checkbox"
                      checked={settings.isAnnouncementActive}
                      onChange={e => setSettings({ ...settings, isAnnouncementActive: e.target.checked })}
                      className="rounded accent-cyan-400"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={settings.announcementBanner}
                  onChange={e => setSettings({ ...settings, announcementBanner: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Financial Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Min Deposit (UGX)</label>
                  <input
                    type="number"
                    value={settings.minDepositUGX}
                    onChange={e => setSettings({ ...settings, minDepositUGX: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Min Withdrawal (UGX)</label>
                  <input
                    type="number"
                    value={settings.minWithdrawalUGX}
                    onChange={e => setSettings({ ...settings, minWithdrawalUGX: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Referral Commission (%)</label>
                  <input
                    type="number"
                    value={settings.referralCommissionPercent}
                    onChange={e => setSettings({ ...settings, referralCommissionPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Disclaimer notice */}
              <div>
                <label className="block text-slate-300 mb-1">Regulatory & Yield Disclaimer Notice</label>
                <textarea
                  rows={3}
                  value={settings.disclaimerNotice}
                  onChange={e => setSettings({ ...settings, disclaimerNotice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,180,27,0.35)] transition"
              >
                <Save className="w-4 h-4" />
                <span>Save & Apply Platform Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 9: BROADCAST */}
        {activeTab === 'broadcast' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30 max-w-2xl space-y-4">
            <div>
              <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Broadcast System Alert to All Users</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Send an instant notification popup to all registered accounts.
              </p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Notification Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cluster Maintenance Completed"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter details..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Alert Category</label>
                <select
                  value={broadcastType}
                  onChange={e => setBroadcastType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050a14] border border-slate-700 text-white focus:outline-none"
                >
                  <option value="system">System Notification</option>
                  <option value="earnings">Yields & Payouts Alert</option>
                  <option value="referral">Special Link & Commission Update</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-orbitron font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,180,27,0.35)]"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Broadcast</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* MACHINE CREATE / EDIT MODAL */}
      {showMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#081224] border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron font-bold text-lg text-white">
                {editingMachine ? 'Edit Computing Machine' : 'Add New Computing Machine'}
              </h3>
              <button onClick={() => setShowMachineModal(false)} className="text-slate-400 hover:text-white font-bold text-xl">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Tier Category</label>
                <select
                  value={machineForm.tier}
                  onChange={e => setMachineForm({ ...machineForm, tier: e.target.value as MachineTier })}
                  className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                >
                  <option value="normal">Normal (Starter • 5 Days/Wk Mon–Fri)</option>
                  <option value="silver">Silver (Balanced • 6 Days/Wk Mon–Sat)</option>
                  <option value="gold">Gold (Enterprise • 7 Days/Wk Everyday)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Machine Name</label>
                <input
                  type="text"
                  required
                  value={machineForm.name}
                  onChange={e => setMachineForm({ ...machineForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Rental Price (UGX)</label>
                  <input
                    type="number"
                    required
                    value={machineForm.rentalPriceUGX}
                    onChange={e => setMachineForm({ ...machineForm, rentalPriceUGX: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Daily Yield (UGX)</label>
                  <input
                    type="number"
                    required
                    value={machineForm.dailyEstimatedYieldUGX}
                    onChange={e => setMachineForm({ ...machineForm, dailyEstimatedYieldUGX: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={machineForm.durationDays}
                    onChange={e => setMachineForm({ ...machineForm, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Hashrate (TH/s)</label>
                  <input
                    type="number"
                    required
                    value={machineForm.hashRate}
                    onChange={e => setMachineForm({ ...machineForm, hashRate: Number(e.target.value), computingPower: `${e.target.value} TH/s` })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={machineForm.description}
                  onChange={e => setMachineForm({ ...machineForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#050a14] border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="avail-check"
                  checked={machineForm.isAvailable}
                  onChange={e => setMachineForm({ ...machineForm, isAvailable: e.target.checked })}
                  className="accent-amber-400"
                />
                <label htmlFor="avail-check" className="text-white font-semibold">
                  Make available for lease immediately
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMachineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-bold text-xs uppercase"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Rejection Modal */}
      {rejectingDepositId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09152e] border-2 border-rose-500/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white text-base">Reject Deposit Submission</h3>
                <p className="text-xs text-slate-400 font-mono">User's wallet balance will NOT be credited</p>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <label className="block text-slate-300">Rejection Reason (displayed to user):</label>
              <textarea
                value={rejectionReasonInput}
                onChange={e => setRejectionReasonInput(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-[#040813] border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                placeholder="e.g. TID not found in mobile money statement, incorrect amount..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingDepositId(null);
                  setRejectionReasonInput('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectDeposit(rejectingDepositId)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-orbitron font-bold text-xs uppercase transition disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div 
            className="bg-[#09152e] border border-cyan-500/50 rounded-3xl max-w-2xl w-full p-4 space-y-3 cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-orbitron font-bold text-white text-sm">Payment Receipt Proof</h4>
              <button 
                onClick={() => setSelectedScreenshot(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center border border-slate-800">
              <img 
                src={selectedScreenshot} 
                alt="Payment proof screenshot" 
                className="max-h-[70vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
