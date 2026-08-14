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
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(197,160,89,0.35)]"
      >
        {/* Deep background shadow & glow */}
        <path
          d="M 50,6 L 80,24 L 94,50 L 80,76 L 50,94 L 20,76 L 6,50 L 20,24 Z"
          fill="url(#ore-deep-glow)"
          opacity="0.5"
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
          stroke="url(#ore-gold-grad)"
          strokeWidth="1.5"
          opacity="0.75"
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
          stroke="url(#ore-gold-grad)"
          strokeWidth="1.5"
          opacity="0.75"
        />

        {/* Main Crystalline Facets (Chiseled Ore with Gilded & Celestial Facets) */}
        {/* Top-Left Facet */}
        <path
          d="M 50,10 L 20,24 L 45,50 L 50,10"
          fill="url(#ore-dark-obsidian)"
          stroke="#c5a059"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Top-Right Facet */}
        <path
          d="M 50,10 L 50,50 L 80,24 L 50,10"
          fill="url(#ore-cyan-deep)"
          stroke="#e5c875"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Bottom-Left Facet */}
        <path
          d="M 20,24 L 50,90 L 45,50 L 20,24"
          fill="url(#ore-emerald-deep)"
          stroke="#c5a059"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Bottom-Right Facet */}
        <path
          d="M 80,24 L 50,50 L 50,90 L 80,24"
          fill="url(#ore-gold-facet)"
          stroke="#e5c875"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Center Illuminated Core Diamond (Luminescent Ore Heart) */}
        <polygon
          points="50,28 62,50 50,72 38,50"
          fill="url(#ore-core-glow)"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {/* Center Octagram Core Star */}
        <circle cx="50" cy="50" r="3" fill="#ffffff" />
        <circle cx="50" cy="50" r="7" stroke="#c5a059" strokeWidth="0.8" fill="none" opacity="0.8" />

        {/* Tiny gold & celestial sparkle runes */}
        <circle cx="32" cy="18" r="1.5" fill="#e5c875" opacity="0.9" />
        <circle cx="72" cy="42" r="1.5" fill="#22d3ee" opacity="0.9" />
        <circle cx="50" cy="6" r="1.5" fill="#e5c875" opacity="0.9" />

        {/* Color Gradients */}
        <defs>
          <linearGradient id="ore-deep-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5a059" />
            <stop offset="50%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="ore-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a6d2b" />
            <stop offset="50%" stopColor="#e5c875" />
            <stop offset="100%" stopColor="#c5a059" />
          </linearGradient>
          <linearGradient id="ore-dark-obsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#07080c" />
            <stop offset="100%" stopColor="#1a1e2e" />
          </linearGradient>
          <linearGradient id="ore-cyan-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id="ore-emerald-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id="ore-gold-facet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a2e12" />
            <stop offset="100%" stopColor="#8a6d2b" />
          </linearGradient>
          <linearGradient id="ore-core-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="75%" stopColor="#e5c875" />
            <stop offset="100%" stopColor="#c5a059" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
