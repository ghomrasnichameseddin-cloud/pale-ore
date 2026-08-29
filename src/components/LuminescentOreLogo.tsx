import React from 'react';

interface LuminescentOreLogoProps {
  className?: string;
}

export const LuminescentOreLogo: React.FC<LuminescentOreLogoProps> = ({ className = "h-8 w-8" }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`} id="raw-luminescent-ore-logo">
      {/* Islamic Dark Fantasy RPG Luminescent Ore Icon: Geometric Octagram + Crystalline Ore Facets */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_14px_var(--glow-strong)]"
      >
        {/* Deep background shadow & ambient halo */}
        <path
          d="M 50,6 L 80,24 L 94,50 L 80,76 L 50,94 L 20,76 L 6,50 L 20,24 Z"
          fill="url(#ore-deep-halo)"
          opacity="0.6"
        />

        {/* Outer 8-pointed Geometric Star Inlay (Rub el Hizb) */}
        {/* Square 1 */}
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="4"
          fill="none"
          stroke="url(#ore-border-grad)"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Square 2 (rotated 45) */}
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="4"
          transform="rotate(45 50 50)"
          fill="none"
          stroke="url(#ore-border-grad)"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Main Crystalline Facets (Chiseled Ore with Realm-Adaptive Inlays) */}
        {/* Top-Left Facet */}
        <path
          d="M 50,10 L 20,24 L 45,50 L 50,10"
          fill="url(#ore-facet-shadow)"
          stroke="var(--border-accent)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Top-Right Facet */}
        <path
          d="M 50,10 L 50,50 L 80,24 L 50,10"
          fill="url(#ore-facet-illum)"
          stroke="var(--accent-bright)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Bottom-Left Facet */}
        <path
          d="M 20,24 L 50,90 L 45,50 L 20,24"
          fill="url(#ore-facet-deep)"
          stroke="var(--accent-primary)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Bottom-Right Facet */}
        <path
          d="M 80,24 L 50,50 L 50,90 L 80,24"
          fill="url(#ore-facet-surface)"
          stroke="var(--accent-bright)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Center Illuminated Core Diamond (Luminescent Ore Heart) */}
        <polygon
          points="50,28 62,50 50,72 38,50"
          fill="url(#ore-core-crystal)"
          stroke="var(--accent-highlight)"
          strokeWidth="1.2"
        />

        {/* Center Octagram Core Star */}
        <circle cx="50" cy="50" r="3.5" fill="var(--accent-highlight)" />
        <circle 
          cx="50" 
          cy="50" 
          r="7" 
          stroke="var(--accent-bright)" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.85" 
        />

        {/* Realm Sparkle Runes */}
        <circle cx="32" cy="18" r="1.5" fill="var(--accent-bright)" opacity="0.9" />
        <circle cx="72" cy="42" r="1.5" fill="var(--accent-highlight)" opacity="0.95" />
        <circle cx="50" cy="6" r="1.5" fill="var(--accent-highlight)" opacity="0.95" />

        {/* Pure CSS-Variable Gradients for Flawless Theme Switching */}
        <defs>
          <linearGradient id="ore-deep-halo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" style={{ stopColor: 'var(--accent-primary)' }} />
            <stop offset="50%" stopColor="var(--accent-surface)" style={{ stopColor: 'var(--accent-surface)' }} />
            <stop offset="100%" stopColor="var(--bg-void)" style={{ stopColor: 'var(--bg-void)' }} />
          </linearGradient>

          <linearGradient id="ore-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-dim)" style={{ stopColor: 'var(--accent-dim)' }} />
            <stop offset="50%" stopColor="var(--accent-bright)" style={{ stopColor: 'var(--accent-bright)' }} />
            <stop offset="100%" stopColor="var(--accent-primary)" style={{ stopColor: 'var(--accent-primary)' }} />
          </linearGradient>

          <linearGradient id="ore-facet-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-void)" style={{ stopColor: 'var(--bg-void)' }} />
            <stop offset="100%" stopColor="var(--bg-card)" style={{ stopColor: 'var(--bg-card)' }} />
          </linearGradient>

          <linearGradient id="ore-facet-illum" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-surface)" style={{ stopColor: 'var(--accent-surface)' }} />
            <stop offset="100%" stopColor="var(--accent-bright)" style={{ stopColor: 'var(--accent-bright)' }} />
          </linearGradient>

          <linearGradient id="ore-facet-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-surface)" style={{ stopColor: 'var(--bg-surface)' }} />
            <stop offset="100%" stopColor="var(--accent-dim)" style={{ stopColor: 'var(--accent-dim)' }} />
          </linearGradient>

          <linearGradient id="ore-facet-surface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-surface)" style={{ stopColor: 'var(--accent-surface)' }} />
            <stop offset="100%" stopColor="var(--accent-primary)" style={{ stopColor: 'var(--accent-primary)' }} />
          </linearGradient>

          <linearGradient id="ore-core-crystal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-highlight)" style={{ stopColor: 'var(--accent-highlight)' }} />
            <stop offset="50%" stopColor="var(--accent-bright)" style={{ stopColor: 'var(--accent-bright)' }} />
            <stop offset="100%" stopColor="var(--accent-primary)" style={{ stopColor: 'var(--accent-primary)' }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
