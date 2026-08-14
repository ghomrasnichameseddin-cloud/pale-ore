import React from 'react';

// 8-Pointed Islamic Geometric Star (Rub el Hizb)
export const RubElHizbIcon: React.FC<{ className?: string; color?: string; filled?: boolean }> = ({ 
  className = "h-4 w-4", 
  color = "#c5a059",
  filled = false
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`shrink-0 inline-block ${className}`}
    >
      {/* Outer rotating square 1 */}
      <rect 
        x="3.5" 
        y="3.5" 
        width="17" 
        height="17" 
        rx="1" 
        stroke={color} 
        strokeWidth="1.2" 
        fill={filled ? `${color}20` : "none"} 
      />
      {/* Outer rotating square 2 (rotated 45deg) */}
      <rect 
        x="3.5" 
        y="3.5" 
        width="17" 
        height="17" 
        rx="1" 
        transform="rotate(45 12 12)" 
        stroke={color} 
        strokeWidth="1.2" 
        fill={filled ? `${color}20` : "none"} 
      />
      {/* Inner sacred circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="4.5" 
        stroke={color} 
        strokeWidth="0.9" 
        fill={filled ? color : "none"} 
      />
      {/* Center core point */}
      <circle 
        cx="12" 
        cy="12" 
        r="1.5" 
        fill={color} 
      />
    </svg>
  );
};

// Gilded Geometric Ornamental Divider with Center Star
export const GeometricDivider: React.FC<{ 
  className?: string; 
  title?: string;
  color?: string;
}> = ({ 
  className = "my-4", 
  title,
  color = "#c5a059"
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 w-full select-none ${className}`}>
      {/* Left tapering line */}
      <div className="flex-1 flex items-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c5a059]/40 to-[#c5a059]" />
        <div className="h-1.5 w-1.5 rotate-45 border border-[#c5a059] bg-[#0b0d13] shrink-0" />
      </div>

      {/* Center Emblem / Title */}
      <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-[#c5a059]/30 bg-[#0b0d13]/90 shadow-sm shrink-0">
        <RubElHizbIcon className="h-3.5 w-3.5" color={color} />
        {title && (
          <span className="font-display text-[10px] tracking-widest uppercase font-bold text-[#c5a059]">
            {title}
          </span>
        )}
        <RubElHizbIcon className="h-3.5 w-3.5" color={color} />
      </div>

      {/* Right tapering line */}
      <div className="flex-1 flex items-center">
        <div className="h-1.5 w-1.5 rotate-45 border border-[#c5a059] bg-[#0b0d13] shrink-0" />
        <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#c5a059]/40 to-[#c5a059]" />
      </div>
    </div>
  );
};

// Pointed Islamic Architectural Arch Header Banner
export const IslamicArchHeader: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
  accentColor?: string;
}> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  action,
  className = "",
  accentColor = "text-[#c5a059]"
}) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-[#c5a059]/25 bg-gradient-to-b from-[#131722] via-[#0b0d13] to-[#07080c] p-4 sm:p-5 shadow-lg shadow-black/60 ${className}`}>
      {/* Subtle background geometric motif */}
      <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full text-[#c5a059] fill-current">
          <path d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
        </svg>
      </div>

      {/* Top ornamental arch line */}
      <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#c5a059]/60 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div className="p-2.5 rounded-lg border border-[#c5a059]/30 bg-[#07080c]/80 text-[#c5a059] shadow-md shadow-black/50 shrink-0">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-white uppercase flex items-center gap-2">
                {title}
              </h2>
              {badge && (
                <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#e5c875] uppercase">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-mono text-zinc-400 mt-0.5 tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex items-center gap-2 shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

// Gilded Corner Filigree SVG for Cards
export const ArabesqueCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: string;
}> = ({ position, className = "h-4 w-4", color = "#c5a059" }) => {
  const rotation = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90'
  }[position];

  return (
    <svg 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute ${className} ${rotation}`}
    >
      <path 
        d="M2 18 V6 C2 3.79086 3.79086 2 6 2 H18" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <circle cx="6" cy="6" r="1.5" fill={color} />
      <path d="M2 10 C5 10 10 5 10 2" stroke={color} strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
};

// Talismanic Badge / Cartouche
export const TalismanBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'cyan' | 'ruby' | 'violet' | 'amber' | 'neutral';
  className?: string;
  icon?: React.ReactNode;
}> = ({
  children,
  variant = 'gold',
  className = "",
  icon
}) => {
  const variants = {
    gold: 'border-[#c5a059]/40 bg-[#c5a059]/10 text-[#fef08a] shadow-[0_0_10px_rgba(197,160,89,0.15)]',
    emerald: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    cyan: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    ruby: 'border-rose-500/40 bg-rose-950/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    violet: 'border-violet-500/40 bg-violet-950/60 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.15)]',
    amber: 'border-amber-500/40 bg-amber-950/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    neutral: 'border-white/10 bg-zinc-900/60 text-zinc-300'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-mono font-bold tracking-wider uppercase select-none ${variants[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
