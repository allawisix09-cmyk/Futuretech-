import {
  User,
  Machine,
  MachineRental,
  Transaction,
  ReferralRecord,
  InviteStats,
  NotificationItem,
  EarningsSummary,
  AdminOverviewStats,
  NodeTelemetry,
  PlatformSettings,
  DepositRecord,
  MachinePurchaseRecord
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('future_tech_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    referralCode?: string;
    agreedToTerms: boolean;
  }): Promise<{ success: boolean; token: string; user: User; inviteStats: InviteStats; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    localStorage.setItem('future_tech_token', json.token);
    return json;
  },

  async login(data: {
    identifier: string;
    password: string;
  }): Promise<{ success: boolean; token: string; user: User; inviteStats: InviteStats; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    localStorage.setItem('future_tech_token', json.token);
    return json;
  },

  async adminLogin(password: string, username?: string): Promise<{ success: boolean; token: string; user: User; inviteStats: InviteStats; message: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username: username || 'kabandaaiman' })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invalid administrator credentials.');
    localStorage.setItem('future_tech_token', json.token);
    return json;
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
    } finally {
      localStorage.removeItem('future_tech_token');
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update password');
    return json;
  },

  async resetPassword(identifier: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, newPassword })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reset password');
    return json;
  },

  async updateProfile(data: { email?: string; phoneNumber?: string }): Promise<{ success: boolean; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  },

  async getPublicSettings(): Promise<{ settings: PlatformSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to load settings');
    return json;
  },

  async getMe(): Promise<{
    user: User;
    inviteStats: InviteStats;
    notifications: NotificationItem[];
    unreadNotificationsCount: number;
  }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Session expired');
    return json;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
    } finally {
      localStorage.removeItem('future_tech_token');
    }
  },

  // Referrals
  async validateReferralCode(code: string): Promise<{ valid: boolean; code: string; username: string; maskedUsername: string }> {
    const res = await fetch(`${API_BASE}/referrals/validate-code/${encodeURIComponent(code)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Invalid referral code');
    return json;
  },

  async getMyInvites(): Promise<{
    inviteStats: InviteStats;
    referrals: ReferralRecord[];
    specialLink: string;
    referralCode: string;
  }> {
    const res = await fetch(`${API_BASE}/referrals/my-invites`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch invites');
    return json;
  },

  // Machines
  async getMachines(): Promise<{ machines: Machine[] }> {
    const res = await fetch(`${API_BASE}/machines`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch machines');
    return json;
  },

  async getMachine(id: string): Promise<{ machine: Machine }> {
    const res = await fetch(`${API_BASE}/machines/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Machine not found');
    return json;
  },

  // Rentals
  async rentMachine(data: {
    machineId: string;
    paymentMethod: 'wallet' | 'mobile_money';
    mobileMoneyPhone?: string;
  }): Promise<{ success: boolean; rental: MachineRental; walletBalanceUGX: number; message: string }> {
    const res = await fetch(`${API_BASE}/rentals/rent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to rent machine');
    return json;
  },

  async getMyRentals(): Promise<{ rentals: MachineRental[] }> {
    const res = await fetch(`${API_BASE}/rentals/my`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch rentals');
    return json;
  },

  async claimRentalYield(rentalId: string): Promise<{ success: boolean; claimedAmountUGX: number; walletBalanceUGX: number }> {
    const res = await fetch(`${API_BASE}/rentals/${rentalId}/claim`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to claim yield');
    return json;
  },

  async claimAllYields(): Promise<{ success: boolean; totalClaimedUGX: number; walletBalanceUGX: number }> {
    const res = await fetch(`${API_BASE}/rentals/claim-all`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to claim all yields');
    return json;
  },

  // Earnings
  async getEarningsSummary(): Promise<{ summary: EarningsSummary }> {
    const res = await fetch(`${API_BASE}/earnings/summary`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch earnings summary');
    return json;
  },

  // Wallet & Payments
  async deposit(data: {
    amountUGX: number;
    tid: string;
    screenshotUrl?: string;
    paymentMethod?: string;
    phoneNumber?: string;
    accountName?: string;
  }): Promise<{ success: boolean; deposit: DepositRecord; walletBalanceUGX: number; message: string }> {
    const res = await fetch(`${API_BASE}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Deposit submission failed');
    return json;
  },

  async getMyDeposits(): Promise<{ deposits: DepositRecord[] }> {
    const res = await fetch(`${API_BASE}/wallet/deposits`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch deposits');
    return json;
  },

  async purchaseMachine(data: {
    machineId: string;
    quantity?: number;
  }): Promise<{ success: boolean; purchase: MachinePurchaseRecord; rental?: MachineRental; walletBalanceUGX: number; message: string }> {
    const res = await fetch(`${API_BASE}/machines/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Machine purchase failed');
    return json;
  },

  async withdraw(data: {
    amountUGX: number;
    paymentMethod: string;
    recipientPhone?: string;
    recipientName?: string;
    recipientBank?: string;
    recipientAccount?: string;
  }): Promise<{ success: boolean; reference: string; amountUGX: number; feeUGX: number; walletBalanceUGX: number; message: string }> {
    const res = await fetch(`${API_BASE}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Withdrawal failed');
    return json;
  },

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    const res = await fetch(`${API_BASE}/wallet/transactions`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch transactions');
    return json;
  },

  // Notifications
  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/read/${id}`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
  },

  // AI & Telemetry
  async askAi(message: string): Promise<{ response: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI query failed');
    return json;
  },

  async getTelemetry(): Promise<NodeTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry`);
    return await res.json();
  },

  // Admin APIs
  async getAdminOverview(): Promise<{ stats: AdminOverviewStats }> {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Admin access required');
    return json;
  },

  async getAdminUsers(): Promise<{ users: any[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch admin users');
    return json;
  },

  async toggleUserStatus(id: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-status`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to toggle status');
    return json;
  },

  // Admin Deposits
  async getAdminDeposits(status?: string): Promise<{ deposits: DepositRecord[] }> {
    const url = status ? `${API_BASE}/admin/deposits?status=${encodeURIComponent(status)}` : `${API_BASE}/admin/deposits`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch deposits');
    return json;
  },

  async approveDeposit(depositId: string, adminNote?: string): Promise<{ success: boolean; deposit: DepositRecord; userWalletBalanceUGX: number; message: string }> {
    const res = await fetch(`${API_BASE}/admin/deposits/${depositId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ adminNote })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to approve deposit');
    return json;
  },

  async rejectDeposit(depositId: string, rejectionReason: string, adminNote?: string): Promise<{ success: boolean; deposit: DepositRecord; message: string }> {
    const res = await fetch(`${API_BASE}/admin/deposits/${depositId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ rejectionReason, adminNote })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reject deposit');
    return json;
  },

  // Admin Purchases & Sales Monitoring
  async getAdminPurchases(filters?: { machineId?: string; userId?: string; status?: string }): Promise<{ purchases: MachinePurchaseRecord[] }> {
    const params = new URLSearchParams();
    if (filters?.machineId) params.append('machineId', filters.machineId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();

    const res = await fetch(`${API_BASE}/admin/purchases${query ? `?${query}` : ''}`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch purchases');
    return json;
  },

  async getAdminMachineAnalytics(): Promise<{ analytics: any }> {
    const res = await fetch(`${API_BASE}/admin/analytics/machines`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch machine analytics');
    return json;
  },

  async getAdminUserDetails(userId: string): Promise<{ user: User; deposits: DepositRecord[]; purchases: MachinePurchaseRecord[]; rentals: MachineRental[]; transactions: Transaction[]; referrals: ReferralRecord[] }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/details`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch user details');
    return json;
  },

  async getAdminTransactions(): Promise<{ transactions: Transaction[] }> {
    const res = await fetch(`${API_BASE}/admin/transactions`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch admin transactions');
    return json;
  },

  async approveTransaction(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/transactions/${id}/approve`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to approve transaction');
    return json;
  },

  async broadcastNotification(data: { title: string; message: string; type?: string }): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/notifications/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to broadcast notification');
    return json;
  },

  async getAuditLogs(): Promise<{ auditLogs: any[] }> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch audit logs');
    return json;
  },

  async trigger12PMDistribution(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/trigger-12pm-distribution`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to trigger 12 PM distribution');
    return json;
  },

  async getAdminRentals(): Promise<{ rentals: any[] }> {
    const res = await fetch(`${API_BASE}/admin/rentals`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch rentals');
    return json;
  },

  async updateRentalStatus(id: string, status: string): Promise<{ success: boolean; rental: MachineRental }> {
    const res = await fetch(`${API_BASE}/admin/rentals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update rental status');
    return json;
  },

  async getAdminReferrals(): Promise<{ referrals: ReferralRecord[] }> {
    const res = await fetch(`${API_BASE}/admin/referrals`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch referrals');
    return json;
  },

  async getAdminSettings(): Promise<{ settings: PlatformSettings }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch admin settings');
    return json;
  },

  async updateAdminSettings(settings: Partial<PlatformSettings>): Promise<{ success: boolean; settings: PlatformSettings }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update settings');
    return json;
  },

  async createMachine(machineData: Partial<Machine>): Promise<{ success: boolean; machine: Machine }> {
    const res = await fetch(`${API_BASE}/admin/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(machineData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create machine');
    return json;
  },

  async updateMachine(id: string, machineData: Partial<Machine>): Promise<{ success: boolean; machine: Machine }> {
    const res = await fetch(`${API_BASE}/admin/machines/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(machineData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update machine');
    return json;
  },

  async deleteMachine(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/machines/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete machine');
    return json;
  }
};
