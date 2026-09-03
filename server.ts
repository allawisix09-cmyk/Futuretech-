import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  User,
  Machine,
  MachineTier,
  MachineRental,
  Transaction,
  ReferralRecord,
  NotificationItem,
  AuditLog,
  AdminOverviewStats,
  NodeTelemetry,
  EarningsSummary,
  PlatformSettings,
  DepositRecord,
  DepositStatus,
  MachinePurchaseRecord
} from './src/types';

// Initialize Express App
const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for cryptographic hashing
function hashPassword(password: string, salt: string = 'future_tech_salt_2026'): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function generateReferralCode(username: string): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FT-${randomPart}`;
}

function maskIdentifier(val: string): string {
  if (!val) return 'FT****99';
  if (val.length <= 4) return val.slice(0, 1) + '****' + val.slice(-1);
  return val.slice(0, 2) + '****' + val.slice(-2);
}

function maskPhone(phone: string): string {
  if (!phone) return '+256****';
  const clean = phone.trim();
  if (clean.length < 8) return clean.slice(0, 3) + '****';
  return clean.slice(0, 6) + '****' + clean.slice(-3);
}

// In-Memory Database State
class Database {
  users: User[] = [];
  passwords: Map<string, string> = new Map(); // userId -> hashedPassword
  machines: Machine[] = [];
  rentals: MachineRental[] = [];
  transactions: Transaction[] = [];
  deposits: DepositRecord[] = [];
  purchases: MachinePurchaseRecord[] = [];
  referrals: ReferralRecord[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: AuditLog[] = [];
  sessions: Map<string, string> = new Map(); // token -> userId
  settings: PlatformSettings = {
    websiteName: 'FUTURE TECH',
    contactEmail: 'futurettech01@gmail.com',
    contactPhone: '+256772123456',
    telegramSupport: '@futuretech_ops',
    announcementBanner: '🚀 Cloud Compute Cluster V4.2 active. Automated 12:00 PM yields online.',
    isAnnouncementActive: true,
    maintenanceMode: false,
    minDepositUGX: 10000,
    minWithdrawalUGX: 20000,
    withdrawalFeePercent: 15,
    referralCommissionPercent: 5,
    disclaimerNotice: 'Notice: Computational machine yields are performance estimates based on network hash difficulty and are not guaranteed income. Past performance does not guarantee future results.'
  };

  constructor() {
    this.seed();
  }

  logAudit(userId: string, username: string, action: string, category: AuditLog['category'], details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      username,
      action,
      category,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }

  addNotification(userId: string, title: string, message: string, type: NotificationItem['type'] = 'info') {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
  }

  seed() {
    // 1. Seed Initial Machines (Gold, Silver, Normal)
    this.machines = [
      {
        id: 'cpu-gold-900',
        tier: 'gold',
        name: 'GOLD CPU — Quantum Titan X-900',
        badge: 'Enterprise • Mon–Fri Schedule',
        tagline: 'High-density quantum-accelerated matrix processing for extreme cloud workloads.',
        description: 'The pinnacle of high-performance computing clusters. Operates Monday to Friday (weekends Saturday and Sunday off) with daily automated 12:00 PM payouts.',
        computingPower: '480 TH/s (Enterprise Tier)',
        hashRate: 480,
        rentalPriceUGX: 150000,
        priceUGX: 150000,
        rentalPriceUSD: 40,
        durationDays: 30,
        dailyEstimatedYieldUGX: 8333,
        dailyEstimatedYieldPercent: 5.56,
        totalEstimatedYieldUGX: 250000,
        totalEstimatedYieldPercent: 167,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 14,
        quantity: 14,
        totalUnits: 50,
        soldQuantity: 36,
        specifications: {
          cores: '256 Cores @ 5.8 GHz Liquid Cryo',
          architecture: 'Quantum Neural 3nm Tensor Architecture',
          memory: '512 GB High-Bandwidth HBM3e Memory',
          powerConsumption: '1450W Eco-Optimized Cluster',
          cooling: 'Closed-Loop Fluorochemical Immersion',
          uptimeGuarantee: '99.98% SLA Enterprise Uptime',
          algorithm: 'Adaptive AI Matrix & Cloud Tensor Hash'
        },
        terms: [
          'Estimated daily yield is calculated based on verified computing network load.',
          'Operates 5 days a week (Monday through Friday; does not work on Saturday or Sunday).',
          'Daily yield is automatically computed and updated every 12:00 PM on active weekdays.',
          'Rental duration is 30 operational days with dedicated compute power.'
        ],
        isAvailable: true,
        featured: true
      },
      {
        id: 'cpu-silver-500',
        tier: 'silver',
        name: 'SILVER CPU — Matrix Reactor S-500',
        badge: 'Balanced • 5 Days/Wk (Mon–Fri)',
        tagline: 'Dual-die silicon processor engineered for heavy AI model fine-tuning and node validation.',
        description: 'A powerhouse compute engine offering optimal energy efficiency. Operates 5 days a week (Monday to Friday, weekends Saturday and Sunday off) with automated 12:00 PM payouts.',
        computingPower: '180 TH/s (Mid Tier)',
        hashRate: 180,
        rentalPriceUGX: 60000,
        priceUGX: 60000,
        rentalPriceUSD: 16,
        durationDays: 30,
        dailyEstimatedYieldUGX: 3333,
        dailyEstimatedYieldPercent: 5.56,
        totalEstimatedYieldUGX: 100000,
        totalEstimatedYieldPercent: 167,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 28,
        quantity: 28,
        totalUnits: 100,
        soldQuantity: 72,
        specifications: {
          cores: '128 Cores @ 4.6 GHz Turbo Boost',
          architecture: 'Dual-Die Silicon 5nm FinFET Matrix',
          memory: '192 GB GDDR6X Dedicated VRAM',
          powerConsumption: '650W Dynamic Frequency Scaling',
          cooling: 'Dual Vapor Chamber High-Pressure Airflow',
          uptimeGuarantee: '99.85% SLA Node Uptime',
          algorithm: 'SHA-256 / Ethash Parallel Hybrid'
        },
        terms: [
          'Operates 5 days a week (Monday through Friday; does not work on Saturday or Sunday).',
          'Daily earnings update automatically every weekday at 12:00 PM.',
          '30 active operational days total term.'
        ],
        isAvailable: true,
        featured: false
      },
      {
        id: 'cpu-normal-200',
        tier: 'normal',
        name: 'NORMAL CPU — Core Titanium N-200',
        badge: 'Starter • 5 Days/Wk (Mon–Fri)',
        tagline: 'Reliable entry-level computing core for decentralized data parsing and validation.',
        description: 'The ideal starter computing node. Operates 5 days a week (Monday to Friday; weekends Saturday and Sunday off) with automated 12:00 PM payouts.',
        computingPower: '65 TH/s (Standard Tier)',
        hashRate: 65,
        rentalPriceUGX: 30000,
        priceUGX: 30000,
        rentalPriceUSD: 8,
        durationDays: 30,
        dailyEstimatedYieldUGX: 1600,
        dailyEstimatedYieldPercent: 5.33,
        totalEstimatedYieldUGX: 48000,
        totalEstimatedYieldPercent: 160,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 82,
        quantity: 82,
        totalUnits: 200,
        soldQuantity: 118,
        specifications: {
          cores: '48 Cores @ 3.8 GHz Steady State',
          architecture: 'Monolithic 7nm Industrial Compute Core',
          memory: '64 GB ECC DDR5 Enterprise Cache',
          powerConsumption: '280W Ultra-Low Power Standard',
          cooling: 'Silent Mag-Lev Direct Heat-Pipe Cooling',
          uptimeGuarantee: '99.50% SLA Standard Node Uptime',
          algorithm: 'Standard Proof-of-Compute Workload'
        },
        terms: [
          'Operates on weekdays (Monday through Friday; does not work on Saturday or Sunday).',
          'Yields update automatically at 12:00 PM on active working days.',
          'Instant activation upon rental confirmation or mobile money payment.'
        ],
        isAvailable: true,
        featured: false
      },
      {
        id: 'cpu-ng-series',
        tier: 'normal',
        name: 'NG series',
        badge: '20-Day Fast Cycle • Mon–Fri',
        tagline: 'High-efficiency 20-day algorithmic matrix compute cluster (Mon–Fri).',
        description: 'Optimized NG Series cluster engineered for rapid 20-day cycles with 2,400 UGX daily automated yield and 48,000 UGX total return. Weekends (Sat & Sun) off.',
        computingPower: '85 TH/s (NG Series)',
        hashRate: 85,
        rentalPriceUGX: 30000,
        priceUGX: 30000,
        rentalPriceUSD: 8,
        durationDays: 20,
        dailyEstimatedYieldUGX: 2400,
        dailyEstimatedYieldPercent: 8.0,
        totalEstimatedYieldUGX: 48000,
        totalEstimatedYieldPercent: 160,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 50,
        quantity: 50,
        totalUnits: 100,
        soldQuantity: 18,
        specifications: {
          cores: '64 Cores @ 4.2 GHz Turbo',
          architecture: 'NG Tensor Matrix Architecture',
          memory: '96 GB GDDR6 High-Speed VRAM',
          powerConsumption: '380W Eco-Compute Standard',
          cooling: 'Dual Liquid Vapor Chamber Loop',
          uptimeGuarantee: '99.85% Node SLA',
          algorithm: 'Tensor AI Processing & Validation'
        },
        terms: [
          '20-day dedicated high-performance compute cycle (Monday through Friday).',
          'Does not work on Saturday and Sunday (weekends paused).',
          'Daily earnings of UGX 2,400 distributed automatically every 12:00 PM on weekdays.',
          'Total projected yield of UGX 48,000 upon 20-day term completion.'
        ],
        isAvailable: true,
        featured: true
      },
      {
        id: 'cpu-us-series-20',
        tier: 'gold',
        name: 'US series',
        badge: '2x Double Return • 20 Days',
        tagline: 'Ultra-speed multi-core compute cluster with 10,000 UGX daily yield (Mon–Fri).',
        description: 'Enterprise-grade US Series processor engineered for high-throughput tensor operations with a 100% net profit double return over 20 days. Weekends off.',
        computingPower: '280 TH/s (US High-Yield)',
        hashRate: 280,
        rentalPriceUGX: 100000,
        priceUGX: 100000,
        rentalPriceUSD: 27,
        durationDays: 20,
        dailyEstimatedYieldUGX: 10000,
        dailyEstimatedYieldPercent: 10.0,
        totalEstimatedYieldUGX: 200000,
        totalEstimatedYieldPercent: 200,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 30,
        quantity: 30,
        totalUnits: 60,
        soldQuantity: 24,
        specifications: {
          cores: '160 Cores @ 5.2 GHz Cryo-Boost',
          architecture: 'US High-Bandwidth Cryo-Core',
          memory: '256 GB High-Bandwidth HBM3 Memory',
          powerConsumption: '850W Performance-Optimized',
          cooling: 'Active Liquid Cryogenic Loop',
          uptimeGuarantee: '99.95% Enterprise SLA',
          algorithm: 'Quantum AI Matrix Verification'
        },
        terms: [
          '20-day enterprise compute duration (Monday to Friday active).',
          'Does not work on Saturday and Sunday (weekends paused).',
          'Daily payout of UGX 10,000 at 12:00 PM automated distribution on weekdays.',
          'Guaranteed 200,000 UGX total return upon 20-day completion.'
        ],
        isAvailable: true,
        featured: true
      },
      {
        id: 'cpu-dr-series-90',
        tier: 'gold',
        name: 'DR series',
        badge: 'Long-Term 90D • Mon–Fri Schedule',
        tagline: 'Extended deep compute engine with 600,000 UGX total return over 90 active days.',
        description: 'Deep Research DR Series cluster built for heavy sustained computational learning (Monday through Friday; offline Saturday & Sunday), streaming 6,666 UGX daily.',
        computingPower: '210 TH/s (DR Deep Node)',
        hashRate: 210,
        rentalPriceUGX: 50000,
        priceUGX: 50000,
        rentalPriceUSD: 14,
        durationDays: 90,
        dailyEstimatedYieldUGX: 6666,
        dailyEstimatedYieldPercent: 13.33,
        totalEstimatedYieldUGX: 600000,
        totalEstimatedYieldPercent: 1200,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 40,
        quantity: 40,
        totalUnits: 80,
        soldQuantity: 32,
        specifications: {
          cores: '192 Cores @ 4.8 GHz Unified',
          architecture: 'DR Deep-Neural Acceleration Matrix',
          memory: '384 GB Unified Compute Memory',
          powerConsumption: '720W Sustained Load',
          cooling: 'Hydrodynamic Immersion Core',
          uptimeGuarantee: '99.95% Continuous SLA',
          algorithm: 'Deep Learning Model Optimization'
        },
        terms: [
          'Extended 90-day continuous computing duration (Monday through Friday).',
          'Does not work on Saturday and Sunday (weekends paused).',
          'Automated daily yield of UGX 6,666 credited every 12:00 PM on weekdays.',
          'Massive total yield of UGX 600,000 upon 90-day completion.'
        ],
        isAvailable: true,
        featured: true
      },
      {
        id: 'cpu-us-series-80',
        tier: 'gold',
        name: 'US series (80 Days)',
        badge: 'Extended 80D • Mon–Fri Schedule',
        tagline: 'High-yield 80-day sustained compute power with 8,550 UGX daily return.',
        description: 'Powerful US Series long-duration compute node generating 8,550 UGX daily for 80 active days (Monday through Friday; offline on Saturday & Sunday).',
        computingPower: '250 TH/s (US Tensor Max)',
        hashRate: 250,
        rentalPriceUGX: 60000,
        priceUGX: 60000,
        rentalPriceUSD: 16,
        durationDays: 80,
        dailyEstimatedYieldUGX: 8550,
        dailyEstimatedYieldPercent: 14.25,
        totalEstimatedYieldUGX: 700000,
        totalEstimatedYieldPercent: 1167,
        workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
        workingDaysPerWeek: 5,
        weekendStatus: 'Offline on Saturday & Sunday',
        updateTime: 'Daily at 12:00 PM (Mon–Fri)',
        availableUnits: 35,
        quantity: 35,
        totalUnits: 75,
        soldQuantity: 38,
        specifications: {
          cores: '224 Cores @ 5.0 GHz Multi-Threaded',
          architecture: 'Advanced US Tensor Super-Node',
          memory: '448 GB High-Bandwidth VRAM',
          powerConsumption: '900W High-Efficiency',
          cooling: 'Cryogenic Dual-Chamber Immersion',
          uptimeGuarantee: '99.95% SLA Guarantee',
          algorithm: 'Distributed Cluster Compute & Hash'
        },
        terms: [
          '80 operational days of dedicated compute power (Monday through Friday).',
          'Does not work on Saturday and Sunday (weekends paused).',
          'Daily yield of UGX 8,550 automatically credited every 12:00 PM on weekdays.',
          'Cumulative total yield of UGX 700,000 upon 80-day completion.'
        ],
        isAvailable: true,
        featured: true
      }
    ];

    // 2. Seed Root Administrator Account
    const adminId = 'usr_admin_001';
    const adminUser: User = {
      id: adminId,
      username: 'kabandaaiman',
      email: 'admin@futuretech.com',
      phoneNumber: '0000000000',
      role: 'admin',
      referralCode: 'FT-ADMIN1',
      referralLink: 'https://futuretech.com/join/FT-ADMIN1',
      walletBalanceUGX: 0,
      totalDepositedUGX: 0,
      totalWithdrawnUGX: 0,
      totalEarningsUGX: 0,
      todayEarningsUGX: 0,
      status: 'active',
      createdAt: '2026-01-10T08:00:00.000Z'
    };
    this.users.push(adminUser);
    const initialAdminPassword = process.env.ADMIN_PASSWORD || '0000000000';
    this.passwords.set(adminId, hashPassword(initialAdminPassword));

    // Production environment clean initialization:
    // Real users register through /api/auth/register or login with their real credentials.
    this.rentals = [];
    this.referrals = [];
    this.transactions = [];
    this.notifications = [];
    this.deposits = [];
    this.purchases = [];

    this.logAudit(adminId, 'kabandaaiman', 'SYSTEM_INITIALIZED', 'ADMIN', 'Future Tech server initialized for live production deployment.');
  }

  // Working Days & Schedule Verification
  // Universal rule: ALL machines do NOT work on Saturday (day 6) and Sunday (day 0)
  isDayActiveForTier(tier?: MachineTier, dayOfWeek?: number, schedule?: string): boolean {
    const day = dayOfWeek !== undefined ? dayOfWeek : new Date().getDay();
    // 0 = Sunday, 6 = Saturday -> All machines are offline on Saturday and Sunday
    if (day === 0 || day === 6) {
      return false;
    }
    // Monday through Friday (1..5) are active working days
    return true;
  }

  getTierScheduleInfo(tier?: MachineTier) {
    return {
      workingDaysSchedule: 'Monday – Friday (5 Days / Week)',
      workingDaysPerWeek: 5,
      weekendStatus: 'Offline on Saturday & Sunday',
      updateTime: 'Daily at 12:00 PM (Mon–Fri)'
    };
  }

  getNext12PM(): string {
    const next12 = new Date();
    next12.setHours(12, 0, 0, 0);
    if (Date.now() >= next12.getTime()) {
      next12.setDate(next12.getDate() + 1);
    }
    return next12.toISOString();
  }

  enrichRental(rental: MachineRental): MachineRental {
    const currentDay = new Date().getDay();
    const isWorkingToday = this.isDayActiveForTier(rental.machineTier, currentDay, rental.workingDaysSchedule);
    const schedule = this.getTierScheduleInfo(rental.machineTier);

    return {
      ...rental,
      workingDaysSchedule: rental.workingDaysSchedule || schedule.workingDaysSchedule,
      workingDaysPerWeek: rental.workingDaysPerWeek || schedule.workingDaysPerWeek,
      weekendStatus: rental.weekendStatus || schedule.weekendStatus,
      isWorkingToday,
      nextUpdateAt: this.getNext12PM()
    };
  }

  // Automated 12:00 PM Yield Calculation Engine
  calculateAccruedEarnings(userId?: string) {
    const rentalsToProcess = userId
      ? this.rentals.filter(r => r.userId === userId && r.status === 'active')
      : this.rentals.filter(r => r.status === 'active');

    const now = Date.now();
    let totalNewlyAccrued = 0;
    const currentDay = new Date().getDay();

    rentalsToProcess.forEach(rental => {
      const isEligibleToday = this.isDayActiveForTier(rental.machineTier, currentDay, rental.workingDaysSchedule);
      
      const lastTick = new Date(rental.lastYieldTick).getTime();
      const elapsedMs = Math.max(0, now - lastTick);
      const elapsedHours = elapsedMs / (1000 * 60 * 60);

      if (isEligibleToday && elapsedHours > 0) {
        // Accrues according to active daily schedule
        const hourlyRate = rental.dailyEstimatedYieldUGX / 24;
        const accruedForPeriod = Math.floor(elapsedHours * hourlyRate);

        if (accruedForPeriod > 0) {
          rental.accumulatedEarningsUGX += accruedForPeriod;
          rental.unclaimedEarningsUGX += accruedForPeriod;
          rental.lastYieldTick = new Date(now).toISOString();
          totalNewlyAccrued += accruedForPeriod;
        }
      } else if (!isEligibleToday) {
        // Machine is paused for weekend/schedule, update tick without accruing yield
        rental.lastYieldTick = new Date(now).toISOString();
      }
    });

    return totalNewlyAccrued;
  }

  // 12:00 PM System-wide Distribution Trigger
  trigger12PMDailyDistribution() {
    const currentDay = new Date().getDay();
    const activeRentals = this.rentals.filter(r => r.status === 'active');
    let processedCount = 0;
    let totalDistributedUGX = 0;

    activeRentals.forEach(rental => {
      const isWorking = this.isDayActiveForTier(rental.machineTier, currentDay, rental.workingDaysSchedule);
      if (isWorking) {
        const yieldAmount = rental.dailyEstimatedYieldUGX;
        rental.accumulatedEarningsUGX += yieldAmount;
        rental.unclaimedEarningsUGX += yieldAmount;
        rental.workingDaysCount = (rental.workingDaysCount || 0) + 1;
        rental.lastYieldTick = new Date().toISOString();
        totalDistributedUGX += yieldAmount;
        processedCount++;

        // Notify user about 12:00 PM automated payout
        this.notifications.unshift({
          id: `notif_12pm_${Date.now()}_${rental.id}`,
          userId: rental.userId,
          title: '12:00 PM Automated Machine Payout',
          message: `Your ${rental.machineName} has produced UGX ${yieldAmount.toLocaleString()} today. Accrued to your unclaimed balance.`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    if (processedCount > 0) {
      this.logAudit(
        'system',
        'SYSTEM_CRON',
        '12PM_DAILY_DISTRIBUTION',
        'ADMIN',
        `12:00 PM automated distribution: Credited UGX ${totalDistributedUGX.toLocaleString()} across ${processedCount} active machines.`
      );
    }
  }

  getInviteStats(userId: string): { totalInvites: number; successfulInvites: number; pendingInvites: number; activeInvites: number; totalRewardsEarnedUGX: number } {
    const userReferrals = this.referrals.filter(r => r.referrerId === userId);
    const totalInvites = userReferrals.length;
    const successfulInvites = userReferrals.filter(r => r.status === 'active' || r.status === 'registered').length;
    const pendingInvites = userReferrals.filter(r => r.status === 'pending').length;
    const activeInvites = userReferrals.filter(r => r.hasActiveMachine || r.status === 'active').length;
    const totalRewardsEarnedUGX = userReferrals.reduce((sum, r) => sum + (r.rewardAmountUGX || 0), 0);

    return {
      totalInvites,
      successfulInvites,
      pendingInvites,
      activeInvites,
      totalRewardsEarnedUGX
    };
  }
}

const db = new Database();

// Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.substring(7);
  const userId = db.sessions.get(token);

  if (!userId) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account has been suspended by administration.' });
  }

  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  next();
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Health & Telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'FUTURE TECH Node Engine v4.2',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/telemetry', (req, res) => {
  const telemetry: NodeTelemetry = {
    onlineNodes: 1420 + Math.floor(Math.random() * 15),
    networkHashrate: '14.82 EH/s',
    avgBlockTime: '9.84s',
    clusterEfficiency: '99.94%',
    greenEnergyRatio: '84.2%',
    networkLatencyMs: 18 + Math.floor(Math.random() * 8),
    serverTime: new Date().toISOString()
  };
  res.json(telemetry);
});

// 2. Auth Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, phoneNumber, password, referralCode, agreedToTerms } = req.body;

    if (!username || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required (username, email, phone number, password).' });
    }

    if (!agreedToTerms) {
      return res.status(400).json({ error: 'You must accept the terms and conditions to register.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim();
    const cleanUsername = username.trim();

    // Check existing
    const existingEmail = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const existingPhone = db.users.find(u => u.phoneNumber === cleanPhone);
    if (existingPhone) {
      return res.status(400).json({ error: 'An account with this phone number already exists.' });
    }

    const existingUsername = db.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
    }

    // Process Referral
    let referrer: User | undefined;
    if (referralCode) {
      const formattedCode = referralCode.trim().toUpperCase();
      referrer = db.users.find(u => u.referralCode === formattedCode);

      // Prevent Self-Referral
      if (referrer && (referrer.email.toLowerCase() === cleanEmail || referrer.phoneNumber === cleanPhone)) {
        return res.status(400).json({ error: 'Self-referral is strictly forbidden by the security protocol.' });
      }
    }

    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const myReferralCode = generateReferralCode(cleanUsername);
    const host = req.get('host') || 'futuretech.com';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const myReferralLink = `${protocol}://${host}/join/${myReferralCode}`;

    const newUser: User = {
      id: newUserId,
      username: cleanUsername,
      email: cleanEmail,
      phoneNumber: cleanPhone,
      role: 'user',
      referralCode: myReferralCode,
      referralLink: myReferralLink,
      referredBy: referrer ? referrer.id : null,
      referrerUsername: referrer ? referrer.username : null,
      walletBalanceUGX: 10000, // UGX 10,000 complimentary welcome computing credit
      totalDepositedUGX: 0,
      totalWithdrawnUGX: 0,
      totalEarningsUGX: 0,
      todayEarningsUGX: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords.set(newUserId, hashPassword(password));

    // Record Referral Linkage
    if (referrer) {
      const refRecord: ReferralRecord = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        referrerId: referrer.id,
        referredUserId: newUserId,
        maskedIdentifier: maskIdentifier(cleanUsername),
        fullUsername: cleanUsername,
        phoneNumberMasked: maskPhone(cleanPhone),
        joinedAt: new Date().toISOString(),
        status: 'registered',
        hasActiveMachine: false,
        rentalCount: 0,
        rewardAmountUGX: 0,
        rewardStatus: 'none'
      };
      db.referrals.push(refRecord);

      db.addNotification(
        referrer.id,
        'New Referral Joined!',
        `User ${maskIdentifier(cleanUsername)} registered using your special link.`,
        'referral'
      );

      db.logAudit(referrer.id, referrer.username, 'REFERRAL_REGISTERED', 'REFERRAL', `User ${cleanUsername} registered via referral code ${referrer.referralCode}`);
    }

    // Welcome notification
    db.addNotification(
      newUserId,
      'Welcome to FUTURE TECH',
      'Your computing account is active! You received UGX 10,000 welcome credit. Explore machines to begin earning.',
      'success'
    );

    db.logAudit(newUserId, cleanUsername, 'USER_REGISTERED', 'AUTH', `New user registered. Referral: ${referrer?.referralCode || 'None'}`);

    // Create session
    const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
    db.sessions.set(token, newUserId);

    const inviteStats = db.getInviteStats(newUserId);

    return res.status(201).json({
      success: true,
      token,
      user: newUser,
      inviteStats,
      message: 'Account created successfully.'
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // phone or email

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide your email/phone and password.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanId || u.phoneNumber.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify and try again.' });
    }

    const hashed = db.passwords.get(user.id);
    if (!hashed || hashed !== hashPassword(password)) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Dynamic accrual check
    db.calculateAccruedEarnings(user.id);

    const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
    db.sessions.set(token, user.id);

    db.logAudit(user.id, user.username, 'USER_LOGIN', 'AUTH', 'User logged in successfully');

    const inviteStats = db.getInviteStats(user.id);

    return res.json({
      success: true,
      token,
      user,
      inviteStats,
      message: 'Welcome back to Future Tech.'
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  db.calculateAccruedEarnings(user.id);

  const inviteStats = db.getInviteStats(user.id);
  const userNotifications = db.notifications.filter(n => n.userId === user.id || n.userId === 'all').slice(0, 20);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  res.json({
    user,
    inviteStats,
    notifications: userNotifications,
    unreadNotificationsCount: unreadCount
  });
});

app.post('/api/auth/logout', authenticateUser, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/change-password', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as User;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide both current and new passwords.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const currentHash = db.passwords.get(user.id);
    if (!currentHash || currentHash !== hashPassword(oldPassword)) {
      return res.status(400).json({ error: 'Current password does not match our records.' });
    }

    db.passwords.set(user.id, hashPassword(newPassword));
    db.logAudit(user.id, user.username, 'PASSWORD_ROTATED', 'SECURITY', 'User rotated account password hash');

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ error: 'Please provide your account email/phone and your new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanId || u.phoneNumber.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);

    if (!user) {
      return res.status(404).json({ error: 'Account matching that email or phone was not found.' });
    }

    db.passwords.set(user.id, hashPassword(newPassword));
    db.logAudit(user.id, user.username, 'PASSWORD_RESET', 'AUTH', 'Password reset successfully performed via identifier verification');

    db.addNotification(
      user.id,
      'Password Reset Completed',
      'Your account password was updated successfully. If you did not request this change, please contact administration immediately.',
      'alert'
    );

    return res.json({ success: true, message: 'Password reset successfully. You may now log in with your new credentials.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

app.patch('/api/auth/profile', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as User;
    const { email, phoneNumber } = req.body;

    if (email) user.email = email.trim();
    if (phoneNumber) user.phoneNumber = phoneNumber.trim();

    db.logAudit(user.id, user.username, 'PROFILE_UPDATED', 'AUTH', `User profile updated: email=${user.email}, phone=${user.phoneNumber}`);

    return res.json({ success: true, user, message: 'Profile updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

app.get('/api/settings', (req, res) => {
  res.json({ settings: db.settings });
});

// 3. Referral System Endpoints
app.get('/api/referrals/validate-code/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const referrer = db.users.find(u => u.referralCode === code);

  if (!referrer) {
    return res.status(404).json({ valid: false, message: 'Referral code not found' });
  }

  res.json({
    valid: true,
    code: referrer.referralCode,
    username: referrer.username,
    maskedUsername: maskIdentifier(referrer.username)
  });
});

app.get('/api/referrals/my-invites', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const inviteStats = db.getInviteStats(user.id);
  const userReferrals = db.referrals
    .filter(r => r.referrerId === user.id)
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  res.json({
    inviteStats,
    referrals: userReferrals,
    specialLink: user.referralLink,
    referralCode: user.referralCode
  });
});

// 4. Machines & Marketplace Endpoints
app.get('/api/machines', (req, res) => {
  res.json({ machines: db.machines });
});

app.get('/api/machines/:id', (req, res) => {
  const machine = db.machines.find(m => m.id === req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found.' });
  }
  res.json({ machine });
});

// 5. Machine Rental Endpoints
app.post('/api/rentals/rent', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as User;
    const { machineId, paymentMethod, mobileMoneyPhone } = req.body;

    const machine = db.machines.find(m => m.id === machineId);
    if (!machine) {
      return res.status(404).json({ error: 'Selected computing machine does not exist.' });
    }

    if (!machine.isAvailable || machine.availableUnits <= 0) {
      return res.status(400).json({ error: 'Machine cluster is currently fully booked. Please select another tier.' });
    }

    const price = machine.rentalPriceUGX;

    // Check payment method
    if (paymentMethod === 'wallet') {
      if (user.walletBalanceUGX < price) {
        return res.status(400).json({
          error: `Insufficient wallet balance. You need UGX ${price.toLocaleString()}, but your balance is UGX ${user.walletBalanceUGX.toLocaleString()}. Please deposit funds first.`
        });
      }
      user.walletBalanceUGX -= price;
    } else if (paymentMethod === 'mobile_money') {
      if (!mobileMoneyPhone) {
        return res.status(400).json({ error: 'Mobile Money phone number is required for direct payment.' });
      }
      // Direct payment simulated instant confirmation
      user.totalDepositedUGX += price;
    }

    // Create Machine Rental
    const rentalId = `rnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startDate = new Date();
    const endDate = new Date(Date.now() + machine.durationDays * 24 * 60 * 60 * 1000);

    const sched = db.getTierScheduleInfo(machine.tier);
    const newRental: MachineRental = {
      id: rentalId,
      userId: user.id,
      machineId: machine.id,
      machineName: machine.name,
      machineTier: machine.tier,
      computingPower: machine.computingPower,
      hashRate: machine.hashRate,
      rentalPriceUGX: price,
      dailyEstimatedYieldUGX: machine.dailyEstimatedYieldUGX,
      accumulatedEarningsUGX: 0,
      claimedEarningsUGX: 0,
      unclaimedEarningsUGX: 0,
      durationDays: machine.durationDays,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      lastYieldTick: startDate.toISOString(),
      workingDaysSchedule: sched.workingDaysSchedule,
      workingDaysPerWeek: sched.workingDaysPerWeek,
      weekendStatus: sched.weekendStatus,
      isWorkingToday: db.isDayActiveForTier(machine.tier, new Date().getDay(), sched.workingDaysSchedule),
      nextUpdateAt: '12:00 PM'
    };

    db.rentals.unshift(newRental);
    machine.availableUnits = Math.max(0, machine.availableUnits - 1);

    // Record Rental Transaction
    const tx: Transaction = {
      id: `tx_rnt_${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'rental_payment',
      amountUGX: price,
      method: paymentMethod === 'wallet' ? 'Wallet Balance' : 'MTN / Airtel Mobile Money',
      status: 'completed',
      reference: `FT-RENT-${machine.tier.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `Rented ${machine.name} (${machine.durationDays} Days @ ${machine.computingPower})`,
      createdAt: new Date().toISOString()
    };
    db.transactions.unshift(tx);

    // Give Referral Commission to Referrer if applicable (5% of rental price)
    if (user.referredBy) {
      const referrer = db.users.find(u => u.id === user.referredBy);
      if (referrer) {
        const commission = Math.round(price * 0.05);
        referrer.walletBalanceUGX += commission;
        referrer.totalEarningsUGX += commission;

        // Update referral record
        const refRecord = db.referrals.find(r => r.referrerId === referrer.id && r.referredUserId === user.id);
        if (refRecord) {
          refRecord.hasActiveMachine = true;
          refRecord.rentalCount = (refRecord.rentalCount || 0) + 1;
          refRecord.status = 'active';
          refRecord.rewardAmountUGX = (refRecord.rewardAmountUGX || 0) + commission;
          refRecord.rewardStatus = 'credited';
        }

        // Referral transaction
        db.transactions.unshift({
          id: `tx_ref_${Date.now()}`,
          userId: referrer.id,
          userName: referrer.username,
          type: 'referral_bonus',
          amountUGX: commission,
          method: 'Referral Incentive',
          status: 'completed',
          reference: `FT-REF-COMM-${Math.floor(1000 + Math.random() * 9000)}`,
          description: `5% Referral Commission from ${maskIdentifier(user.username)} renting ${machine.tier.toUpperCase()} CPU`,
          createdAt: new Date().toISOString()
        });

        db.addNotification(
          referrer.id,
          'Referral Commission Credited! 🚀',
          `You earned UGX ${commission.toLocaleString()} because ${maskIdentifier(user.username)} activated a ${machine.name}!`,
          'referral'
        );
      }
    }

    db.addNotification(
      user.id,
      'Machine Activated Successfully! ⚡',
      `Your ${machine.name} is now live and contributing ${machine.computingPower} to the network. Yields are generated 24/7.`,
      'success'
    );

    db.logAudit(user.id, user.username, 'RENTAL_ACTIVATED', 'RENTAL', `Activated rental for ${machine.name} (UGX ${price.toLocaleString()})`);

    res.status(201).json({
      success: true,
      rental: newRental,
      walletBalanceUGX: user.walletBalanceUGX,
      message: `${machine.name} activated successfully!`
    });
  } catch (err: any) {
    console.error('Rent machine error:', err);
    res.status(500).json({ error: 'Failed to process machine rental.' });
  }
});

app.get('/api/rentals/my', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  db.calculateAccruedEarnings(user.id);

  const userRentals = db.rentals
    .filter(r => r.userId === user.id)
    .map(r => db.enrichRental(r))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  res.json({ rentals: userRentals });
});

app.post('/api/rentals/:id/claim', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  db.calculateAccruedEarnings(user.id);

  const rental = db.rentals.find(r => r.id === req.params.id && r.userId === user.id);
  if (!rental) {
    return res.status(404).json({ error: 'Rental not found.' });
  }

  const claimable = rental.unclaimedEarningsUGX;
  if (claimable <= 0) {
    return res.status(400).json({ error: 'No unclaimed yield available right now for this machine.' });
  }

  rental.claimedEarningsUGX += claimable;
  rental.unclaimedEarningsUGX = 0;

  user.walletBalanceUGX += claimable;
  user.totalEarningsUGX += claimable;
  user.todayEarningsUGX += claimable;

  const tx: Transaction = {
    id: `tx_claim_${Date.now()}`,
    userId: user.id,
    userName: user.username,
    type: 'machine_earnings',
    amountUGX: claimable,
    method: 'Machine Yield',
    status: 'completed',
    reference: `FT-CLAIM-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `Claimed computational yield from ${rental.machineName}`,
    createdAt: new Date().toISOString()
  };
  db.transactions.unshift(tx);

  db.addNotification(
    user.id,
    'Yield Claimed to Wallet',
    `UGX ${claimable.toLocaleString()} from ${rental.machineName} has been transferred to your available balance.`,
    'earnings'
  );

  db.logAudit(user.id, user.username, 'YIELD_CLAIMED', 'WALLET', `Claimed UGX ${claimable.toLocaleString()} from rental ${rental.id}`);

  res.json({
    success: true,
    claimedAmountUGX: claimable,
    walletBalanceUGX: user.walletBalanceUGX,
    rental
  });
});

app.post('/api/rentals/claim-all', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  db.calculateAccruedEarnings(user.id);

  const activeRentals = db.rentals.filter(r => r.userId === user.id && r.status === 'active');
  let totalClaimed = 0;

  activeRentals.forEach(r => {
    if (r.unclaimedEarningsUGX > 0) {
      totalClaimed += r.unclaimedEarningsUGX;
      r.claimedEarningsUGX += r.unclaimedEarningsUGX;
      r.unclaimedEarningsUGX = 0;
    }
  });

  if (totalClaimed <= 0) {
    return res.status(400).json({ error: 'No unclaimed computing yields available at this moment.' });
  }

  user.walletBalanceUGX += totalClaimed;
  user.totalEarningsUGX += totalClaimed;
  user.todayEarningsUGX += totalClaimed;

  db.transactions.unshift({
    id: `tx_claim_all_${Date.now()}`,
    userId: user.id,
    userName: user.username,
    type: 'machine_earnings',
    amountUGX: totalClaimed,
    method: 'Batch Yield Claim',
    status: 'completed',
    reference: `FT-YIELD-BATCH-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `Batch Claimed UGX ${totalClaimed.toLocaleString()} from ${activeRentals.length} active machines`,
    createdAt: new Date().toISOString()
  });

  db.addNotification(
    user.id,
    'All Computing Yields Claimed! ✨',
    `Transferred UGX ${totalClaimed.toLocaleString()} into your Available Balance.`,
    'earnings'
  );

  res.json({
    success: true,
    totalClaimedUGX: totalClaimed,
    walletBalanceUGX: user.walletBalanceUGX
  });
});

// 6. Earnings Dashboard Endpoints
app.get('/api/earnings/summary', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  db.calculateAccruedEarnings(user.id);

  const userRentals = db.rentals.filter(r => r.userId === user.id && r.status === 'active');
  const totalHashRate = userRentals.reduce((sum, r) => sum + r.hashRate, 0);
  const totalDailyYield = userRentals.reduce((sum, r) => sum + r.dailyEstimatedYieldUGX, 0);
  const totalUnclaimed = userRentals.reduce((sum, r) => sum + r.unclaimedEarningsUGX, 0);

  // Generate 7-day realistic chart history
  const chartHistory = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayLabel = i === 0 ? 'Today' : `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    const baseDaily = totalDailyYield > 0 ? totalDailyYield : 40500;
    // Tiny natural variance of ±3%
    const variance = (Math.sin(i * 1.5) * 0.04);
    const actual = Math.round(baseDaily * (1 + variance));
    chartHistory.push({
      date: dayLabel,
      actualEarningsUGX: actual,
      projectedEarningsUGX: baseDaily
    });
  }

  const activeMachineBreakdowns = userRentals.map(r => {
    const start = new Date(r.startDate).getTime();
    const end = new Date(r.endDate).getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    return {
      rentalId: r.id,
      machineName: r.machineName,
      tier: r.machineTier,
      dailyYieldUGX: r.dailyEstimatedYieldUGX,
      accumulatedUGX: r.accumulatedEarningsUGX,
      unclaimedUGX: r.unclaimedEarningsUGX,
      daysRemaining,
      efficiencyRate: 99.8 + (Math.random() * 0.18)
    };
  });

  const earningsSummary: EarningsSummary = {
    todayEarningsUGX: user.todayEarningsUGX || totalDailyYield,
    weeklyEarningsUGX: Math.round((user.todayEarningsUGX || totalDailyYield) * 6.8),
    monthlyEarningsUGX: user.totalEarningsUGX,
    totalEarningsUGX: user.totalEarningsUGX,
    withdrawableBalanceUGX: user.walletBalanceUGX,
    unclaimedMachineYieldUGX: totalUnclaimed,
    totalActiveMachines: userRentals.length,
    totalHashRateTHs: totalHashRate,
    actualVsEstimatedRatio: 0.998,
    chartHistory,
    activeMachineBreakdowns
  };

  res.json({ summary: earningsSummary });
});

// 7. Wallet & Payments Endpoints (MTN, Airtel, Bank)
app.post(['/api/wallet/deposit', '/api/deposits'], authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as User;
    const { amountUGX, tid, screenshotUrl, paymentMethod, phoneNumber } = req.body;

    const amount = Number(amountUGX);
    if (!amount || amount < 10000) {
      return res.status(400).json({ error: 'Minimum deposit amount is UGX 10,000.' });
    }

    if (amount > 10000000) {
      return res.status(400).json({ error: 'Maximum single deposit limit is UGX 10,000,000.' });
    }

    if (!tid || typeof tid !== 'string' || !tid.trim()) {
      return res.status(400).json({ error: 'TID / Transaction ID is required to verify your mobile money deposit.' });
    }

    const cleanTid = tid.trim();

    // Check for duplicate TID submission to prevent spamming
    const existingDepositWithTid = db.deposits.find(d => d.tid.toLowerCase() === cleanTid.toLowerCase());
    if (existingDepositWithTid) {
      return res.status(400).json({
        error: `A deposit with TID "${cleanTid}" has already been submitted (Status: ${existingDepositWithTid.status}). Please verify your transaction receipt.`
      });
    }

    const depositId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDeposit: DepositRecord = {
      id: depositId,
      userId: user.id,
      userName: user.username,
      userAccount: phoneNumber || user.phoneNumber || user.email,
      amountUGX: amount,
      tid: cleanTid,
      screenshotUrl: screenshotUrl || undefined,
      paymentMethod: paymentMethod || 'MTN / Airtel Mobile Money',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    db.deposits.unshift(newDeposit);

    // Note: Do not credit wallet balance here! The wallet remains unchanged until admin approves.

    db.addNotification(
      user.id,
      'Deposit Submitted (Pending Verification)',
      `Your deposit of UGX ${amount.toLocaleString()} (TID: ${cleanTid}) was received and is currently PENDING verification by administration. Payment instructions: Sent to 0795829784 (JAMADAH SSEMOGERERE).`,
      'info'
    );

    db.logAudit(
      user.id,
      user.username,
      'DEPOSIT_SUBMITTED',
      'WALLET',
      `Submitted deposit of UGX ${amount.toLocaleString()} with TID: ${cleanTid} (Pending Review)`
    );

    return res.status(201).json({
      success: true,
      deposit: newDeposit,
      walletBalanceUGX: user.walletBalanceUGX,
      message: 'Deposit submitted successfully! Your TID has been queued for admin verification.'
    });
  } catch (err: any) {
    console.error('Deposit submission error:', err);
    res.status(500).json({ error: 'Failed to submit deposit for verification.' });
  }
});

// Get logged-in user's deposit history
app.get(['/api/wallet/deposits', '/api/deposits/my'], authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const userDeposits = db.deposits
    .filter(d => d.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ deposits: userDeposits });
});

// Machine Purchase endpoint (using Wallet Balance)
app.post('/api/machines/purchase', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as User;
    const { machineId, quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity) || 1);

    if (!machineId) {
      return res.status(400).json({ error: 'Machine ID is required.' });
    }

    const machine = db.machines.find(m => m.id === machineId);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found.' });
    }

    if (!machine.isAvailable) {
      return res.status(400).json({ error: 'This machine is currently not active or available for purchase.' });
    }

    const available = machine.quantity !== undefined ? machine.quantity : machine.availableUnits;
    if (available < qty) {
      return res.status(400).json({ error: `Only ${available} unit(s) remaining for this machine.` });
    }

    const price = machine.rentalPriceUGX || machine.priceUGX || 30000;
    const totalCost = price * qty;

    // Check if user's wallet balance >= totalCost
    if (user.walletBalanceUGX < totalCost) {
      return res.status(400).json({
        error: `Insufficient wallet balance. Please make a deposit first. (Required: UGX ${totalCost.toLocaleString()}, Available: UGX ${user.walletBalanceUGX.toLocaleString()})`
      });
    }

    // Deduct machine price from user's wallet balance
    const balanceBefore = user.walletBalanceUGX;
    user.walletBalanceUGX -= totalCost;
    const balanceAfter = user.walletBalanceUGX;

    // Create machine purchase record
    const purchase: MachinePurchaseRecord = {
      id: `pur_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.username,
      userPhone: user.phoneNumber,
      machineId: machine.id,
      machineName: machine.name,
      machineTier: machine.tier,
      priceUGX: price,
      quantity: qty,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    db.purchases.unshift(purchase);

    // Decrease available quantity, increase total machines sold
    machine.availableUnits = Math.max(0, machine.availableUnits - qty);
    machine.quantity = machine.availableUnits;
    machine.soldQuantity = (machine.soldQuantity || 0) + qty;

    // Create active rental/ownership records for user (in My Machines)
    const startDate = new Date();
    const endDate = new Date(Date.now() + machine.durationDays * 24 * 60 * 60 * 1000);
    const sched = db.getTierScheduleInfo(machine.tier);

    let firstRental: MachineRental | null = null;
    for (let i = 0; i < qty; i++) {
      const rental: MachineRental = {
        id: `rnt_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        machineId: machine.id,
        machineName: machine.name,
        machineTier: machine.tier,
        computingPower: machine.computingPower,
        hashRate: machine.hashRate,
        rentalPriceUGX: price,
        dailyEstimatedYieldUGX: machine.dailyEstimatedYieldUGX,
        accumulatedEarningsUGX: 0,
        claimedEarningsUGX: 0,
        unclaimedEarningsUGX: 0,
        durationDays: machine.durationDays,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        lastYieldTick: startDate.toISOString(),
        workingDaysSchedule: sched.workingDaysSchedule,
        workingDaysPerWeek: sched.workingDaysPerWeek,
        weekendStatus: sched.weekendStatus,
        isWorkingToday: db.isDayActiveForTier(machine.tier, new Date().getDay(), sched.workingDaysSchedule),
        nextUpdateAt: '12:00 PM'
      };
      db.rentals.unshift(rental);
      if (!firstRental) firstRental = rental;
    }

    // Create wallet transaction record with balanceBefore & balanceAfter
    const tx: Transaction = {
      id: `tx_pur_${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'machine_purchase',
      amountUGX: totalCost,
      method: 'Wallet Balance',
      status: 'completed',
      reference: `FT-BUY-${machine.tier.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      description: `Purchased ${machine.name} (${qty} unit${qty > 1 ? 's' : ''})`,
      balanceBefore,
      balanceAfter,
      createdAt: new Date().toISOString()
    };
    db.transactions.unshift(tx);

    // Referral commission (5%) if referred
    if (user.referredBy) {
      const referrer = db.users.find(u => u.id === user.referredBy);
      if (referrer) {
        const commission = Math.round(totalCost * 0.05);
        referrer.walletBalanceUGX += commission;
        referrer.totalEarningsUGX += commission;

        const refRecord = db.referrals.find(r => r.referrerId === referrer.id && r.referredUserId === user.id);
        if (refRecord) {
          refRecord.hasActiveMachine = true;
          refRecord.rentalCount = (refRecord.rentalCount || 0) + qty;
          refRecord.status = 'active';
          refRecord.rewardAmountUGX = (refRecord.rewardAmountUGX || 0) + commission;
          refRecord.rewardStatus = 'credited';
        }

        db.transactions.unshift({
          id: `tx_ref_${Date.now()}`,
          userId: referrer.id,
          userName: referrer.username,
          type: 'referral_bonus',
          amountUGX: commission,
          method: 'Referral Incentive',
          status: 'completed',
          reference: `FT-REF-BUY-${Math.floor(100000 + Math.random() * 900000)}`,
          description: `5% Referral Commission from ${maskIdentifier(user.username)} purchasing ${machine.name}`,
          balanceBefore: referrer.walletBalanceUGX - commission,
          balanceAfter: referrer.walletBalanceUGX,
          createdAt: new Date().toISOString()
        });

        db.addNotification(
          referrer.id,
          'Referral Bonus Earned! 🚀',
          `You received UGX ${commission.toLocaleString()} because ${maskIdentifier(user.username)} purchased ${machine.name}!`,
          'referral'
        );
      }
    }

    // Notification to user
    db.addNotification(
      user.id,
      'Machine Purchase Successful! ⚡',
      `Your purchase of ${machine.name} (${qty} unit${qty > 1 ? 's' : ''}) was successful. The machine is now active in My Machines.`,
      'success'
    );

    db.logAudit(user.id, user.username, 'MACHINE_PURCHASED', 'RENTAL', `Purchased ${qty}x ${machine.name} for UGX ${totalCost.toLocaleString()}`);

    return res.status(201).json({
      success: true,
      purchase,
      rental: firstRental,
      walletBalanceUGX: user.walletBalanceUGX,
      message: `Machine purchase successful! Your ${machine.name} is now active in My Machines.`
    });
  } catch (err: any) {
    console.error('Purchase machine error:', err);
    return res.status(500).json({ error: 'Failed to process machine purchase.' });
  }
});

app.post('/api/wallet/withdraw', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user as User;
    const { amountUGX, paymentMethod, recipientPhone, recipientName, recipientBank, recipientAccount } = req.body;

    const amount = Number(amountUGX);
    if (!amount || amount < 20000) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is UGX 20,000.' });
    }

    if (user.walletBalanceUGX < amount) {
      return res.status(400).json({
        error: `Insufficient available balance. You requested UGX ${amount.toLocaleString()}, but your available balance is UGX ${user.walletBalanceUGX.toLocaleString()}.`
      });
    }

    // Deduct 15% of the withdrawal amount requested
    const feePercent = db.settings.withdrawalFeePercent || 15;
    const fee = Math.round(amount * (feePercent / 100));
    const netAmount = amount - fee; // Net amount user receives in their mobile money account

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required.' });
    }

    if ((paymentMethod.includes('MTN') || paymentMethod.includes('Airtel') || paymentMethod.includes('mobile_money')) && !recipientPhone) {
      return res.status(400).json({ error: 'Registered mobile money phone number is required.' });
    }

    user.walletBalanceUGX -= amount;
    user.totalWithdrawnUGX += amount;

    const reference = `FT-WTH-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx: Transaction = {
      id: `tx_wth_${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'withdrawal',
      amountUGX: amount,
      method: paymentMethod,
      status: 'completed', // instant verified telecom payout
      reference,
      description: `Withdrawal to ${paymentMethod} (${recipientPhone || recipientAccount}) [15% Fee: UGX ${fee.toLocaleString()} • Net Dispatched: UGX ${netAmount.toLocaleString()}]`,
      createdAt: new Date().toISOString(),
      accountDetails: recipientPhone ? `${recipientPhone} (${recipientName || 'Account Holder'})` : `${recipientBank} - ${recipientAccount} (${recipientName})`
    };

    db.transactions.unshift(newTx);

    db.addNotification(
      user.id,
      'Withdrawal Processed Successfully',
      `Withdrawal of UGX ${amount.toLocaleString()} processed! UGX ${netAmount.toLocaleString()} (after 15% deduction: UGX ${fee.toLocaleString()}) has been dispatched to your ${paymentMethod} account (${recipientPhone || recipientAccount}).`,
      'info'
    );

    db.logAudit(user.id, user.username, 'WITHDRAWAL_PROCESSED', 'WALLET', `Withdrew UGX ${amount.toLocaleString()} (Net: UGX ${netAmount.toLocaleString()} after 15% fee) via ${paymentMethod}`);

    res.json({
      success: true,
      reference,
      amountUGX: amount,
      feeUGX: fee,
      feePercent,
      netAmountUGX: netAmount,
      walletBalanceUGX: user.walletBalanceUGX,
      message: `Withdrawal of UGX ${amount.toLocaleString()} processed! UGX ${netAmount.toLocaleString()} (after 15% deduction) dispatched to your recipient account.`
    });
  } catch (err: any) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
});

app.get('/api/wallet/transactions', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const userTransactions = db.transactions
    .filter(t => t.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ transactions: userTransactions });
});

// 8. Notifications Endpoints
app.get('/api/notifications', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const userNotifications = db.notifications
    .filter(n => n.userId === user.id || n.userId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ notifications: userNotifications });
});

app.post('/api/notifications/read/:id', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const notif = db.notifications.find(n => n.id === req.params.id && (n.userId === user.id || n.userId === 'all'));
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  db.notifications.forEach(n => {
    if (n.userId === user.id || n.userId === 'all') {
      n.read = true;
    }
  });
  res.json({ success: true });
});

// 9. AI Node Advisor & Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are FUTURE TECH AI Core, the technical computing and node intelligence assistant for the FUTURE TECH computing machine rental platform.
About the company:
- FUTURE TECH is a premier high-technology enterprise originating in China, recognized globally for advanced computing cluster architecture and tensor matrix infrastructure.
- FUTURE TECH has officially opened its official new branch in Uganda, operating under a landmark 20-year government contract with the Republic of Uganda to pioneer cloud computing machine rentals, technological empowerment, and daily earnings.

You assist users with:
1. Explaining the 20-year Uganda Government contract and China-Uganda technological partnership.
2. Understanding the computing tiers: GOLD CPU, SILVER CPU, and NORMAL CPU with their respective TH/s power and daily estimated yields.
3. Calculating estimated computational yields and rental ROI clearly marked as estimates.
4. Explaining Uganda payment options: MTN Mobile Money (*165#), Airtel Money (*185#), and Bank Cards in UGX.
5. Explaining the Special Referral Link program (FT- codes) and 5% commission system.
6. Node hardware telemetry, uptime standards, and cloud matrix acceleration.

Be concise, futuristic, confident, transparent, and helpful. Use high-tech formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}`
        });

        if (response.text) {
          return res.json({ response: response.text });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call warning, falling back to smart heuristic core:', geminiErr);
      }
    }

    // Fallback AI heuristic knowledge base
    const lower = message.toLowerCase();
    let reply = '';
    if (lower.includes('gold') || lower.includes('titan')) {
      reply = `**GOLD CPU (Quantum Titan X-900)** is our premier enterprise tier featuring 256 Liquid Cryo Cores and 480 TH/s computing power. Rental price is UGX 450,000 for 30 days, yielding an estimated ~UGX 31,500/day. Perfect for heavy tensor calculations and maximum yields.`;
    } else if (lower.includes('silver') || lower.includes('matrix')) {
      reply = `**SILVER CPU (Matrix Reactor S-500)** provides 180 TH/s dual-die compute power. Rental price is UGX 150,000 for 30 days with estimated ~UGX 9,000/day return. Highly balanced performance-to-cost ratio.`;
    } else if (lower.includes('normal') || lower.includes('starter')) {
      reply = `**NORMAL CPU (Core Titanium N-200)** is the ideal starter computing node with 65 TH/s power at UGX 50,000 for 30 days (~UGX 2,500/day estimate). Instant activation and zero configuration needed.`;
    } else if (lower.includes('referral') || lower.includes('invite') || lower.includes('special link')) {
      reply = `Every user receives a unique **Personal Special Link** (e.g. \`futuretech.com/join/FT-XXXXXX\`). When friends register through your link, they are automatically linked to your account. You earn a 5% commission whenever they activate a computing machine, credited directly to your withdrawable wallet!`;
    } else if (lower.includes('deposit') || lower.includes('withdraw') || lower.includes('mtn') || lower.includes('airtel') || lower.includes('payment')) {
      reply = `FUTURE TECH integrates directly with **MTN Mobile Money**, **Airtel Money**, and **Bank Cards**. Deposits start at UGX 10,000, and withdrawals start at UGX 20,000 with instant telecom settlement. All transactions are cryptographically verified by the backend.`;
    } else {
      reply = `**FUTURE TECH Node Core v4.2 Status: Optimal.**\nAll compute clusters are operating at 99.94% efficiency. You can access machines, view your live invite stats, or claim accrued computational yields directly from the dashboard. How can I assist your computing setup today?`;
    }

    res.json({ response: reply });
  } catch (err: any) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to process AI query.' });
  }
});

// 10. Admin Endpoints
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Please enter the administrator password.' });
    }

    const expectedAdminPassword = process.env.ADMIN_PASSWORD || '0000000000';
    const adminIdentifier = (username || 'kabandaaiman').trim().toLowerCase();

    // Check if user is the seeded admin or if the password matches ADMIN_PASSWORD
    const adminUser = db.users.find(u => u.role === 'admin' && (u.username.toLowerCase() === adminIdentifier || u.email.toLowerCase() === adminIdentifier));

    let isValid = false;
    if (adminUser) {
      const hashed = db.passwords.get(adminUser.id);
      if (hashed && hashed === hashPassword(password)) {
        isValid = true;
      } else if (password === expectedAdminPassword) {
        isValid = true;
      }
    } else if (password === expectedAdminPassword) {
      const defaultAdmin = db.users.find(u => u.role === 'admin');
      if (defaultAdmin) {
        isValid = true;
      }
    }

    if (!isValid) {
      db.logAudit('system', 'guest_admin_attempt', 'FAILED_ADMIN_LOGIN', 'SECURITY', `Failed admin login attempt for identifier: ${username || 'anonymous'}`);
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const admin = adminUser || db.users.find(u => u.role === 'admin')!;
    const token = `tok_admin_${crypto.randomBytes(32).toString('hex')}`;
    db.sessions.set(token, admin.id);

    db.logAudit(admin.id, admin.username, 'ADMIN_LOGIN_SUCCESS', 'AUTH', 'Administrator logged into admin platform');

    const inviteStats = db.getInviteStats(admin.id);

    return res.json({
      success: true,
      token,
      user: admin,
      inviteStats,
      message: 'Administrator session authenticated.'
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Failed to authenticate administrator.' });
  }
});

app.post('/api/admin/logout', authenticateUser, requireAdmin, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.sessions.delete(token);
  }
  const admin = (req as any).user as User;
  db.logAudit(admin.id, admin.username, 'ADMIN_LOGOUT', 'AUTH', 'Administrator logged out of admin platform');
  res.json({ success: true, message: 'Admin logged out successfully.' });
});

app.get('/api/admin/overview', authenticateUser, requireAdmin, (req, res) => {
  const totalDeposited = db.users.reduce((sum, u) => sum + u.totalDepositedUGX, 0);
  const totalWithdrawn = db.users.reduce((sum, u) => sum + u.totalWithdrawnUGX, 0);
  const totalEarningsPaid = db.users.reduce((sum, u) => sum + u.totalEarningsUGX, 0);
  const activeRentals = db.rentals.filter(r => r.status === 'active');
  const totalHashRate = activeRentals.reduce((sum, r) => sum + r.hashRate, 0);
  const pendingTxs = db.transactions.filter(t => t.status === 'pending');

  const pendingDeposits = db.deposits.filter(d => d.status === 'PENDING');
  const approvedDeposits = db.deposits.filter(d => d.status === 'APPROVED');
  const rejectedDeposits = db.deposits.filter(d => d.status === 'REJECTED');

  const totalMachinesSold = db.machines.reduce((sum, m) => sum + (m.soldQuantity || 0), 0);
  const totalMachinesAvailable = db.machines.reduce((sum, m) => sum + (m.quantity !== undefined ? m.quantity : m.availableUnits), 0);
  const totalMachinePurchases = db.purchases.length;
  const totalValueMachinePurchasesUGX = db.purchases.reduce((sum, p) => sum + (p.priceUGX * (p.quantity || 1)), 0);

  // Find most purchased machine
  let mostPurchasedMachine = 'None';
  if (db.machines.length > 0) {
    const sorted = [...db.machines].sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
    mostPurchasedMachine = sorted[0].name;
  }

  const stats: AdminOverviewStats = {
    totalUsersCount: db.users.length,
    activeUsersCount: db.users.filter(u => u.status === 'active').length,
    totalPlatformRevenueUGX: totalDeposited,
    totalDepositedUGX: totalDeposited,
    totalWithdrawnUGX: totalWithdrawn,
    totalEarningsPaidUGX: totalEarningsPaid,
    activeRentalsCount: activeRentals.length,
    totalHashRateTHs: totalHashRate,
    pendingWithdrawalsCount: pendingTxs.filter(t => t.type === 'withdrawal').length,
    pendingDepositsCount: pendingDeposits.length,
    approvedDepositsCount: approvedDeposits.length,
    rejectedDepositsCount: rejectedDeposits.length,
    totalMachinesSold,
    totalMachinesAvailable,
    totalMachinePurchases,
    totalValueMachinePurchasesUGX,
    mostPurchasedMachine,
    totalPlatformInvites: db.referrals.length,
    successfulInvitesCount: db.referrals.filter(r => r.status === 'active' || r.status === 'registered').length,
    totalUsers: db.users.length,
    activeRentals: activeRentals.length,
    totalHashRate: totalHashRate,
    totalReferralsRewardUGX: db.referrals.reduce((sum, r) => sum + r.rewardAmountUGX, 0),
    totalYieldsClaimedUGX: totalEarningsPaid
  };

  res.json({ stats });
});

app.get('/api/admin/dashboard', authenticateUser, requireAdmin, (req, res) => {
  const totalDeposited = db.users.reduce((sum, u) => sum + u.totalDepositedUGX, 0);
  const totalWithdrawn = db.users.reduce((sum, u) => sum + u.totalWithdrawnUGX, 0);
  const totalEarningsPaid = db.users.reduce((sum, u) => sum + u.totalEarningsUGX, 0);
  const activeRentals = db.rentals.filter(r => r.status === 'active');
  const totalHashRate = activeRentals.reduce((sum, r) => sum + r.hashRate, 0);
  const pendingTxs = db.transactions.filter(t => t.status === 'pending');

  const pendingDeposits = db.deposits.filter(d => d.status === 'PENDING');
  const approvedDeposits = db.deposits.filter(d => d.status === 'APPROVED');
  const rejectedDeposits = db.deposits.filter(d => d.status === 'REJECTED');

  const totalMachinesSold = db.machines.reduce((sum, m) => sum + (m.soldQuantity || 0), 0);
  const totalMachinesAvailable = db.machines.reduce((sum, m) => sum + (m.quantity !== undefined ? m.quantity : m.availableUnits), 0);
  const totalMachinePurchases = db.purchases.length;
  const totalValueMachinePurchasesUGX = db.purchases.reduce((sum, p) => sum + (p.priceUGX * (p.quantity || 1)), 0);

  let mostPurchasedMachine = 'None';
  if (db.machines.length > 0) {
    const sorted = [...db.machines].sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
    mostPurchasedMachine = sorted[0].name;
  }

  const stats: AdminOverviewStats = {
    totalUsersCount: db.users.length,
    activeUsersCount: db.users.filter(u => u.status === 'active').length,
    totalPlatformRevenueUGX: totalDeposited,
    totalDepositedUGX: totalDeposited,
    totalWithdrawnUGX: totalWithdrawn,
    totalEarningsPaidUGX: totalEarningsPaid,
    activeRentalsCount: activeRentals.length,
    totalHashRateTHs: totalHashRate,
    pendingWithdrawalsCount: pendingTxs.filter(t => t.type === 'withdrawal').length,
    pendingDepositsCount: pendingDeposits.length,
    approvedDepositsCount: approvedDeposits.length,
    rejectedDepositsCount: rejectedDeposits.length,
    totalMachinesSold,
    totalMachinesAvailable,
    totalMachinePurchases,
    totalValueMachinePurchasesUGX,
    mostPurchasedMachine,
    totalPlatformInvites: db.referrals.length,
    successfulInvitesCount: db.referrals.filter(r => r.status === 'active' || r.status === 'registered').length,
    totalUsers: db.users.length,
    activeRentals: activeRentals.length,
    totalHashRate: totalHashRate,
    totalReferralsRewardUGX: db.referrals.reduce((sum, r) => sum + r.rewardAmountUGX, 0),
    totalYieldsClaimedUGX: totalEarningsPaid
  };

  res.json({ stats });
});

app.get('/api/admin/rentals', authenticateUser, requireAdmin, (req, res) => {
  const enrichedRentals = db.rentals.map(r => {
    const user = db.users.find(u => u.id === r.userId);
    return {
      ...r,
      userName: user ? user.username : 'Unknown',
      userEmail: user ? user.email : '',
      userPhone: user ? user.phoneNumber : ''
    };
  });
  res.json({ rentals: enrichedRentals });
});

app.patch('/api/admin/rentals/:id', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const rental = db.rentals.find(r => r.id === req.params.id);
  if (!rental) return res.status(404).json({ error: 'Rental record not found.' });

  const { status } = req.body;
  if (status) {
    rental.status = status;
    db.logAudit(admin.id, admin.username, 'RENTAL_STATUS_UPDATED', 'RENTAL', `Rental ${rental.id} status changed to ${status}`);
  }
  res.json({ success: true, rental });
});

app.get('/api/admin/settings', authenticateUser, requireAdmin, (req, res) => {
  res.json({ settings: db.settings });
});

app.patch('/api/admin/settings', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  Object.assign(db.settings, req.body);
  db.logAudit(admin.id, admin.username, 'SETTINGS_UPDATED', 'ADMIN', 'Platform settings modified');
  res.json({ success: true, settings: db.settings });
});

app.put('/api/admin/settings', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  Object.assign(db.settings, req.body);
  db.logAudit(admin.id, admin.username, 'SETTINGS_UPDATED', 'ADMIN', 'Platform settings modified');
  res.json({ success: true, settings: db.settings });
});

app.get('/api/admin/users', authenticateUser, requireAdmin, (req, res) => {
  const sanitizedUsers = db.users.map(u => ({
    ...u,
    inviteStats: db.getInviteStats(u.id),
    activeRentalsCount: db.rentals.filter(r => r.userId === u.id && r.status === 'active').length,
    pendingDepositsCount: db.deposits.filter(d => d.userId === u.id && d.status === 'PENDING').length,
    pendingDepositsUGX: db.deposits.filter(d => d.userId === u.id && d.status === 'PENDING').reduce((sum, d) => sum + d.amountUGX, 0),
    approvedDepositsUGX: db.deposits.filter(d => d.userId === u.id && d.status === 'APPROVED').reduce((sum, d) => sum + d.amountUGX, 0),
    machinePurchasesCount: db.purchases.filter(p => p.userId === u.id).length
  }));
  res.json({ users: sanitizedUsers });
});

// Admin User Detailed Profile & History
app.get('/api/admin/users/:id/details', authenticateUser, requireAdmin, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const deposits = db.deposits.filter(d => d.userId === user.id);
  const purchases = db.purchases.filter(p => p.userId === user.id);
  const rentals = db.rentals.filter(r => r.userId === user.id);
  const transactions = db.transactions.filter(t => t.userId === user.id);
  const referrals = db.referrals.filter(r => r.referrerId === user.id);

  res.json({
    user,
    deposits,
    purchases,
    rentals,
    transactions,
    referrals
  });
});

app.post('/api/admin/users/:id/toggle-status', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.status = user.status === 'active' ? 'suspended' : 'active';
  db.logAudit(admin.id, admin.username, 'USER_STATUS_TOGGLED', 'ADMIN', `User ${user.username} status set to ${user.status}`);

  res.json({ success: true, user });
});

// Admin Deposit Management Endpoints
app.get('/api/admin/deposits', authenticateUser, requireAdmin, (req, res) => {
  const statusFilter = (req.query.status as string || 'all').toUpperCase();

  let deposits = [...db.deposits];
  if (statusFilter !== 'ALL') {
    deposits = deposits.filter(d => d.status.toUpperCase() === statusFilter);
  }

  // Enrich with user phone / email if missing
  const enriched = deposits.map(d => {
    const u = db.users.find(user => user.id === d.userId);
    return {
      ...d,
      userName: d.userName || (u ? u.username : 'Unknown User'),
      userAccount: d.userAccount || (u ? (u.phoneNumber || u.email) : 'N/A'),
      currentUserBalance: u ? u.walletBalanceUGX : 0
    };
  });

  res.json({ deposits: enriched });
});

// Approve Pending Deposit
app.post('/api/admin/deposits/:id/approve', authenticateUser, requireAdmin, (req, res) => {
  try {
    const admin = (req as any).user as User;
    const depositId = req.params.id;
    const { adminNote } = req.body;

    const deposit = db.deposits.find(d => d.id === depositId);
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit record not found.' });
    }

    if (deposit.status !== 'PENDING') {
      return res.status(400).json({
        error: `Deposit has already been processed with status "${deposit.status}". Duplicate approvals are strictly prohibited.`
      });
    }

    const user = db.users.find(u => u.id === deposit.userId);
    if (!user) {
      return res.status(404).json({ error: 'Associated user account not found.' });
    }

    // 1. Mark deposit as APPROVED
    deposit.status = 'APPROVED';
    deposit.approvedBy = admin.username;
    deposit.approvedAt = new Date().toISOString();
    deposit.adminNote = adminNote || 'Approved after mobile money statement verification';

    // 2. Add approved amount to user's wallet balance
    const balanceBefore = user.walletBalanceUGX;
    user.walletBalanceUGX += deposit.amountUGX;
    user.totalDepositedUGX += deposit.amountUGX;
    const balanceAfter = user.walletBalanceUGX;

    // 3. Create wallet transaction record with Balance Before & Balance After
    const tx: Transaction = {
      id: `tx_dep_${Date.now()}`,
      userId: user.id,
      userName: user.username,
      type: 'deposit',
      amountUGX: deposit.amountUGX,
      method: deposit.paymentMethod || 'MTN / Airtel Mobile Money',
      status: 'completed',
      reference: deposit.tid,
      tid: deposit.tid,
      description: `Deposit via ${deposit.paymentMethod || 'Mobile Money'} (TID: ${deposit.tid}) - Approved by ${admin.username}`,
      balanceBefore,
      balanceAfter,
      createdAt: new Date().toISOString(),
      reviewedBy: admin.username,
      reviewedAt: new Date().toISOString(),
      accountDetails: deposit.userAccount || '0795829784 (JAMADAH SSEMOGERERE)'
    };
    db.transactions.unshift(tx);

    // 4. Send in-app notification to user
    db.addNotification(
      user.id,
      'Deposit Approved! 💰',
      `Your deposit of UGX ${deposit.amountUGX.toLocaleString()} (TID: ${deposit.tid}) has been verified and added to your wallet balance. New Balance: UGX ${user.walletBalanceUGX.toLocaleString()}.`,
      'success'
    );

    // 5. Audit log
    db.logAudit(
      admin.id,
      admin.username,
      'DEPOSIT_APPROVED',
      'ADMIN',
      `Approved deposit of UGX ${deposit.amountUGX.toLocaleString()} for user "${user.username}" (TID: ${deposit.tid})`
    );

    res.json({
      success: true,
      deposit,
      userWalletBalanceUGX: user.walletBalanceUGX,
      message: `Deposit of UGX ${deposit.amountUGX.toLocaleString()} approved and credited to ${user.username}'s wallet.`
    });
  } catch (err: any) {
    console.error('Approve deposit error:', err);
    res.status(500).json({ error: 'Failed to approve deposit.' });
  }
});

// Reject Pending Deposit
app.post('/api/admin/deposits/:id/reject', authenticateUser, requireAdmin, (req, res) => {
  try {
    const admin = (req as any).user as User;
    const depositId = req.params.id;
    const { rejectionReason, reason: reqReason, adminNote } = req.body;

    const deposit = db.deposits.find(d => d.id === depositId);
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit record not found.' });
    }

    if (deposit.status !== 'PENDING') {
      return res.status(400).json({
        error: `Deposit has already been processed with status "${deposit.status}".`
      });
    }

    const reason = (rejectionReason || reqReason || 'TID could not be verified in mobile money statement or amount did not match').trim();

    // 1. Mark deposit as REJECTED
    deposit.status = 'REJECTED';
    deposit.rejectionReason = reason;
    deposit.adminNote = adminNote || undefined;
    deposit.approvedBy = admin.username;
    deposit.approvedAt = new Date().toISOString();

    // Note: Do NOT add money to user's wallet!

    // 2. Send in-app notification to user
    db.addNotification(
      deposit.userId,
      'Deposit Rejected ⚠️',
      `Your deposit submission of UGX ${deposit.amountUGX.toLocaleString()} (TID: ${deposit.tid}) was rejected. Reason: ${reason}. Please contact support or re-submit with the correct TID.`,
      'alert'
    );

    // 3. Audit log
    db.logAudit(
      admin.id,
      admin.username,
      'DEPOSIT_REJECTED',
      'ADMIN',
      `Rejected deposit ${deposit.id} (TID: ${deposit.tid}) for user ${deposit.userName}. Reason: ${reason}`
    );

    res.json({
      success: true,
      deposit,
      message: 'Deposit rejected successfully. Reason recorded in history.'
    });
  } catch (err: any) {
    console.error('Reject deposit error:', err);
    res.status(500).json({ error: 'Failed to reject deposit.' });
  }
});

// Admin Purchases & Sales Monitoring Endpoints
app.get('/api/admin/purchases', authenticateUser, requireAdmin, (req, res) => {
  const { machineId, userId, status } = req.query;

  let list = [...db.purchases];
  if (machineId) list = list.filter(p => p.machineId === machineId);
  if (userId) list = list.filter(p => p.userId === userId);
  if (status) list = list.filter(p => p.status === status);

  res.json({ purchases: list });
});

// Admin Machine Analytics & Inventory
app.get('/api/admin/analytics/machines', authenticateUser, requireAdmin, (req, res) => {
  const totalMachinesSold = db.machines.reduce((sum, m) => sum + (m.soldQuantity || 0), 0);
  const totalMachinesAvailable = db.machines.reduce((sum, m) => sum + (m.quantity !== undefined ? m.quantity : m.availableUnits), 0);
  const totalMachinePurchases = db.purchases.length;
  const totalValueMachinePurchasesUGX = db.purchases.reduce((sum, p) => sum + (p.priceUGX * (p.quantity || 1)), 0);

  let mostPurchasedMachine = 'None';
  let maxSold = -1;
  for (const m of db.machines) {
    const sold = m.soldQuantity || 0;
    if (sold > maxSold) {
      maxSold = sold;
      mostPurchasedMachine = `${m.name} (${sold} units sold)`;
    }
  }

  // Purchases breakdown per machine
  const machineBreakdown = db.machines.map(m => ({
    id: m.id,
    name: m.name,
    tier: m.tier,
    priceUGX: m.rentalPriceUGX || m.priceUGX,
    availableUnits: m.quantity !== undefined ? m.quantity : m.availableUnits,
    soldQuantity: m.soldQuantity || 0,
    totalRevenueUGX: (m.rentalPriceUGX || m.priceUGX) * (m.soldQuantity || 0),
    isAvailable: m.isAvailable
  }));

  res.json({
    analytics: {
      totalMachinesSold,
      totalMachinesAvailable,
      totalMachinePurchases,
      totalValueMachinePurchasesUGX,
      mostPurchasedMachine,
      machineBreakdown,
      recentPurchases: db.purchases.slice(0, 10)
    }
  });
});

app.get('/api/admin/transactions', authenticateUser, requireAdmin, (req, res) => {
  res.json({ transactions: db.transactions });
});

app.post('/api/admin/transactions/:id/approve', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const tx = db.transactions.find(t => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found.' });

  tx.status = 'completed';
  tx.reviewedBy = admin.username;
  tx.reviewedAt = new Date().toISOString();

  db.logAudit(admin.id, admin.username, 'TRANSACTION_APPROVED', 'ADMIN', `Approved transaction ${tx.reference}`);
  res.json({ success: true, transaction: tx });
});

app.post('/api/admin/machines/create', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const machineData = req.body as Partial<Machine>;

  if (!machineData.name || !machineData.rentalPriceUGX || !machineData.tier) {
    return res.status(400).json({ error: 'Machine name, rental price, and tier are required.' });
  }

  const newMachine: Machine = {
    id: `cpu-custom-${Date.now()}`,
    tier: machineData.tier || 'normal',
    name: machineData.name,
    badge: machineData.badge || 'Custom Compute Cluster',
    tagline: machineData.tagline || 'High-performance cloud node.',
    description: machineData.description || 'Enterprise compute cluster.',
    computingPower: machineData.computingPower || '100 TH/s',
    hashRate: Number(machineData.hashRate) || 100,
    rentalPriceUGX: Number(machineData.rentalPriceUGX),
    rentalPriceUSD: Number(machineData.rentalPriceUSD) || Math.round(Number(machineData.rentalPriceUGX) / 3750),
    durationDays: Number(machineData.durationDays) || 30,
    dailyEstimatedYieldUGX: Number(machineData.dailyEstimatedYieldUGX) || Math.round(Number(machineData.rentalPriceUGX) * 0.06),
    dailyEstimatedYieldPercent: Number(machineData.dailyEstimatedYieldPercent) || 6.0,
    totalEstimatedYieldUGX: (Number(machineData.dailyEstimatedYieldUGX) || Math.round(Number(machineData.rentalPriceUGX) * 0.06)) * (Number(machineData.durationDays) || 30),
    totalEstimatedYieldPercent: 180,
    availableUnits: Number(machineData.availableUnits) || 20,
    totalUnits: Number(machineData.totalUnits) || 50,
    specifications: machineData.specifications || {
      cores: '64 Cores',
      architecture: 'Custom Tensor Grid',
      memory: '128 GB ECC',
      powerConsumption: '500W',
      cooling: 'Vapor Chamber',
      uptimeGuarantee: '99.9%',
      algorithm: 'Adaptive AI Compute'
    },
    terms: machineData.terms || ['Verified computing network output', 'Accrues daily yields in real-time'],
    workingDaysSchedule: machineData.workingDaysSchedule || 'Monday – Friday (5 Days / Week)',
    workingDaysPerWeek: machineData.workingDaysPerWeek || 5,
    weekendStatus: machineData.weekendStatus || 'Offline on Saturday & Sunday',
    updateTime: machineData.updateTime || 'Daily at 12:00 PM (Mon–Fri)',
    isAvailable: true
  };

  db.machines.push(newMachine);
  db.logAudit(admin.id, admin.username, 'MACHINE_CREATED', 'ADMIN', `Created machine ${newMachine.name}`);

  res.status(201).json({ success: true, machine: newMachine });
});

app.put('/api/admin/machines/:id', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const machine = db.machines.find(m => m.id === req.params.id);
  if (!machine) return res.status(404).json({ error: 'Machine not found.' });

  Object.assign(machine, req.body);
  db.logAudit(admin.id, admin.username, 'MACHINE_UPDATED', 'ADMIN', `Updated machine ${machine.name}`);

  res.json({ success: true, machine });
});

app.patch('/api/admin/machines/:id', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const machine = db.machines.find(m => m.id === req.params.id);
  if (!machine) return res.status(404).json({ error: 'Machine not found.' });

  Object.assign(machine, req.body);
  db.logAudit(admin.id, admin.username, 'MACHINE_UPDATED', 'ADMIN', `Updated machine ${machine.name}`);

  res.json({ success: true, machine });
});

app.post('/api/admin/machines', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const machineData = req.body as Partial<Machine>;

  if (!machineData.name || !machineData.rentalPriceUGX || !machineData.tier) {
    return res.status(400).json({ error: 'Machine name, rental price, and tier are required.' });
  }

  const newMachine: Machine = {
    id: `cpu-custom-${Date.now()}`,
    tier: machineData.tier || 'normal',
    name: machineData.name,
    badge: machineData.badge || 'Custom Compute Cluster',
    tagline: machineData.tagline || 'High-performance cloud node.',
    description: machineData.description || 'Enterprise compute cluster.',
    computingPower: machineData.computingPower || '100 TH/s',
    hashRate: Number(machineData.hashRate) || 100,
    rentalPriceUGX: Number(machineData.rentalPriceUGX),
    rentalPriceUSD: Number(machineData.rentalPriceUSD) || Math.round(Number(machineData.rentalPriceUGX) / 3750),
    durationDays: Number(machineData.durationDays) || 30,
    dailyEstimatedYieldUGX: Number(machineData.dailyEstimatedYieldUGX) || Math.round(Number(machineData.rentalPriceUGX) * 0.06),
    dailyEstimatedYieldPercent: Number(machineData.dailyEstimatedYieldPercent) || 6.0,
    totalEstimatedYieldUGX: (Number(machineData.dailyEstimatedYieldUGX) || Math.round(Number(machineData.rentalPriceUGX) * 0.06)) * (Number(machineData.durationDays) || 30),
    totalEstimatedYieldPercent: 180,
    availableUnits: Number(machineData.availableUnits) || 20,
    totalUnits: Number(machineData.totalUnits) || 50,
    specifications: machineData.specifications || {
      cores: '64 Cores',
      architecture: 'Custom Tensor Grid',
      memory: '128 GB ECC',
      powerConsumption: '500W',
      cooling: 'Vapor Chamber',
      uptimeGuarantee: '99.9%',
      algorithm: 'Adaptive AI Compute'
    },
    terms: machineData.terms || ['Verified computing network output', 'Accrues daily yields in real-time'],
    workingDaysSchedule: machineData.workingDaysSchedule || 'Monday – Friday (5 Days / Week)',
    workingDaysPerWeek: machineData.workingDaysPerWeek || 5,
    weekendStatus: machineData.weekendStatus || 'Offline on Saturday & Sunday',
    updateTime: machineData.updateTime || 'Daily at 12:00 PM (Mon–Fri)',
    isAvailable: true
  };

  db.machines.push(newMachine);
  db.logAudit(admin.id, admin.username, 'MACHINE_CREATED', 'ADMIN', `Created machine ${newMachine.name}`);

  res.status(201).json({ success: true, machine: newMachine });
});

app.delete('/api/admin/machines/:id', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const index = db.machines.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Machine not found.' });

  const removed = db.machines.splice(index, 1)[0];
  db.logAudit(admin.id, admin.username, 'MACHINE_DELETED', 'ADMIN', `Deleted machine ${removed.name}`);

  res.json({ success: true, message: 'Machine removed from catalog.' });
});

app.post('/api/admin/notifications/broadcast', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  const { title, message, type } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required for broadcast.' });
  }

  db.addNotification('all', title, message, type || 'info');
  db.logAudit(admin.id, admin.username, 'BROADCAST_SENT', 'ADMIN', `Broadcast notification: "${title}"`);

  res.json({ success: true, message: 'Broadcast notification dispatched to all users.' });
});

app.get('/api/admin/audit-logs', authenticateUser, requireAdmin, (req, res) => {
  res.json({ auditLogs: db.auditLogs });
});

app.get('/api/admin/referrals', authenticateUser, requireAdmin, (req, res) => {
  res.json({ referrals: db.referrals });
});

app.post('/api/admin/trigger-12pm-distribution', authenticateUser, requireAdmin, (req, res) => {
  const admin = (req as any).user as User;
  db.trigger12PMDailyDistribution();
  db.logAudit(admin.id, admin.username, '12PM_DISTRIBUTION_MANUAL_TRIGGER', 'ADMIN', 'Admin manually triggered 12:00 PM automated distribution');
  res.json({ success: true, message: '12:00 PM automated yield distribution executed successfully across active working machines.' });
});

// Automated 12:00 PM Background Cron Ticker
let last12PMProcessedDay = -1;

function setup12PMScheduler() {
  setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDate();

    // Check if 12:00 PM has arrived and not yet processed for today
    if (currentHour >= 12 && last12PMProcessedDay !== currentDay) {
      last12PMProcessedDay = currentDay;
      console.log(`[FUTURE TECH] Running automated 12:00 PM machine yield distribution for day ${currentDay}...`);
      db.trigger12PMDailyDistribution();
    } else {
      // Periodic micro-sync for real-time yield telemetry
      db.calculateAccruedEarnings();
    }
  }, 30000); // Checks every 30 seconds
}

// -------------------------------------------------------------
// Vite Middleware & Static Serving Setup
// -------------------------------------------------------------
async function startServer() {
  setup12PMScheduler();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FUTURE TECH Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
