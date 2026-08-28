import React from 'react';
import { MachineTier } from '../types';

interface CpuVisualProps {
  tier: MachineTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const CpuVisual: React.FC<CpuVisualProps> = ({
  tier,
  size = 'md',
  className = '',
  animate = true
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-64 h-64'
  };

  if (tier === 'gold') {
    return (
      <div id="cpu-visual-gold" className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        {/* Radiant Gold/Amber Cyber Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/30 via-yellow-500/25 to-amber-300/40 rounded-2xl blur-xl" />
        
        {/* Main 3D Gold Processor Chassis */}
        <div className="relative w-full h-full p-2.5 rounded-2xl bg-gradient-to-br from-[#2a1d07] via-[#1a1204] to-[#0a0702] border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,180,27,0.35)] flex items-center justify-center overflow-hidden">
          
          {/* Circuit Grid Background */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:12px_12px]" />
          
          {/* Outer Gold Heat Spreader */}
          <div className="relative w-4/5 h-4/5 rounded-xl bg-gradient-to-tr from-[#6b470a] via-[#f7d070] to-[#b37a1e] p-[2px] shadow-inner flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-[#1c1405] to-[#2b1e06] p-3 flex flex-col items-center justify-between border border-amber-300/40 relative">
              
              {/* Gold Micro Heat-Sink Lines */}
              <div className="absolute inset-x-2 top-2 flex justify-between gap-1 opacity-70">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-amber-400/80 rounded-full" />
                ))}
              </div>

              {/* Central Glowing Quantum Core */}
              <div className="my-auto relative flex items-center justify-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 p-0.5 shadow-[0_0_20px_#f59e0b] ${animate ? 'animate-pulse' : ''}`}>
                  <div className="w-full h-full rounded-md bg-[#120a02] flex flex-col items-center justify-center border border-amber-300">
                    <span className="font-orbitron text-[9px] font-black text-amber-300 tracking-tighter">
                      480 TH/s
                    </span>
                    <span className="text-[7px] font-mono font-bold text-amber-100">
                      256-CORE
                    </span>
                  </div>
                </div>
                {/* Circuit Traces */}
                <div className="absolute -top-3 w-0.5 h-3 bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <div className="absolute -bottom-3 w-0.5 h-3 bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <div className="absolute -left-3 w-3 h-0.5 bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <div className="absolute -right-3 w-3 h-0.5 bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              </div>

              {/* Titanium Laser Badge */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[7px] font-mono text-amber-400 font-semibold tracking-wider">
                  TITAN X-900
                </span>
                <span className="text-[7px] font-orbitron text-amber-300 font-extrabold">
                  GOLD EDITION
                </span>
              </div>
            </div>
          </div>

          {/* Corner Golden Pin Arrays */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-amber-300" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-amber-300" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-amber-300" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-amber-300" />
        </div>
      </div>
    );
  }

  if (tier === 'silver') {
    return (
      <div id="cpu-visual-silver" className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        {/* Silver / Cyan Cyber Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 via-slate-400/25 to-blue-400/30 rounded-2xl blur-xl" />
        
        {/* Main 3D Silver Processor Chassis */}
        <div className="relative w-full h-full p-2.5 rounded-2xl bg-gradient-to-br from-[#121c2d] via-[#091120] to-[#040813] border-2 border-slate-300/80 shadow-[0_0_25px_rgba(180,215,255,0.35)] flex items-center justify-center overflow-hidden">
          
          {/* Circuit Grid Background */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:12px_12px]" />
          
          {/* Outer Brushed Silver Heat Spreader */}
          <div className="relative w-4/5 h-4/5 rounded-xl bg-gradient-to-tr from-[#475569] via-[#e2e8f0] to-[#94a3b8] p-[2px] shadow-inner flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-[#0b1322] to-[#15233d] p-3 flex flex-col items-center justify-between border border-cyan-400/40 relative">
              
              {/* Dual Reactor Cooling Conduits */}
              <div className="absolute inset-x-2 top-2 flex justify-between gap-1 opacity-70">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-cyan-400/80 rounded-full" />
                ))}
              </div>

              {/* Central Glowing Matrix Reactor */}
              <div className="my-auto relative flex items-center justify-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-300 via-blue-400 to-slate-200 p-0.5 shadow-[0_0_20px_#38bdf8] ${animate ? 'animate-pulse' : ''}`}>
                  <div className="w-full h-full rounded-md bg-[#07111e] flex flex-col items-center justify-center border border-cyan-300">
                    <span className="font-orbitron text-[9px] font-black text-cyan-300 tracking-tighter">
                      180 TH/s
                    </span>
                    <span className="text-[7px] font-mono font-bold text-slate-200">
                      128-CORE
                    </span>
                  </div>
                </div>
                {/* Circuit Traces */}
                <div className="absolute -top-3 w-0.5 h-3 bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                <div className="absolute -bottom-3 w-0.5 h-3 bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                <div className="absolute -left-3 w-3 h-0.5 bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                <div className="absolute -right-3 w-3 h-0.5 bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
              </div>

              {/* Platinum Laser Badge */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[7px] font-mono text-cyan-300 font-semibold tracking-wider">
                  REACTOR S-500
                </span>
                <span className="text-[7px] font-orbitron text-slate-200 font-extrabold">
                  SILVER MATRIX
                </span>
              </div>
            </div>
          </div>

          {/* Corner Platinum Pin Arrays */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-slate-300" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-slate-300" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-slate-300" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-slate-300" />
        </div>
      </div>
    );
  }

  // Normal CPU
  return (
    <div id="cpu-visual-normal" className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Industrial Dark Cyan Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/20 via-cyan-900/20 to-teal-500/25 rounded-2xl blur-xl" />
      
      {/* Main 3D Industrial Titanium Chassis */}
      <div className="relative w-full h-full p-2.5 rounded-2xl bg-gradient-to-br from-[#0c141f] via-[#060b13] to-[#020509] border-2 border-blue-500/60 shadow-[0_0_20px_rgba(0,180,255,0.25)] flex items-center justify-center overflow-hidden">
        
        {/* Circuit Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Outer Titanium Heat Shield */}
        <div className="relative w-4/5 h-4/5 rounded-xl bg-gradient-to-tr from-[#1e293b] via-[#475569] to-[#334155] p-[2px] shadow-inner flex items-center justify-center">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-[#050b14] to-[#0c1626] p-3 flex flex-col items-center justify-between border border-blue-500/30 relative">
            
            {/* Vented Fins */}
            <div className="absolute inset-x-2 top-2 flex justify-between gap-1 opacity-60">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-blue-500/70 rounded-full" />
              ))}
            </div>

            {/* Central Compute Core */}
            <div className="my-auto relative flex items-center justify-center">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-700 p-0.5 shadow-[0_0_15px_#0284c7] ${animate ? 'animate-pulse' : ''}`}>
                <div className="w-full h-full rounded-md bg-[#030812] flex flex-col items-center justify-center border border-blue-400">
                  <span className="font-orbitron text-[9px] font-black text-blue-300 tracking-tighter">
                    65 TH/s
                  </span>
                  <span className="text-[7px] font-mono font-bold text-slate-300">
                    48-CORE
                  </span>
                </div>
              </div>
              {/* Circuit Traces */}
              <div className="absolute -top-3 w-0.5 h-3 bg-blue-400/80 shadow-[0_0_4px_#38bdf8]" />
              <div className="absolute -bottom-3 w-0.5 h-3 bg-blue-400/80 shadow-[0_0_4px_#38bdf8]" />
              <div className="absolute -left-3 w-3 h-0.5 bg-blue-400/80 shadow-[0_0_4px_#38bdf8]" />
              <div className="absolute -right-3 w-3 h-0.5 bg-blue-400/80 shadow-[0_0_4px_#38bdf8]" />
            </div>

            {/* Industrial Laser Badge */}
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-[7px] font-mono text-blue-400 font-semibold tracking-wider">
                CORE N-200
              </span>
              <span className="text-[7px] font-orbitron text-slate-300 font-bold">
                NORMAL CORE
              </span>
            </div>
          </div>
        </div>

        {/* Corner Pins */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-blue-500/70" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-blue-500/70" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-blue-500/70" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-blue-500/70" />
      </div>
    </div>
  );
};
