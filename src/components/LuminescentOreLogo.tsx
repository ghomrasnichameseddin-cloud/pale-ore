import React from 'react';

interface LuminescentOreLogoProps {
  className?: string;
}

export const LuminescentOreLogo: React.FC<LuminescentOreLogoProps> = ({ className = "h-8 w-8" }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`} id="raw-luminescent-ore-logo">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full animate-pulse" />
      
      {/* Crystalline SVG structure representing raw, jagged luminescent ore */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]"
      >
        {/* Deep background shadow facets */}
        <path
          d="M 50,12 L 78,32 L 50,88 L 22,32 Z"
          fill="url(#ore-deep-glow)"
          opacity="0.4"
        />
        
        {/* Main Crystalline Facets */}
        {/* Left main facet */}
        <path
          d="M 50,12 L 22,32 L 44,54 L 50,12"
          fill="url(#ore-cyan-dark)"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Right main facet */}
        <path
          d="M 50,12 L 50,54 L 78,32 L 50,12"
          fill="url(#ore-cyan-medium)"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Bottom Left facet */}
        <path
          d="M 22,32 L 50,88 L 44,54 L 22,32"
          fill="url(#ore-silver-dark)"
          stroke="#0891b2"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Bottom Right facet */}
        <path
          d="M 78,32 L 50,54 L 50,88 L 78,32"
          fill="url(#ore-cyan-light)"
          stroke="#67e8f9"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Center core glowing spike (Luminescent heart) */}
        <path
          d="M 50,28 L 44,54 L 50,88 L 50,28"
          fill="url(#ore-core-glow)"
          stroke="#e0f7fa"
          strokeWidth="1"
          opacity="0.95"
        />

        {/* Crystalline sparkle sparks */}
        <circle cx="34" cy="22" r="2" fill="#fff" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="70" cy="46" r="1.5" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '4.5s' }} />
        <circle cx="50" cy="9" r="1" fill="#fff" />

        {/* Color Gradients */}
        <defs>
          <linearGradient id="ore-deep-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="ore-cyan-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id="ore-cyan-medium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="100%" stopColor="#164e63" />
          </linearGradient>
          <linearGradient id="ore-silver-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="ore-cyan-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="ore-core-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cffafe" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
