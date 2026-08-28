import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  User,
  Machine,
  MachineRental,
  Transaction,
  InviteStats,
  ReferralRecord,
  NotificationItem,
  EarningsSummary,
  NodeTelemetry
} from './types';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './components/LandingPage';
import { DashboardHome } from './components/DashboardHome';
import { MachineMarketplace } from './components/MachineMarketplace';
import { MachineDetailModal } from './components/MachineDetailModal';
import { MyInvitesView } from './components/MyInvitesView';
import { EarningsDashboard } from './components/EarningsDashboard';
import { WalletView } from './components/WalletView';
import { AINodeView } from './components/AINodeView';
import { MyAccountView } from './components/MyAccountView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginView } from './components/AdminLoginView';
import { AuthModal } from './components/AuthModal';

export function App() {
  // Global User State
  const [user, setUser] = useState<User | null>(null);
  const [inviteStats, setInviteStats] = useState<InviteStats>({
    totalInvites: 0,
    successfulInvites: 0,
    pendingInvites: 0,
    activeInvites: 0,
    totalReferralRewardsUGX: 0
  });
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [telemetry, setTelemetry] = useState<NodeTelemetry | null>(null);

  // App Data State
  const [machines, setMachines] = useState<Machine[]>([]);
  const [myRentals, setMyRentals] = useState<MachineRental[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('register');
  const [detectedReferralCode, setDetectedReferralCode] = useState<string>('');

  // 1. Initial URL Path & Referral Code Detection
  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
      setActiveTab('admin-login');
      return;
    } else if (pathname === '/admin' || pathname.startsWith('/admin')) {
      const token = localStorage.getItem('future_tech_token');
      if (token) {
        setActiveTab('admin');
      } else {
        setActiveTab('admin-login');
      }
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const refFromQuery = urlParams.get('ref') || urlParams.get('r');
    
    // Also check pathname like /join/FT-8K29X4
    let refFromPath = '';
    if (pathname.includes('/join/')) {
      refFromPath = pathname.split('/join/')[1]?.split('/')[0] || '';
    }

    const detected = refFromQuery || refFromPath;
    if (detected) {
      setDetectedReferralCode(detected.toUpperCase());
      // Automatically prompt registration with detected code
      setAuthMode('register');
      setIsAuthModalOpen(true);
    }
  }, []);

  // 2. Fetch Machines catalog & Telemetry on load
  const loadPublicData = async () => {
    try {
      const [machRes, telemRes] = await Promise.all([
        api.getMachines(),
        api.getTelemetry()
      ]);
      setMachines(machRes.machines);
      setTelemetry(telemRes);
    } catch (e) {
      console.error('Error loading public data:', e);
    }
  };

  // 3. Sync User Session & Node Data
  const syncUserData = async () => {
    const token = localStorage.getItem('future_tech_token');
    if (!token) return;

    try {
      const meRes = await api.getMe();
      setUser(meRes.user);
      setInviteStats(meRes.inviteStats);
      setNotifications(meRes.notifications);
      setUnreadCount(meRes.unreadNotificationsCount);

      // Fetch rentals, transactions, invites, earnings
      const [rentalsRes, txsRes, invitesRes, earningsRes] = await Promise.all([
        api.getMyRentals(),
        api.getTransactions(),
        api.getMyInvites(),
        api.getEarningsSummary()
      ]);

      setMyRentals(rentalsRes.rentals);
      setTransactions(txsRes.transactions);
      setReferrals(invitesRes.referrals);
      setEarningsSummary(earningsRes.summary);

      if (meRes.user.role === 'admin' && (window.location.pathname.startsWith('/admin') || activeTab === 'admin' || activeTab === 'admin-login')) {
        setActiveTab('admin');
      } else if (activeTab === 'landing') {
        setActiveTab('home');
      }
    } catch (err) {
      console.error('Session sync error:', err);
      localStorage.removeItem('future_tech_token');
      setUser(null);
      if (activeTab === 'admin') {
        setActiveTab('admin-login');
      } else {
        setActiveTab('landing');
      }
    }
  };

  useEffect(() => {
    loadPublicData();
    syncUserData();

    // Auto-refresh telemetry & real-time yields tick every 10 seconds
    const interval = setInterval(() => {
      loadPublicData();
      if (localStorage.getItem('future_tech_token')) {
        syncUserData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handler: Select Machine to View / Rent
  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsMachineModalOpen(true);
  };

  // Handler: Confirm Rental / Purchase
  const handleConfirmRent = async (machineId: string, paymentMethod: 'wallet' | 'mobile_money', phone?: string) => {
    if (paymentMethod === 'wallet') {
      await api.purchaseMachine({ machineId, quantity: 1 });
    } else {
      await api.rentMachine({ machineId, paymentMethod, mobileMoneyPhone: phone });
    }
    await syncUserData();
  };

  // Handler: Deposit
  const handleDeposit = async (data: { amount: number; tid: string; screenshotUrl?: string; method?: string; phone?: string }) => {
    await api.deposit({
      amountUGX: data.amount,
      tid: data.tid,
      screenshotUrl: data.screenshotUrl,
      paymentMethod: data.method,
      phoneNumber: data.phone
    });
    await syncUserData();
  };

  // Handler: Withdraw
  const handleWithdraw = async (amount: number, method: string, phone?: string, name?: string) => {
    await api.withdraw({ amountUGX: amount, paymentMethod: method, recipientPhone: phone, recipientName: name });
    await syncUserData();
  };

  // Handler: Claim Yields
  const handleClaimAllYields = async () => {
    await api.claimAllYields();
    await syncUserData();
  };

  const handleClaimSingleYield = async (rentalId: string) => {
    await api.claimRentalYield(rentalId);
    await syncUserData();
  };

  // Handler: Notifications
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    await syncUserData();
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    await syncUserData();
  };

  // Handler: Logout
  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveTab('landing');
  };

  // Handler: Admin Logout
  const handleAdminLogout = async () => {
    try {
      await api.adminLogout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setActiveTab('admin-login');
  };

  const handleAdminLoginSuccess = (authedUser: User, stats: InviteStats) => {
    setUser(authedUser);
    setInviteStats(stats);
    setActiveTab('admin');
    syncUserData();
  };

  const isAdminView = activeTab === 'admin' || activeTab === 'admin-login';

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {isAdminView ? (
        /* Dedicated Admin Platform */
        <main className="w-full">
          {activeTab === 'admin' && user?.role === 'admin' ? (
            <AdminDashboard
              onBackToUserView={() => setActiveTab('home')}
              onLogoutAdmin={handleAdminLogout}
            />
          ) : (
            <AdminLoginView
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToHome={() => setActiveTab('landing')}
            />
          )}
        </main>
      ) : (
        <>
          {/* 1. Global Navigation Bar */}
          <Navbar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAuth={(mode = 'register') => {
              setAuthMode(mode);
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            telemetry={telemetry}
            onQuickDeposit={() => {
              if (user) {
                setActiveTab('wallet');
              } else {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }
            }}
            onAdminClick={() => setActiveTab('admin-login')}
          />

          {/* 2. Main Content Routing Views */}
          <main className="w-full">
            {/* Landing Page (Public / Guest view) */}
            {(!user || activeTab === 'landing') && (
              <LandingPage
                onGetStarted={() => {
                  if (user) {
                    setActiveTab('home');
                  } else {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }
                }}
                onLogin={() => {
                  if (user) {
                    setActiveTab('home');
                  } else {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }
                }}
                onExploreMachines={() => {
                  if (user) {
                    setActiveTab('machines');
                  } else {
                    const el = document.getElementById('machine-card-gold');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                machines={machines}
                onSelectMachine={handleSelectMachine}
                onAdminPortal={() => setActiveTab('admin-login')}
              />
            )}

            {/* Dashboard Home View */}
            {user && activeTab === 'home' && (
              <DashboardHome
                user={user}
                inviteStats={inviteStats}
                machines={machines}
                myRentals={myRentals}
                onNavigate={setActiveTab}
                onSelectMachine={handleSelectMachine}
                onDeposit={() => setActiveTab('wallet')}
                onWithdraw={() => setActiveTab('wallet')}
                onClaimAll={handleClaimAllYields}
              />
            )}

            {/* Machines Marketplace View */}
            {user && activeTab === 'machines' && (
              <MachineMarketplace
                machines={machines}
                user={user}
                onSelectMachine={handleSelectMachine}
              />
            )}

            {/* My Invites & Special Link View */}
            {user && activeTab === 'invites' && (
              <MyInvitesView
                user={user}
                inviteStats={inviteStats}
                referrals={referrals}
              />
            )}

            {/* Earnings & Telemetry Tracker View */}
            {user && activeTab === 'earnings' && (
              <EarningsDashboard
                user={user}
                myRentals={myRentals}
                earningsSummary={earningsSummary}
                onClaimAll={handleClaimAllYields}
                onClaimSingle={handleClaimSingleYield}
              />
            )}

            {/* Wallet & Payment Ledger View */}
            {user && activeTab === 'wallet' && (
              <WalletView
                user={user}
                transactions={transactions}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
              />
            )}

            {/* AI Node Intelligence View */}
            {user && activeTab === 'ai' && (
              <AINodeView telemetry={telemetry} />
            )}

            {/* My Account & Security View */}
            {user && activeTab === 'my' && (
              <MyAccountView
                user={user}
                inviteStats={inviteStats}
                onLogout={handleLogout}
                onNavigateToAdmin={user.role === 'admin' ? () => setActiveTab('admin') : undefined}
                onNavigateToInvites={() => setActiveTab('invites')}
              />
            )}
          </main>

          {/* 3. Bottom Mobile/Tablet Navigation Bar */}
          {user && (
            <BottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              unreadCount={unreadCount}
            />
          )}

          {/* 4. Machine Details & Rental Modal */}
          <MachineDetailModal
            machine={selectedMachine}
            user={user}
            isOpen={isMachineModalOpen}
            onClose={() => setIsMachineModalOpen(false)}
            onConfirmRent={handleConfirmRent}
            onOpenAuth={() => {
              setIsMachineModalOpen(false);
              setAuthMode('register');
              setIsAuthModalOpen(true);
            }}
            onOpenDeposit={() => {
              setIsMachineModalOpen(false);
              setActiveTab('wallet');
            }}
          />

          {/* 5. Authentication (Login / Register) Modal */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authMode}
            initialReferralCode={detectedReferralCode}
            onAuthSuccess={(authedUser, stats) => {
              setUser(authedUser);
              setInviteStats(stats);
              setActiveTab('home');
              syncUserData();
            }}
          />
        </>
      )}

    </div>
  );
}

export default App;
