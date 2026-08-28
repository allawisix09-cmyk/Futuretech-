import React from 'react';

interface FutureTechLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  glow?: boolean;
  variant?: 'cyan' | 'monochrome' | 'gold';
}

export const FutureTechLogo: React.FC<FutureTechLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  glow = true,
  variant = 'cyan'
}) => {
  const sizeMap = {
    xs: { icon: 22, text: 'text-base', sub: 'text-[8px]' },
    sm: { icon: 30, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 40, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 54, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 74, text: 'text-3xl', sub: 'text-sm' }
  };

  const current = sizeMap[size];

  return (
    <div id="future-tech-logo" className={`flex items-center gap-3 select-none ${className}`}>
      {/* Aerodynamic Stylized 'F' Logo Mark */}
      <div className="relative flex items-center justify-center shrink-0">
        {glow && (
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/40 via-blue-600/30 to-cyan-400/40 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition duration-500" />
        )}
        <div
          style={{ width: current.icon, height: current.icon }}
          className="relative rounded-2xl bg-gradient-to-br from-[#0c1a3b] via-[#071127] to-[#040814] p-1.5 border border-cyan-400/50 shadow-[0_0_18px_rgba(0,210,255,0.35)] flex items-center justify-center transition-transform hover:scale-105"
        >
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_0_6px_rgba(0,229,255,0.85)]"
          >
            <defs>
              {/* Electric Cyan/Blue Gradient */}
              <linearGradient id="f-logo-grad-cyan" x1="20" y1="20" x2="110" y2="105" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="35%" stopColor="#00e5ff" />
                <stop offset="70%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              {/* Gold Gradient */}
              <linearGradient id="f-logo-grad-gold" x1="20" y1="20" x2="110" y2="105" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Highlight Flare */}
              <linearGradient id="f-logo-flare" x1="30" y1="20" x2="105" y2="35" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Aerodynamic 'F' Top Wing (Feather 1) */}
            <path
              d="M 32 54 C 32 38 42 22 64 22 L 102 22 C 108 22 111 26 108 30 C 104 35 95 38 86 38 L 58 38 C 45 38 35 44 32 54 Z"
              fill={variant === 'gold' ? 'url(#f-logo-grad-gold)' : variant === 'monochrome' ? '#ffffff' : 'url(#f-logo-grad-cyan)'}
            />
            {/* Top Wing Gloss Accent */}
            <path
              d="M 44 26 C 52 23 62 23 78 23 L 100 23 C 104 23 105 25 103 27 C 98 29 90 31 82 31 L 52 31 C 46 31 44 28 44 26 Z"
              fill="url(#f-logo-flare)"
            />

            {/* Aerodynamic 'F' Middle Wing (Feather 2) */}
            <path
              d="M 29 78 C 30 66 38 55 52 55 L 88 55 C 93 55 96 59 93 63 C 89 67 79 70 70 70 L 46 70 C 37 70 31 73 29 78 Z"
              fill={variant === 'gold' ? 'url(#f-logo-grad-gold)' : variant === 'monochrome' ? '#ffffff' : 'url(#f-logo-grad-cyan)'}
            />

            {/* Aerodynamic 'F' Bottom Anchor Tail (Feather 3) */}
            <path
              d="M 28 80 C 28 92 33 104 46 104 C 49 104 51 100 49 95 C 46 85 43 78 41 73 C 36 73 30 75 28 80 Z"
              fill={variant === 'gold' ? 'url(#f-logo-grad-gold)' : variant === 'monochrome' ? '#ffffff' : 'url(#f-logo-grad-cyan)'}
            />

            {/* Tech Node Micro Accents */}
            <circle cx="103" cy="27" r="2.5" fill="#ffffff" className="animate-pulse" />
            <circle cx="89" cy="60" r="2" fill="#ffffff" />
            <circle cx="45" cy="98" r="1.8" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-orbitron font-extrabold tracking-wider text-white ${current.text}`}>
              FUTURE<span className="text-cyan-400">TECH</span>
            </span>
          </div>
          <span className={`font-mono text-cyan-300/75 tracking-[0.22em] uppercase font-semibold ${current.sub}`}>
            Decentralized Grid
          </span>
        </div>
      )}
    </div>
  );
};
