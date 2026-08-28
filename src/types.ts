export type Role = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: Role;
  referralCode: string;
  referralLink: string;
  referredBy?: string | null;
  referrerUsername?: string | null;
  walletBalanceUGX: number;
  totalDepositedUGX: number;
  totalWithdrawnUGX: number;
  totalEarningsUGX: number;
  todayEarningsUGX: number;
  pendingDepositsUGX?: number;
  pendingDepositsCount?: number;
  approvedDepositsUGX?: number;
  machinePurchasesCount?: number;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export type MachineTier = 'gold' | 'silver' | 'normal';

export interface MachineSpec {
  cores: string;
  architecture: string;
  memory: string;
  powerConsumption: string;
  cooling: string;
  uptimeGuarantee: string;
  algorithm: string;
}

export interface Machine {
  id: string;
  tier: MachineTier;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  computingPower: string;
  hashRate: number; // in TH/s
  rentalPriceUGX: number;
  priceUGX?: number; // alias for rentalPriceUGX
  rentalPriceUSD: number;
  durationDays: number;
  dailyEstimatedYieldUGX: number;
  dailyEstimatedYieldPercent: number;
  totalEstimatedYieldUGX: number;
  totalEstimatedYieldPercent: number;
  workingDaysSchedule: string; // e.g. "Monday – Friday (5 Days/Week)", "6 Days/Week (Mon–Sat)", "Everyday (7 Days/Week)"
  workingDaysPerWeek: number; // 5, 6, 7
  weekendStatus: string; // "Off on Saturday & Sunday", "Off on Sunday", "Active Every Day"
  updateTime: string; // "Daily at 12:00 PM"
  availableUnits: number;
  quantity?: number; // alias for availableUnits
  totalUnits: number;
  soldQuantity?: number;
  imageUrl?: string;
  specifications: MachineSpec;
  terms: string[];
  isAvailable: boolean;
  featured?: boolean;
}

export interface MachineRental {
  id: string;
  userId: string;
  machineId: string;
  machineName: string;
  machineTier: MachineTier;
  computingPower: string;
  hashRate: number;
  rentalPriceUGX: number;
  dailyEstimatedYieldUGX: number;
  accumulatedEarningsUGX: number;
  claimedEarningsUGX: number;
  unclaimedEarningsUGX: number;
  durationDays: number;
  workingDaysCount?: number;
  workingDaysSchedule: string;
  workingDaysPerWeek: number;
  weekendStatus: string;
  isWorkingToday: boolean;
  nextUpdateAt: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  lastYieldTick: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'rental_payment'
  | 'machine_purchase'
  | 'machine_earnings'
  | 'referral_bonus'
  | 'admin_adjustment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: TransactionType;
  amountUGX: number;
  method?: string; // MTN Mobile Money, Airtel Money, Bank Transfer, Wallet, Machine Yield
  status: TransactionStatus;
  reference: string;
  tid?: string;
  description: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
  accountDetails?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DepositRecord {
  id: string;
  userId: string;
  userName: string;
  userAccount: string; // phone or email
  amountUGX: number;
  tid: string;
  screenshotUrl?: string;
  paymentMethod?: string;
  status: DepositStatus;
  rejectionReason?: string;
  adminNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface MachinePurchaseRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  machineId: string;
  machineName: string;
  machineTier?: MachineTier;
  priceUGX: number;
  quantity: number;
  status: 'completed' | 'active';
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  maskedIdentifier: string; // e.g. "FT****29" or "al****ist"
  fullUsername?: string;
  phoneNumberMasked: string; // e.g. "+25677****456"
  joinedAt: string;
  status: 'active' | 'registered' | 'pending';
  hasActiveMachine: boolean;
  rentalCount: number;
  rewardAmountUGX: number;
  rewardStatus: 'credited' | 'pending' | 'none';
}

export interface InviteStats {
  totalInvites: number;
  successfulInvites: number;
  pendingInvites: number;
  activeInvites: number;
  totalReferralRewardsUGX: number;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific userId
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'earnings' | 'referral';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface EarningsSummary {
  todayEarningsUGX: number;
  weeklyEarningsUGX: number;
  monthlyEarningsUGX: number;
  totalEarningsUGX: number;
  withdrawableBalanceUGX: number;
  unclaimedMachineYieldUGX: number;
  totalActiveMachines: number;
  totalHashRateTHs: number;
  actualVsEstimatedRatio: number;
  chartHistory: {
    date: string;
    actualEarningsUGX: number;
    projectedEarningsUGX: number;
  }[];
  activeMachineBreakdowns: {
    rentalId: string;
    machineName: string;
    tier: MachineTier;
    dailyYieldUGX: number;
    accumulatedUGX: number;
    unclaimedUGX: number;
    daysRemaining: number;
    efficiencyRate: number;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  category: 'AUTH' | 'WALLET' | 'RENTAL' | 'REFERRAL' | 'ADMIN' | 'SECURITY';
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminOverviewStats {
  totalUsersCount: number;
  activeUsersCount: number;
  totalPlatformRevenueUGX: number;
  totalDepositedUGX: number;
  totalWithdrawnUGX: number;
  totalEarningsPaidUGX: number;
  activeRentalsCount: number;
  totalHashRateTHs: number;
  pendingWithdrawalsCount: number;
  pendingDepositsCount: number;
  approvedDepositsCount?: number;
  rejectedDepositsCount?: number;
  totalMachinesSold?: number;
  totalMachinesAvailable?: number;
  totalMachinePurchases?: number;
  totalValueMachinePurchasesUGX?: number;
  mostPurchasedMachine?: string;
  totalPlatformInvites: number;
  successfulInvitesCount: number;
  // Aliases for dashboard UI compatibility
  totalUsers?: number;
  activeRentals?: number;
  totalHashRate?: number;
  totalReferralsRewardUGX?: number;
  totalYieldsClaimedUGX?: number;
}

export interface PlatformSettings {
  websiteName: string;
  contactEmail: string;
  contactPhone: string;
  telegramSupport: string;
  announcementBanner: string;
  isAnnouncementActive: boolean;
  maintenanceMode: boolean;
  minDepositUGX: number;
  minWithdrawalUGX: number;
  withdrawalFeePercent: number;
  referralCommissionPercent: number;
  disclaimerNotice: string;
}

export interface NodeTelemetry {
  onlineNodes: number;
  networkHashrate: string;
  avgBlockTime: string;
  clusterEfficiency: string;
  greenEnergyRatio: string;
  networkLatencyMs: number;
  serverTime: string;
}
