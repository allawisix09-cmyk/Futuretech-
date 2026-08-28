import React from 'react';
import {
  Home,
  Cpu,
  Share2,
  TrendingUp,
  Bot,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  unreadCount = 0
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'invites', label: 'Invites', icon: Share2, badge: user ? 'Special' : undefined },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'my', label: 'My', icon: UserIcon }
  ];

  return (
    <div id="bottom-navigation-bar" className="fixed bottom-0 left-0 right-0 z-40 bg-[#040813]/95 backdrop-blur-lg border-t border-cyan-900/50 px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.7)]">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]'}`} />
                {item.id === 'invites' && user && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 tracking-tight font-orbitron ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
