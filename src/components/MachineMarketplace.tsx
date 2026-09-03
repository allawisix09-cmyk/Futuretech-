import React, { useState } from 'react';
import { Machine, User } from '../types';
import { CpuVisual } from './CpuVisual';
import {
  Cpu,
  Zap,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Info,
  Server
} from 'lucide-react';

interface MachineMarketplaceProps {
  machines: Machine[];
  user: User | null;
  onSelectMachine: (machine: Machine) => void;
}

export const MachineMarketplace: React.FC<MachineMarketplaceProps> = ({
  machines,
  user,
  onSelectMachine
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gold' | 'silver' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMachines = machines.filter(m => {
    const matchesFilter = selectedFilter === 'all' || m.tier === selectedFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.computingPower.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.tagline && m.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="machine-marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#091b3d] to-[#071124] border border-cyan-500/40 glow-border-cyan">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-3">
            <Server className="w-3.5 h-3.5" />
            <span>Dedicated Hardware Grid</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white">
            Computing Machines Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-mono leading-relaxed">
            Rent high-performance computing clusters with enterprise SLA. Daily returns are dynamically calculated and stream directly to your balance.
          </p>
        </div>

        {/* Filter / Search Controls */}
        <div className="mt-6 pt-6 border-t border-cyan-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'gold', 'silver', 'normal'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedFilter(tier)}
                className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold uppercase transition shrink-0 ${
                  selectedFilter === tier
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(0,180,255,0.4)]'
                    : 'bg-[#050a14] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {tier === 'all' ? 'All Hardware' : `${tier.toUpperCase()} Tier`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search specs, series, hashrate..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#050a14] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* Hardware Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredMachines.map(machine => {
          const isGold = machine.tier === 'gold';
          const isSilver = machine.tier === 'silver';
          const borderClass = isGold
            ? 'glow-border-gold'
            : isSilver
            ? 'glow-border-silver'
            : 'glow-border-blue';

          return (
            <div
              key={machine.id}
              className={`rounded-3xl bg-[#091224] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${borderClass} relative shadow-xl`}
            >
              {machine.badge && (
                <span className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-orbitron font-extrabold uppercase shadow-md ${
                  isGold ? 'bg-amber-400 text-black shadow-[0_0_10px_#f59e0b]' : isSilver ? 'bg-cyan-300 text-black' : 'bg-blue-600 text-white'
                }`}>
                  {machine.badge}
                </span>
              )}

              <div>
                {/* 3D CPU Visual */}
                <div className="py-4 flex justify-center">
                  <CpuVisual tier={machine.tier} size="md" />
                </div>

                {/* Title & Stats */}
                <div className="text-center mt-3">
                  <h3 className="font-orbitron font-bold text-lg text-white">
                    {machine.name}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">
                    {machine.computingPower} • {machine.durationDays} Days Term
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {machine.description}
                  </p>
                </div>

                {/* Spec List */}
                <div className="mt-6 space-y-2 py-3 border-y border-slate-800 font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Working Schedule:</span>
                    <strong className="text-cyan-300">
                      {machine.workingDaysSchedule || 'Monday – Friday (5 Days / Week)'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Weekend Mode:</span>
                    <strong className="text-amber-300">
                      {machine.weekendStatus || 'Offline on Saturday & Sunday'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Payout Time:</span>
                    <strong className="text-emerald-400">Auto 12:00 PM Daily</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Est. Daily Output:</span>
                    <strong className="text-emerald-400">UGX {(machine.dailyEstimatedYieldUGX ?? 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Est. Total Return:</span>
                    <strong className="text-cyan-300">UGX {(machine.totalEstimatedYieldUGX ?? 0).toLocaleString()} (+{machine.totalEstimatedYieldPercent ?? 0}%)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Hardware Stock:</span>
                    <strong className="text-amber-400">{machine.availableUnits ?? 0} Available</strong>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-6 pt-2">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Rental Price</span>
                    <div className="text-xl font-orbitron font-bold text-white">
                      UGX {(machine.rentalPriceUGX ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    (${machine.rentalPriceUSD ?? 0} USD)
                  </span>
                </div>

                <button
                  id={`marketplace-rent-${machine.id}`}
                  onClick={() => onSelectMachine(machine)}
                  className={`w-full py-3.5 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider transition shadow-lg ${
                    isGold
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,180,27,0.3)]'
                      : isSilver
                      ? 'bg-gradient-to-r from-slate-200 to-cyan-400 text-black hover:from-white hover:to-cyan-300 shadow-[0_0_20px_rgba(180,215,255,0.3)]'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(0,180,255,0.3)]'
                  }`}
                >
                  Rent {machine.name} →
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comparative Specs Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081224] border border-cyan-500/30">
        <h3 className="font-orbitron font-bold text-base sm:text-lg text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Hardware Comparison & Working Schedules Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-cyan-900/50 text-slate-400">
                <th className="py-3 px-4">Specification</th>
                {machines.map(m => (
                  <th key={m.id} className="py-3 px-4 font-orbitron whitespace-nowrap text-white">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-3 px-4 text-slate-400">Rental Price</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 font-bold text-amber-400 font-orbitron whitespace-nowrap">
                    UGX {(m.rentalPriceUGX ?? 0).toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Daily Income</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 font-bold text-emerald-400 font-orbitron whitespace-nowrap">
                    UGX {(m.dailyEstimatedYieldUGX ?? 0).toLocaleString()} / day
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Total Income Return</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 font-bold text-cyan-300 font-orbitron whitespace-nowrap">
                    UGX {(m.totalEstimatedYieldUGX ?? 0).toLocaleString()} (+{m.totalEstimatedYieldPercent ?? 0}%)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Term Duration</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 text-white font-bold whitespace-nowrap">
                    {m.durationDays} Days
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Working Schedule</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 text-cyan-300 font-semibold whitespace-nowrap">
                    {m.workingDaysSchedule || 'Monday – Friday (5 Days / Wk)'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Weekend Status</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 text-amber-300 font-semibold whitespace-nowrap">
                    {m.weekendStatus || 'Offline on Saturday & Sunday'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Daily Update Time</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 text-slate-300 whitespace-nowrap">
                    {m.updateTime || 'Auto 12:00 PM Daily'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Computing Power</td>
                {machines.map(m => (
                  <td key={m.id} className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {m.computingPower}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
