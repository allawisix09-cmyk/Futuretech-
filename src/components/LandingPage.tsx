import React, { useState } from 'react';
import { FutureTechLogo } from './FutureTechLogo';
import { CpuVisual } from './CpuVisual';
import { Machine } from '../types';
import {
  Cpu,
  Zap,
  ShieldCheck,
  TrendingUp,
  Share2,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  Activity,
  Globe2,
  CheckCircle2,
  ChevronRight,
  Smartphone
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onExploreMachines: () => void;
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  onAdminPortal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onExploreMachines,
  machines,
  onSelectMachine,
  onAdminPortal
}) => {
  // Interactive Computing Yield Calculator State
  const [calcInvestmentUGX, setCalcInvestmentUGX] = useState<number>(150000);
  const [calcDays, setCalcDays] = useState<number>(30);

  // Projected Return: ~5.56% daily estimate based on CPU yields
  const dailyRate = calcInvestmentUGX <= 30000 ? 0.0533 : 0.0556;
  const estimatedDailyUGX = Math.round(calcInvestmentUGX * dailyRate);
  const estimatedTotalUGX = estimatedDailyUGX * calcDays;
  const estimatedProfitUGX = estimatedTotalUGX - calcInvestmentUGX;

  return (
    <div id="landing-page" className="min-h-screen bg-[#040711] text-white selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden cyber-grid">
        {/* Futuristic Glowing Ambient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Official F Logo Hero Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-[#081224]/90 border border-cyan-500/50 shadow-[0_0_25px_rgba(0,210,255,0.3)] mb-8">
            <FutureTechLogo size="sm" showText={false} />
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
              FUTURE TECH — Official China & Uganda Enterprise
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold">
              20-Year Uganda Govt Contract
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* Hero Heading */}
          <h1 className="font-orbitron text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Power the Future. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent filter drop-shadow-[0_0_25px_rgba(0,210,255,0.4)]">
              Earn From Technology.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            Future Tech, a leading technology enterprise from China, has officially established its new branch in Uganda backed by a prestigious <strong className="text-cyan-300 font-semibold">20-year contract with the Ugandan Government</strong>. Rent enterprise-grade quantum computing nodes, enjoy real-time daily returns in Uganda Shillings (UGX), and earn instant payouts through MTN and Airtel Mobile Money.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-bold text-white glow-btn-primary flex items-center gap-2 shadow-[0_0_25px_rgba(0,180,255,0.5)] transform hover:-translate-y-0.5 transition"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-login-btn"
              onClick={onLogin}
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-semibold text-slate-200 hover:text-white bg-[#091429] border border-cyan-500/40 hover:border-cyan-400 transition"
            >
              Login to Node
            </button>

            <button
              id="hero-explore-machines-btn"
              onClick={onExploreMachines}
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Explore Machines</span>
            </button>
          </div>

          {/* Live Trust Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#081224]/70 border border-cyan-500/20 backdrop-blur-sm">
              <span className="text-2xl font-orbitron font-extrabold text-cyan-400">14.8 EH/s</span>
              <p className="text-xs text-slate-400 mt-1 font-mono uppercase">Global Hashrate</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#081224]/70 border border-cyan-500/20 backdrop-blur-sm">
              <span className="text-2xl font-orbitron font-extrabold text-blue-400">99.98%</span>
              <p className="text-xs text-slate-400 mt-1 font-mono uppercase">Node SLA Uptime</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#081224]/70 border border-cyan-500/20 backdrop-blur-sm">
              <span className="text-2xl font-orbitron font-extrabold text-emerald-400">Instant</span>
              <p className="text-xs text-slate-400 mt-1 font-mono uppercase">MoMo Payouts</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#081224]/70 border border-cyan-500/20 backdrop-blur-sm">
              <span className="text-2xl font-orbitron font-extrabold text-amber-400">5% Bonus</span>
              <p className="text-xs text-slate-400 mt-1 font-mono uppercase">Special Referrals</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CPU / Machine Marketplace Showcase */}
      <section className="py-20 bg-[#060b18] border-y border-cyan-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>Available Computing Machines</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-orbitron font-bold text-white">
              Rent Next-Gen Computing Hardware
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Choose from our high-yield computing hardware machines. Each machine is backed by real dedicated server infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {machines.map(machine => {
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
                  id={`machine-card-${machine.id}`}
                  className={`rounded-2xl bg-[#091224] p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${borderClass} relative`}
                >
                  {machine.badge && (
                    <span className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-orbitron font-extrabold uppercase shadow-md ${
                      isGold ? 'bg-amber-400 text-black shadow-[0_0_10px_#f59e0b]' : isSilver ? 'bg-cyan-300 text-black' : 'bg-blue-600 text-white'
                    }`}>
                      {machine.badge}
                    </span>
                  )}

                  <div>
                    {/* 3D Hardware Graphic */}
                    <div className="py-4 flex justify-center">
                      <CpuVisual tier={machine.tier} size="md" />
                    </div>

                    {/* Title & Badge */}
                    <div className="mt-4 text-center">
                      <h3 className="font-orbitron font-bold text-lg text-white">
                        {machine.name}
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono mt-1">
                        {machine.computingPower}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {machine.description}
                      </p>
                    </div>

                    {/* Spec List */}
                    <div className="mt-6 space-y-2 py-3 border-y border-slate-800/80 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Working Days:</span>
                        <strong className="text-cyan-300">
                          {machine.workingDaysSchedule || 'Monday – Friday (5 Days / Wk)'}
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Weekend Mode:</span>
                        <strong className="text-amber-300">
                          {machine.weekendStatus || 'Offline on Saturday & Sunday'}
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Daily Payout:</span>
                        <strong className="text-emerald-400">Auto 12:00 PM</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Est. Daily Output:</span>
                        <strong className="text-emerald-400">UGX {(machine.dailyEstimatedYieldUGX ?? 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Est. Total Return:</span>
                        <strong className="text-cyan-300">UGX {(machine.totalEstimatedYieldUGX ?? 0).toLocaleString()} (+{machine.totalEstimatedYieldPercent ?? 0}%)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="mt-6 pt-2">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-xs text-slate-400 font-mono">Rental Price</span>
                        <div className="text-xl font-orbitron font-bold text-white">
                          UGX {(machine.rentalPriceUGX ?? 0).toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        (${machine.rentalPriceUSD ?? 0} USD)
                      </span>
                    </div>

                    <button
                      id={`rent-btn-${machine.id}`}
                      onClick={() => onSelectMachine(machine)}
                      className={`w-full py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition shadow-lg ${
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
        </div>
      </section>

      {/* 3. Interactive Yield Calculator */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0a1429] to-[#050b18] border border-cyan-500/40 glow-border-cyan">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Yield Estimator & ROI Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white">
              Calculate Your Machine Yields
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Projections are calculated based on active cloud hash rates. Yields are generated 24/7 and credited to your wallet balance.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders / Inputs */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                  <span>Hardware Investment</span>
                  <strong className="text-cyan-400 font-orbitron text-sm">UGX {(calcInvestmentUGX ?? 0).toLocaleString()}</strong>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="1000000"
                  step="10000"
                  value={calcInvestmentUGX}
                  onChange={e => setCalcInvestmentUGX(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>30k (Normal CPU)</span>
                  <span>60k (Silver CPU)</span>
                  <span>150k (Gold CPU)</span>
                  <span>1M (Cluster)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                  <span>Rental Term</span>
                  <strong className="text-cyan-400 font-orbitron text-sm">{calcDays} Days</strong>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[15, 30, 60].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCalcDays(d)}
                      className={`py-2 rounded-xl text-xs font-mono font-semibold transition ${
                        calcDays === d
                          ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00e5ff]'
                          : 'bg-[#091224] text-slate-300 border border-slate-700 hover:border-cyan-500'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#071120] border border-cyan-500/20 text-[11px] text-slate-400">
                <span className="text-amber-400 font-semibold">Financial Disclaimer:</span> Actual computing yields vary with network difficulty and uptime. All calculations shown are transparent estimates.
              </div>
            </div>

            {/* Yield Outcome Display Card */}
            <div className="p-6 rounded-2xl bg-[#081224] border border-cyan-500/40 text-center space-y-4">
              <div>
                <span className="text-xs uppercase font-mono text-slate-400">Estimated Daily Payout</span>
                <div className="text-2xl sm:text-3xl font-orbitron font-black text-cyan-400 mt-1">
                  UGX {(estimatedDailyUGX ?? 0).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-left font-mono">
                <div>
                  <span className="text-[10px] text-slate-500">Est. Total Return</span>
                  <p className="text-sm font-bold text-white">UGX {(estimatedTotalUGX ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Est. Net Profit</span>
                  <p className="text-sm font-bold text-emerald-400">+UGX {(estimatedProfitUGX ?? 0).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary"
              >
                Start Earning Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. China-Uganda Bilateral 20-Year Strategic Agreement Section */}
      <section className="py-16 bg-gradient-to-b from-[#060c1c] via-[#081530] to-[#060b18] border-t border-cyan-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OFFICIAL 20-YEAR UGANDAN GOVERNMENT CONTRACT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-orbitron font-black text-white">
              China High-Tech Enterprise <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300">
                Official Uganda Branch Launch
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Future Tech, a premier computing and artificial intelligence corporation from China, has officially established its new regional branch in Uganda. Under an exclusive 20-year bilateral agreement and contract with the Government of Uganda, Future Tech operates dedicated high-throughput compute clusters that enable every Ugandan citizen to earn daily yields in UGX.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#081224]/90 border border-cyan-500/30 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold mb-4 font-mono text-base">
                🇨🇳
              </div>
              <h3 className="font-orbitron font-bold text-base text-white">China Innovation Core</h3>
              <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                Powered by Future Tech China's proprietary quantum-matrix microarchitectures, cryogenic servers, and high-density computing clusters engineered for 99.98% uninterrupted uptime.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#081224]/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold mb-4 font-mono text-base">
                🇺🇬
              </div>
              <h3 className="font-orbitron font-bold text-base text-white">20-Year Uganda Govt Contract</h3>
              <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                Legally ratified 20-year operational contract with the Ugandan Government, ensuring long-term institutional stability, regulatory compliance, and sustained economic empowerment across East Africa.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#081224]/90 border border-amber-500/30 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold mb-4 font-mono text-base">
                ⚡
              </div>
              <h3 className="font-orbitron font-bold text-base text-white">Instant UGX MoMo Payouts</h3>
              <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                Direct integration with MTN Mobile Money (*165#) and Airtel Money (*185#). Claim and withdraw your computing machine returns with transparent telecom verification and an automatic 15% platform deduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Highlights: Computing Power, Dashboard, Payments & Referrals */}
      <section className="py-20 bg-[#060b18] border-t border-cyan-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-orbitron font-bold text-white">
              Built For Maximum Trust & Performance
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              A complete, enterprise-level architecture uniting computing power, instantaneous local payments, and transparent blockchain verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#091224] border border-cyan-500/20 hover:border-cyan-400/50 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Quantum Computing Power
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Connect your account directly to high-throughput compute clusters running 24/7 dedicated algorithms with zero technical setup required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#091224] border border-cyan-500/20 hover:border-cyan-400/50 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Real-Time Earnings Tracker
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Watch your yields accrue second-by-second. Claim accumulated yields directly to your withdrawable wallet with full accounting clarity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#091224] border border-cyan-500/20 hover:border-cyan-400/50 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Uganda Mobile Money
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Seamless deposits and withdrawals via MTN Mobile Money (*165#) and Airtel Money (*185#). Instant telecom settlement with clear 15% platform and carrier processing breakdown.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#091224] border border-cyan-500/20 hover:border-cyan-400/50 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Personal Special Link
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Share your unique link on WhatsApp, SMS, and Telegram. Automatically track invited users and earn 5% bonus on their machine activations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#091224] border border-cyan-500/20 hover:border-cyan-400/50 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Cryptographic Security
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Protected by 256-bit SHA password hashing, audit logs, anti-fraud self-referral prevention, and secure session management.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#091224] border border-cyan-500/20 hover:border-cyan-400/50 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Live Node Telemetry & AI
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Monitor live cluster temperatures, memory pipelines, and ask the FUTURE TECH AI Core for customized machine recommendations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Referral Workflow Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#081224] border border-cyan-500/30 p-8 sm:p-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Passive Growth Engine</span>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
              How the Special Link System Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-orbitron font-bold flex items-center justify-center text-xs mb-3">
                01
              </span>
              <h4 className="font-orbitron text-sm font-bold text-white">Get Special Link</h4>
              <p className="text-xs text-slate-400 mt-1">
                Receive your unique <code className="text-cyan-300">futuretech.com/join/FT-XXXX</code> upon free registration.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-orbitron font-bold flex items-center justify-center text-xs mb-3">
                02
              </span>
              <h4 className="font-orbitron text-sm font-bold text-white">Share Everywhere</h4>
              <p className="text-xs text-slate-400 mt-1">
                1-click share directly to WhatsApp contacts, Telegram groups, SMS, or QR code.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-orbitron font-bold flex items-center justify-center text-xs mb-3">
                03
              </span>
              <h4 className="font-orbitron text-sm font-bold text-white">Auto-Detection</h4>
              <p className="text-xs text-slate-400 mt-1">
                The backend automatically detects the referral and safely connects their account to yours.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050a14] border border-slate-800">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-orbitron font-bold flex items-center justify-center text-xs mb-3">
                04
              </span>
              <h4 className="font-orbitron text-sm font-bold text-white">Earn Commission</h4>
              <p className="text-xs text-slate-400 mt-1">
                Receive 5% instant referral incentives credited directly to your withdrawable balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 bg-[#03060d] border-t border-cyan-950 text-slate-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FutureTechLogo size="sm" />
            <span className="text-slate-500">|</span>
            <span>© 2026 FUTURE TECH Computing Network. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-cyan-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-cyan-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-cyan-400 cursor-pointer">Uganda Telecom MoMo API</span>
            {onAdminPortal && (
              <button
                onClick={onAdminPortal}
                className="text-amber-400/80 hover:text-amber-300 transition flex items-center gap-1 font-orbitron font-semibold"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
};
