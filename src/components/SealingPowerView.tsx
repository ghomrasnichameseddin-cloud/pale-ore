import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { PowerSeal, SealRarity, Weakness } from '../types';
import { DEFAULT_SEALS } from '../initialState';
import { 
  Sparkles, Lock, Unlock, ShieldAlert, Award, Plus, Trash2, Edit3, 
  AlertCircle, Zap, Search, X, Pickaxe, Link as LinkIcon, Flame, Hammer,
  Shield, CheckCircle2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider, ChainBadge } from './IslamicRpgDecorations';
import { SLIP_RUNES } from './SlipRune';

export const ORE_COMPLEXITY_INFO: Record<SealRarity, {
  shapeName: string;
  facetCount: string;
  complexityStars: string;
  facetNumber: number;
  description: string;
}> = {
  Common: {
    shapeName: 'Rough Asymmetric Boulder',
    facetCount: '5 Facets',
    complexityStars: '★☆☆☆☆☆',
    facetNumber: 5,
    description: 'Raw unrefined basalt-iron chunk with rugged, coarse cleavage planes.'
  },
  Rare: {
    shapeName: 'Chiseled Hexagonal Prism',
    facetCount: '8 Facets',
    complexityStars: '★★☆☆☆☆',
    facetNumber: 8,
    description: 'Upright quartz-style column with sharp vertical ridge bevels and pyramidal cap.'
  },
  Epic: {
    shapeName: 'Brilliant Octahedral Gem',
    facetCount: '14 Facets',
    complexityStars: '★★★☆☆☆',
    facetNumber: 14,
    description: 'Dual-cone bipyramid with flat table, star crown, and refractive pavilion facets.'
  },
  Legendary: {
    shapeName: 'Sovereign Spire Cluster',
    facetCount: '24 Facets',
    complexityStars: '★★★★☆☆',
    facetNumber: 24,
    description: 'Multi-crystal imperial geode: central dodecahedron flanked by dual angled satellite shards.'
  },
  Divine: {
    shapeName: 'Celestial Sacred Polytope',
    facetCount: '34 Facets',
    complexityStars: '★★★★★☆',
    facetNumber: 34,
    description: '8-pointed Rub-el-Hizb crystal matrix with concentric facet tiers and 4 floating orbital crystal chips.'
  },
  Forbidden: {
    shapeName: 'Hyper-Dimensional Tesseract',
    facetCount: '48+ Facets',
    complexityStars: '★★★★★★',
    facetNumber: 48,
    description: '4D hypercube void matrix with intersecting arcane facets, counter-angled cubes, and pulsing spatial fissures.'
  }
};

const SUGGESTED_RUNES = [
  // 6 Sacred Slip Runes
  'ف', 'ع', 'غ', 'ق', 'ص', 'م',
  // Arabic Alphabet Calligraphy Runes
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ض', 'ط', 'ظ', 'ك', 'ل', 'ن', 'هـ', 'و', 'ي',
  // Ancient Arabic Calligraphic Forms & Ligatures
  '﷽', '۞', '۝', '؏',
  // Minerals, Gems & Elemental Carvings
  '🪨', '💎', '🪙', '🔥', '🌋', '⛓️', '⚡', '✨', '🔮', '🛡️', '⚔️', '⚖️', '🔱', '🧿', '⚛️', '🌌'
];

const RARITY_COLORS: Record<SealRarity, {
  border: string;
  bg: string;
  text: string;
  badge: string;
  glow: string;
  runeSymbol: string;
  ringGradient: string;
  accent: string;
}> = {
  Common: {
    border: 'border-[#c5a059]/30 hover:border-[#c5a059]/60',
    bg: 'bg-gradient-to-b from-[#0e1118]/90 via-[#07080c] to-[#040508]',
    text: 'text-zinc-200',
    badge: 'bg-[#1a1d24] text-zinc-300 border-[#71717a]/50 shadow-[0_0_10px_rgba(113,113,122,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(197,160,89,0.08)]',
    runeSymbol: '⛓️',
    ringGradient: 'from-zinc-500 to-[#c5a059]',
    accent: '#71717a'
  },
  Rare: {
    border: 'border-blue-500/40 hover:border-blue-400',
    bg: 'bg-gradient-to-b from-[#0b1528]/80 via-[#07080c] to-[#040508]',
    text: 'text-blue-300',
    badge: 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    glow: 'shadow-[0_0_22px_rgba(59,130,246,0.15)]',
    runeSymbol: '🪨',
    ringGradient: 'from-blue-500 to-[#c5a059]',
    accent: '#3b82f6'
  },
  Epic: {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'bg-gradient-to-b from-[#081f17]/80 via-[#07080c] to-[#040508]',
    text: 'text-emerald-300',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    glow: 'shadow-[0_0_22px_rgba(16,185,129,0.15)]',
    runeSymbol: '💎',
    ringGradient: 'from-emerald-500 to-[#c5a059]',
    accent: '#10b981'
  },
  Legendary: {
    border: 'border-[#c5a059]/70 hover:border-[#fef08a]',
    bg: 'bg-gradient-to-b from-[#221808]/90 via-[#0b0d13] to-[#07080c]',
    text: 'text-[#fef08a]',
    badge: 'bg-[#3a2e12]/90 text-[#fef08a] border-[#c5a059]/80 font-bold shadow-[0_0_16px_rgba(197,160,89,0.4)]',
    glow: 'shadow-[0_0_28px_rgba(197,160,89,0.3)]',
    runeSymbol: '🪙',
    ringGradient: 'from-[#c5a059] to-[#fef08a]',
    accent: '#c5a059'
  },
  Divine: {
    border: 'border-rose-500/60 hover:border-rose-400',
    bg: 'bg-gradient-to-b from-[#250912]/90 via-[#0b0d13] to-[#07080c]',
    text: 'text-rose-300',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-500/70 font-bold shadow-[0_0_18px_rgba(244,63,94,0.35)]',
    glow: 'shadow-[0_0_32px_rgba(244,63,94,0.25)]',
    runeSymbol: '🔥',
    ringGradient: 'from-rose-500 to-[#c5a059]',
    accent: '#f43f5e'
  },
  Forbidden: {
    border: 'border-purple-500/70 hover:border-purple-400',
    bg: 'bg-gradient-to-b from-[#1b0a2c]/90 via-[#0b0d13] to-[#07080c]',
    text: 'text-purple-300',
    badge: 'bg-purple-950/90 text-purple-300 border-purple-500/80 font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    glow: 'shadow-[0_0_35px_rgba(168,85,247,0.3)]',
    runeSymbol: '🌋',
    ringGradient: 'from-purple-600 to-[#c5a059]',
    accent: '#a855f7'
  }
};

/* -------------------------------------------------------------------------- */
/*             RAW ELEMENTAL ORE & HEAVY CHAIN STAGE (VISUAL MODULE)          */
/* -------------------------------------------------------------------------- */
interface OreChainsStageProps {
  seal: PowerSeal;
  isBroken: boolean;
  canBreak?: boolean;
}

const RARITY_ORE_THEMES: Record<SealRarity, {
  stroke: string;
  glow: string;
  oreGrad1: string;
  oreGrad2: string;
  oreGrad3: string;
  coreGradient: string;
  sparkBg: string;
  chainColor: string;
  chainStroke: string;
  veinColor: string;
}> = {
  Common: {
    stroke: '#c5a059',
    glow: '',
    oreGrad1: '#27272a',
    oreGrad2: '#3f3f46',
    oreGrad3: '#52525b',
    coreGradient: 'from-zinc-300 via-zinc-500 to-[#3a2e12]',
    sparkBg: 'bg-zinc-300',
    chainColor: '#3f3f46',
    chainStroke: '#a1a1aa',
    veinColor: '#c5a059'
  },
  Rare: {
    stroke: '#3b82f6',
    glow: '',
    oreGrad1: '#0f172a',
    oreGrad2: '#1d4ed8',
    oreGrad3: '#3b82f6',
    coreGradient: 'from-blue-300 via-blue-500 to-[#3a2e12]',
    sparkBg: 'bg-blue-300',
    chainColor: '#1e3a8a',
    chainStroke: '#93c5fd',
    veinColor: '#60a5fa'
  },
  Epic: {
    stroke: '#10b981',
    glow: '',
    oreGrad1: '#064e3b',
    oreGrad2: '#047857',
    oreGrad3: '#10b981',
    coreGradient: 'from-emerald-300 via-teal-500 to-[#3a2e12]',
    sparkBg: 'bg-emerald-300',
    chainColor: '#064e3b',
    chainStroke: '#6ee7b7',
    veinColor: '#34d399'
  },
  Legendary: {
    stroke: '#c5a059',
    glow: '',
    oreGrad1: '#451a03',
    oreGrad2: '#8a6d2b',
    oreGrad3: '#c5a059',
    coreGradient: 'from-[#fef08a] via-[#c5a059] to-[#3a2e12]',
    sparkBg: 'bg-[#fef08a]',
    chainColor: '#5c4515',
    chainStroke: '#fef08a',
    veinColor: '#fef08a'
  },
  Divine: {
    stroke: '#f43f5e',
    glow: '',
    oreGrad1: '#4c0519',
    oreGrad2: '#be123c',
    oreGrad3: '#f43f5e',
    coreGradient: 'from-rose-200 via-pink-500 to-[#3a2e12]',
    sparkBg: 'bg-rose-300',
    chainColor: '#4c0519',
    chainStroke: '#fca5a5',
    veinColor: '#fb7185'
  },
  Forbidden: {
    stroke: '#a855f7',
    glow: '',
    oreGrad1: '#2e1065',
    oreGrad2: '#6b21a8',
    oreGrad3: '#a855f7',
    coreGradient: 'from-purple-300 via-purple-600 to-[#3a2e12]',
    sparkBg: 'bg-purple-300',
    chainColor: '#3b0764',
    chainStroke: '#d8b4fe',
    veinColor: '#c084fc'
  }
};

// 3D Chain Path Link Generator Component
const Render3DChainPath: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  curveY?: number; count?: number;
  chainColor?: string; chainStroke?: string;
}> = ({ x1, y1, x2, y2, curveY = 0, count = 10, chainColor = '#5c4515', chainStroke = '#c5a059' }) => {
  const links = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    let x = (1 - t) * x1 + t * x2;
    let y = (1 - t) * y1 + t * y2;
    if (curveY !== 0) {
      const midY = (y1 + y2) / 2 + curveY;
      y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
    }

    let dx = (x2 - x1);
    let dy = (y2 - y1);
    if (curveY !== 0) {
      const midY = (y1 + y2) / 2 + curveY;
      dy = 2 * (1 - t) * (midY - y1) + 2 * t * (y2 - midY);
    }
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const isFaceOn = i % 2 === 0;

    links.push({ i, x, y, angle, isFaceOn });
  }

  return (
    <g className="chain-3d-group">
      {/* 1. Cast Shadow onto background & stone */}
      {links.map(({ i, x, y, angle }) => (
        <g key={`sh-${i}`} transform={`translate(${x + 2.5}, ${y + 4}) rotate(${angle})`}>
          <rect x="-10" y="-6" width="20" height="12" rx="5" fill="#000000" opacity="0.85" filter="blur(1px)" />
        </g>
      ))}

      {/* 2. 3D Interlocking Metallic Chain Links */}
      {links.map(({ i, x, y, angle, isFaceOn }) => (
        <g key={`lk-${i}`} transform={`translate(${x}, ${y}) rotate(${angle})`}>
          {isFaceOn ? (
            /* Wide Face-On Link Loop */
            <g>
              <rect x="-10" y="-6" width="20" height="12" rx="5" fill={chainColor} stroke="#07080c" strokeWidth="1.8" />
              <rect x="-5" y="-2.5" width="10" height="5" rx="2.5" fill="#07080c" />
              {/* Top Specular Edge Highlight */}
              <path d="M -8 -4.5 L 8 -4.5" stroke={chainStroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
              {/* Bottom Shadow Edge */}
              <path d="M -8 4.5 L 8 4.5" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            </g>
          ) : (
            /* Narrow Side-On Interlocking Twisted Link */
            <g>
              <rect x="-5" y="-8.5" width="10" height="17" rx="4.5" fill="#0b0d13" stroke={chainColor} strokeWidth="2.2" />
              <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke={chainStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.95" />
              <line x1="-3" y1="-6.5" x2="-3" y2="6.5" stroke="#000000" strokeWidth="1" opacity="0.8" />
            </g>
          )}
        </g>
      ))}
    </g>
  );
};

// 3D Geometric Facet Mesh by Rank Complexity
const OreFacetMesh: React.FC<{
  rarity: SealRarity;
  sealId: string;
  theme: typeof RARITY_ORE_THEMES['Common'];
  isBroken: boolean;
}> = ({ rarity, sealId, theme, isBroken }) => {
  switch (rarity) {
    case 'Common':
      // 5 Facets: Rough Asymmetric Boulder
      return (
        <g>
          {/* Cast Shadow */}
          <path d="M 60,45 L 140,55 L 155,130 L 75,155 L 35,95 Z" fill="#000000" opacity="0.65" transform="translate(6, 6)" />
          {/* Facet 1: Top Roof */}
          <path d="M 60,45 L 140,55 L 105,82 L 35,95 Z" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M 60,45 L 35,95" stroke="#fef08a" strokeWidth="1.2" opacity="0.4" />
          {/* Facet 2: Upper Right Cleavage */}
          <path d="M 140,55 L 155,130 L 105,82 Z" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.4" strokeLinejoin="round" />
          {/* Facet 3: Left Stepped Flank */}
          <path d="M 35,95 L 105,82 L 75,155 L 42,130 Z" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.4" strokeLinejoin="round" />
          {/* Facet 4: Bottom Front Plate */}
          <path d="M 105,82 L 155,130 L 75,155 Z" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.4" strokeLinejoin="round" />
          {/* Rough Fracture Veins */}
          <path d="M 60,45 L 105,82 L 75,155" stroke={isBroken ? theme.veinColor : '#3a2e12'} strokeWidth={isBroken ? 2.5 : 1.5} />
          <path d="M 105,82 L 155,130" stroke={isBroken ? theme.veinColor : '#3a2e12'} strokeWidth={isBroken ? 2.2 : 1.2} />
          <path d="M 35,95 L 105,82" stroke={isBroken ? theme.veinColor : '#3a2e12'} strokeWidth={isBroken ? 2 : 1.2} />
        </g>
      );

    case 'Rare':
      // 8 Facets: Chiseled Hexagonal Prism Column
      return (
        <g>
          {/* Cast Shadow */}
          <polygon points="100,18 148,58 144,146 100,162 56,146 52,58" fill="#000000" opacity="0.65" transform="translate(6, 6)" />
          {/* Pyramidal Apex Crown Facets */}
          <polygon points="100,18 52,58 74,48" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,18 74,48 100,56" fill={`url(#ore-top-${sealId})`} opacity="0.9" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,18 100,56 126,48" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,18 126,48 148,58" fill={`url(#ore-right-${sealId})`} opacity="0.75" stroke="#07080c" strokeWidth="1.2" />
          {/* Longitudinal Column Body Facets */}
          <polygon points="52,58 74,48 76,155 56,146" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="74,48 100,56 100,162 76,155" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,56 126,48 124,155 100,162" fill={`url(#ore-core-${sealId})`} opacity="0.85" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="126,48 148,58 144,146 124,155" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Specular Ridge Highlights */}
          <line x1="100" y1="18" x2="100" y2="162" stroke={isBroken ? '#ffffff' : theme.veinColor} strokeWidth={isBroken ? 2 : 1.2} opacity="0.8" />
          <line x1="74" y1="48" x2="76" y2="155" stroke="#93c5fd" strokeWidth="1" opacity="0.4" />
          <line x1="126" y1="48" x2="124" y2="155" stroke="#000000" strokeWidth="1.2" opacity="0.5" />
        </g>
      );

    case 'Epic':
      // 14 Facets: Brilliant Cut Octahedron with Table and Pavilion
      return (
        <g>
          {/* Cast Shadow */}
          <polygon points="100,15 145,55 155,95 100,162 45,95 55,55" fill="#000000" opacity="0.65" transform="translate(6, 6)" />
          {/* Upper Crown Star Facets */}
          <polygon points="100,15 55,55 75,45" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,15 75,45 100,55" fill={`url(#ore-top-${sealId})`} opacity="0.95" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,15 100,55 125,45" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,15 125,45 145,55" fill={`url(#ore-right-${sealId})`} opacity="0.8" stroke="#07080c" strokeWidth="1.2" />
          {/* Central Girdle Table */}
          <polygon points="55,55 75,45 80,68 45,95" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="75,45 100,55 100,82 80,68" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,55 125,45 120,68 100,82" fill={`url(#ore-core-${sealId})`} opacity="0.9" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="125,45 145,55 155,95 120,68" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="45,95 80,68 100,82 100,108 75,95" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,82 120,68 155,95 125,95 100,108" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Lower Pavilion Facets */}
          <polygon points="45,95 75,95 100,162" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="75,95 100,108 100,162" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,108 125,95 100,162" fill={`url(#ore-core-${sealId})`} opacity="0.85" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="125,95 155,95 100,162" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Refraction table */}
          <polygon points="80,68 100,55 120,68 100,82" fill={isBroken ? '#ffffff' : theme.veinColor} opacity={isBroken ? 0.85 : 0.35} />
          <line x1="100" y1="15" x2="100" y2="162" stroke={theme.veinColor} strokeWidth={isBroken ? 2 : 1} opacity="0.7" />
        </g>
      );

    case 'Legendary':
      // 24 Facets: Sovereign Cluster with Central Dodecahedron & Dual Satellite Shards
      return (
        <g>
          {/* Cast Shadow */}
          <ellipse cx="100" cy="155" rx="75" ry="18" fill="#000000" opacity="0.65" />
          {/* Left Satellite Spire (5 Facets) */}
          <polygon points="38,68 24,115 36,105" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="38,68 36,105 48,110" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="38,68 48,110 52,95" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="24,115 36,105 40,150 28,145" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="36,105 48,110 54,152 40,150" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <line x1="38" y1="68" x2="40" y2="150" stroke="#fef08a" strokeWidth="1.2" opacity="0.6" />
          {/* Right Satellite Spire (5 Facets) */}
          <polygon points="162,72 148,102 160,108" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="162,72 160,108 174,115" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="148,102 160,108 158,150 146,145" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <polygon points="160,108 174,115 170,146 158,150" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1" />
          <line x1="162" y1="72" x2="158" y2="150" stroke="#fef08a" strokeWidth="1.2" opacity="0.6" />
          {/* Central Sovereign Monolith (14 Facets) */}
          <polygon points="100,16 75,44 100,52" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,16 100,52 125,44" fill={`url(#ore-top-${sealId})`} opacity="0.9" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="75,44 60,70 82,72 100,52" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="125,44 100,52 118,72 140,70" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Star Cut Center */}
          <polygon points="100,52 118,72 100,90 82,72" fill={isBroken ? '#ffffff' : theme.veinColor} stroke="#07080c" strokeWidth="1.2" opacity={isBroken ? 0.95 : 0.4} />
          <polygon points="60,70 82,72 80,118 55,115" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="82,72 100,90 100,122 80,118" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,90 118,72 120,118 100,122" fill={`url(#ore-core-${sealId})`} opacity="0.9" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="118,72 140,70 145,115 120,118" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="55,115 80,118 85,158 60,154" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="80,118 100,122 100,162 85,158" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,122 120,118 115,158 100,162" fill={`url(#ore-core-${sealId})`} opacity="0.85" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="120,118 145,115 140,154 115,158" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Energy Channels */}
          <line x1="48" y1="110" x2="60" y2="112" stroke={theme.veinColor} strokeWidth={isBroken ? 2.5 : 1.2} strokeDasharray="3 2" />
          <line x1="152" y1="108" x2="140" y2="112" stroke={theme.veinColor} strokeWidth={isBroken ? 2.5 : 1.2} strokeDasharray="3 2" />
        </g>
      );

    case 'Divine':
      // 34 Facets: Celestial Sacred Polytope with 4 Levitating Orbital Crystals
      return (
        <g>
          {/* Cast Shadow */}
          <ellipse cx="100" cy="162" rx="70" ry="16" fill="#000000" opacity="0.75" filter="blur(2px)" />
          {/* 4 Floating Orbital Shards */}
          <polygon points="32,38 42,48 30,52" fill={`url(#ore-top-${sealId})`} stroke="#f43f5e" strokeWidth="1" />
          <polygon points="32,38 42,48 44,40" fill="#ffffff" opacity="0.7" />
          <polygon points="168,38 158,48 170,52" fill={`url(#ore-top-${sealId})`} stroke="#f43f5e" strokeWidth="1" />
          <polygon points="168,38 158,48 156,40" fill="#ffffff" opacity="0.7" />
          <polygon points="26,122 38,126 28,138" fill={`url(#ore-left-${sealId})`} stroke="#f43f5e" strokeWidth="1" />
          <polygon points="174,122 162,126 172,138" fill={`url(#ore-right-${sealId})`} stroke="#f43f5e" strokeWidth="1" />
          <circle cx="100" cy="100" r="78" stroke={theme.stroke} strokeWidth="1" strokeDasharray="6 4" opacity="0.4" fill="none" />
          {/* Central 8-Pointed Sacred Matrix (26 Facets) */}
          <polygon points="100,12 85,38 100,45" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,12 100,45 115,38" fill={`url(#ore-top-${sealId})`} opacity="0.9" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="145,26 122,46 136,58" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="162,70 136,78 136,58" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="162,100 136,92 136,112" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="145,144 122,124 136,112" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,165 115,134 100,128" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="100,165 100,128 85,134" fill={`url(#ore-core-${sealId})`} opacity="0.9" stroke="#07080c" strokeWidth="1.2" />
          <polygon points="55,144 78,124 64,112" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="38,100 64,92 64,112" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="38,70 64,78 64,58" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="55,26 78,46 64,58" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Inner Polyhedron */}
          <polygon points="85,38 100,45 122,46 100,62 78,46" fill={`url(#ore-top-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="122,46 136,58 136,78 116,78 100,62" fill={`url(#ore-right-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="136,78 136,92 122,124 100,108 116,78" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="122,124 115,134 85,134 100,108" fill={`url(#ore-core-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="85,134 78,124 64,92 84,78 100,108" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          <polygon points="64,92 64,78 64,58 78,46 84,78" fill={`url(#ore-left-${sealId})`} stroke="#07080c" strokeWidth="1.2" />
          {/* Rub-el-Hizb Dual Squares Inlay */}
          <rect x="76" y="76" width="48" height="48" rx="2" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.75" />
          <rect x="76" y="76" width="48" height="48" rx="2" transform="rotate(45 100 100)" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.75" />
          <circle cx="100" cy="100" r="16" fill={isBroken ? '#ffffff' : theme.veinColor} opacity={isBroken ? 0.95 : 0.5} />
        </g>
      );

    case 'Forbidden':
    default:
      // 48+ Facets: Hyper-Dimensional Void Tesseract
      return (
        <g>
          {/* Singularity Void Shadow */}
          <ellipse cx="100" cy="162" rx="72" ry="18" fill="#000000" opacity="0.9" filter="blur(3px)" />
          <circle cx="100" cy="100" r="85" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.3" fill="none" />
          {/* 4 Floating Fractured Plates */}
          <polygon points="25,40 45,30 40,55 20,60" fill="#1b0a2c" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <polygon points="175,40 155,30 160,55 180,60" fill="#1b0a2c" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <polygon points="20,135 40,140 45,115 25,120" fill="#1b0a2c" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          <polygon points="180,135 160,140 155,115 175,120" fill="#1b0a2c" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
          {/* Outer Hypercube Planes (16 Facets) */}
          <polygon points="55,50 145,50 145,140 55,140" fill="none" stroke="#6b21a8" strokeWidth="1.6" />
          <polygon points="75,25 165,25 165,115 75,115" fill="none" stroke="#3b0764" strokeWidth="1.2" opacity="0.7" />
          <polygon points="55,50 75,25 165,25 145,50" fill={`url(#ore-top-${sealId})`} opacity="0.6" stroke="#a855f7" strokeWidth="1" />
          <polygon points="145,50 165,25 165,115 145,140" fill={`url(#ore-right-${sealId})`} opacity="0.5" stroke="#a855f7" strokeWidth="1" />
          <polygon points="55,50 75,25 75,115 55,140" fill={`url(#ore-left-${sealId})`} opacity="0.4" stroke="#a855f7" strokeWidth="1" />
          <polygon points="55,140 75,115 165,115 145,140" fill={`url(#ore-core-${sealId})`} opacity="0.5" stroke="#a855f7" strokeWidth="1" />
          {/* Inner Rotating Void Cube (16 Facets) */}
          <polygon points="78,75 122,75 122,119 78,119" fill={`url(#ore-core-${sealId})`} stroke="#d8b4fe" strokeWidth="1.8" />
          <polygon points="88,62 132,62 132,106 88,106" fill="#1e1b4b" opacity="0.7" stroke="#a855f7" strokeWidth="1.2" />
          <polygon points="78,75 88,62 132,62 122,75" fill="#3b0764" stroke="#d8b4fe" strokeWidth="1" />
          <polygon points="122,75 132,62 132,106 122,119" fill="#1b0a2c" stroke="#d8b4fe" strokeWidth="1" />
          <polygon points="78,119 88,106 132,106 122,119" fill="#090514" stroke="#d8b4fe" strokeWidth="1" />
          {/* 12 Dimensional Struts */}
          <line x1="55" y1="50" x2="78" y2="75" stroke={isBroken ? '#ffffff' : '#c084fc'} strokeWidth="1.8" />
          <line x1="145" y1="50" x2="122" y2="75" stroke={isBroken ? '#ffffff' : '#c084fc'} strokeWidth="1.8" />
          <line x1="145" y1="140" x2="122" y2="119" stroke={isBroken ? '#ffffff' : '#c084fc'} strokeWidth="1.8" />
          <line x1="55" y1="140" x2="78" y2="119" stroke={isBroken ? '#ffffff' : '#c084fc'} strokeWidth="1.8" />
          <line x1="75" y1="25" x2="88" y2="62" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="165" y1="25" x2="132" y2="62" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="165" y1="115" x2="132" y2="106" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="75" y1="115" x2="88" y2="106" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="2 2" />
          {/* Singularity Pulse Node */}
          <circle cx="100" cy="97" r="12" fill={isBroken ? '#ffffff' : theme.veinColor} opacity={isBroken ? 1 : 0.8} />
          <circle cx="100" cy="97" r="20" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" fill="none" />
        </g>
      );
  }
};

const OreChainsStage: React.FC<OreChainsStageProps> = ({ seal, isBroken }) => {
  const theme = RARITY_ORE_THEMES[seal.rarity] || RARITY_ORE_THEMES.Common;
  const strokeColor = isBroken ? theme.stroke : '#52525b';

  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-[#0b0d13] via-[#07080c] to-[#040508] rounded-2xl border border-[#c5a059]/25 overflow-hidden flex items-center justify-center my-3 group/ore select-none shadow-[inset_0_4px_20px_rgba(0,0,0,0.95),_0_10px_30px_rgba(0,0,0,0.8)]">
      <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
      
      {/* MINE CHAMBER & STONE MASONRY WALLS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_var(--tw-gradient-stops))] from-[#181d29]/80 via-[#07080c] to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      {/* FORGE PEDESTAL ALIVE GROUND AMBIENCE */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black via-[#07080c]/90 to-transparent pointer-events-none" />

      {/* MAIN ORE & CHAINS DISPLAY CANVAS */}
      <div className={`relative w-60 h-60 flex items-center justify-center transition-all duration-700 ${isBroken ? theme.glow : ''}`}>
        
        {/* BACKGROUND ISLAMIC CELESTIAL RING */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="92" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="6 3" opacity="0.35" />
          <circle cx="100" cy="100" r="86" stroke={strokeColor} strokeWidth="1.8" opacity="0.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <circle
              key={deg}
              cx={100 + 86 * Math.cos((deg * Math.PI) / 180)}
              cy={100 + 86 * Math.sin((deg * Math.PI) / 180)}
              r="3"
              fill={strokeColor}
              stroke="#000"
              strokeWidth="1"
              opacity="0.85"
            />
          ))}
          <circle cx="100" cy="100" r="74" stroke={strokeColor} strokeWidth="1" strokeDasharray="12 4" opacity="0.25" />
        </svg>

        {/* 3D CARVED MINERAL MONOLITH ORE DISPLAY */}
        <div className="relative w-44 h-44 flex items-center justify-center z-10">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
            <defs>
              <linearGradient id={`ore-top-${seal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3a2e12" />
                <stop offset="50%" stopColor={theme.oreGrad1} />
                <stop offset="100%" stopColor={theme.oreGrad2} />
              </linearGradient>

              <linearGradient id={`ore-left-${seal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.oreGrad1} />
                <stop offset="100%" stopColor="#07080c" />
              </linearGradient>

              <linearGradient id={`ore-right-${seal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.oreGrad2} />
                <stop offset="100%" stopColor={theme.oreGrad3} />
              </linearGradient>

              <linearGradient id={`ore-core-${seal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor={theme.veinColor} />
                <stop offset="100%" stopColor={theme.oreGrad2} />
              </linearGradient>

              <linearGradient id={`pedestal-grad-${seal.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a2e12" />
                <stop offset="50%" stopColor="#181d29" />
                <stop offset="100%" stopColor="#07080c" />
              </linearGradient>
            </defs>

            {/* 1. STONE FORGE PEDESTAL */}
            <ellipse cx="100" cy="165" rx="65" ry="16" fill="#000000" opacity="0.85" filter="blur(3px)" />
            <path d="M 40,160 L 160,160 L 145,175 L 55,175 Z" fill={`url(#pedestal-grad-${seal.id})`} stroke="#c5a059" strokeWidth="1" />
            <line x1="40" y1="160" x2="160" y2="160" stroke="#fef08a" strokeWidth="1" opacity="0.5" />

            {/* 2. DYNAMIC GEOMETRIC FACET MESH (DEPENDS ON COMPLEXITY OF SHAPE) */}
            <OreFacetMesh rarity={seal.rarity} sealId={seal.id} theme={theme} isBroken={isBroken} />
          </svg>

          {/* ORE CENTER CARVED INSCRIPTION / ARABIC GLYPH */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
            <div className="relative flex items-center justify-center">
              {/* Carved Inner Shadow */}
              <span className="absolute text-3xl font-serif text-black font-black translate-x-[1.5px] translate-y-[2px] opacity-90">
                {seal.runeSymbol || '🪨'}
              </span>
              {/* Carved Specular Light Bevel */}
              <span className="absolute text-3xl font-serif text-[#fef08a]/50 font-black -translate-x-[1px] -translate-y-[1px]">
                {seal.runeSymbol || '🪨'}
              </span>
              {/* Main Carved Rune Symbol */}
              <span className={`relative text-3xl font-serif font-black transition-transform duration-500 ${
                isBroken
                  ? 'scale-125 text-[#fef08a] [text-shadow:_0_0_15px_rgba(197,160,89,0.9),_0_2px_4px_rgba(0,0,0,0.95)]'
                  : 'text-zinc-300/85 [text-shadow:_0_2px_4px_rgba(0,0,0,0.95)]'
              }`}>
                {seal.runeSymbol || '🪨'}
              </span>
            </div>
          </div>

        </div>

        {/* 3D HEAVY INTERLOCKING BINDING CHAINS & PADLOCK (LOCKED STATE) */}
        {!isBroken && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            
            {/* SVG REALISTIC 3D INTERLOCKING FORGED CHAINS */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none">
              
              {/* Chain 1: Top-Left to Bottom-Right Diagonal */}
              <Render3DChainPath
                x1={15} y1={15} x2={185} y2={185}
                count={11}
                chainColor={theme.chainColor}
                chainStroke={theme.chainStroke}
              />

              {/* Chain 2: Top-Right to Bottom-Left Diagonal */}
              <Render3DChainPath
                x1={185} y1={15} x2={15} y2={185}
                count={11}
                chainColor={theme.chainColor}
                chainStroke={theme.chainStroke}
              />

              {/* Chain 3: Heavy Sagging Waist Chain Wrapping Middle */}
              <Render3DChainPath
                x1={10} y1={105} x2={190} y2={105}
                curveY={22}
                count={12}
                chainColor={theme.chainColor}
                chainStroke={theme.chainStroke}
              />
            </svg>

            {/* HEAVY CENTRAL FORGED IRON SHACKLE & PADLOCK BADGE */}
            <div className="relative z-30 px-3.5 py-1.5 bg-gradient-to-b from-[#181d29] via-[#0b0d13] to-black border-2 border-[#c5a059] rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.95),_0_0_20px_rgba(197,160,89,0.35),_inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 backdrop-blur-md">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              <Lock className="h-4 w-4 text-[#e5c875] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <span className="text-[10px] font-mono font-bold text-[#fef08a] tracking-widest uppercase flex items-center gap-1 [text-shadow:_0_1px_2px_rgba(0,0,0,0.9)]">
                CHAIN-BOUND
              </span>
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
            </div>

          </div>
        )}

        {/* SHATTERED HEAVY CHAIN FRAGMENTS (UNCHAINED / BROKEN STATE) */}
        {isBroken && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {/* Top Left Broken Chain End */}
            <div className="absolute top-4 left-5 rotate-45 flex items-center gap-1 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              <div className="w-5 h-3 border-2 border-[#c5a059] bg-[#07080c] rounded-lg shadow-inner" />
              <div className="w-3 h-5 border-2 border-zinc-600 bg-zinc-950 rounded-lg" />
            </div>

            {/* Top Right Broken Chain End */}
            <div className="absolute top-4 right-5 -rotate-45 flex items-center gap-1 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              <div className="w-3 h-5 border-2 border-zinc-600 bg-zinc-950 rounded-lg" />
              <div className="w-5 h-3 border-2 border-[#c5a059] bg-[#07080c] rounded-lg shadow-inner" />
            </div>

            {/* Bottom Fallen Fragment on Pedestal */}
            <div className="absolute bottom-4 left-10 rotate-12 flex items-center gap-1 opacity-75">
              <div className="w-4 h-2.5 border border-[#c5a059]/60 bg-black rounded" />
              <div className="w-2.5 h-4 border border-zinc-700 bg-[#07080c] rounded" />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export const SealingPowerView: React.FC = () => {
  const { 
    state, addXp, addSeal, updateSeal, deleteSeal, breakSeal, relockSeal, getPlayerLevelInfo, getSkillXpAndLevel,
    toggleBatterySaverMode, calibrateSealsToSystemState, resetSealsToDefault, restoreMissingDefaultSeals,
    convertWeaknessToSeal, unbindWeaknessFromSeal
  } = usePOS();

  const isBatterySaver = state.batterySettings?.batterySaverMode ?? false;

  const playerInfo = getPlayerLevelInfo();
  const seals = state.seals || [];
  const weaknesses = state.weaknesses || [];

  // Track unbound chains of nafs
  const activeSealIds = new Set(seals.map(s => s.id));
  const unboundWeaknesses = weaknesses.filter(w => !w.sealId || !activeSealIds.has(w.sealId) || w.status !== 'Sealed');
  const hasMissingDefaultSeals = DEFAULT_SEALS.some(ds => !activeSealIds.has(ds.id));

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Locked' | 'Broken'>('All');
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBindChainModalOpen, setIsBindChainModalOpen] = useState(false);
  const [editingSeal, setEditingSeal] = useState<PowerSeal | null>(null);
  const [selectedSealForBreak, setSelectedSealForBreak] = useState<PowerSeal | null>(null);

  // Unseal Feedback Banner
  const [unsealMessage, setUnsealMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rarity: 'Common' as SealRarity,
    requiredLevel: 1,
    costXP: 100,
    requiredQuestId: '',
    requiredSkillId: '',
    requiredSkillLevel: 1,
    buffName: '',
    buffDescription: '',
    xpBonusPercent: 15,
    momentumBoost: 5,
    runeSymbol: '🪨',
    selectedAttributeId: 'a-4',
    attributeBoostAmount: 2,
    boundWeaknessId: ''
  });

  // Calculate System-Wide Active Seal Buff Summary
  const brokenSeals = seals.filter(s => s.status === 'Broken');
  const totalXpMultiplier = brokenSeals.reduce((acc, s) => acc * (s.xpBonusMultiplier || 1.0), 1.0);
  const xpBoostDisplayPercent = Math.round((totalXpMultiplier - 1.0) * 100);

  // Collect attribute boosts from broken seals
  const totalAttributeBoosts: Record<string, number> = {};
  brokenSeals.forEach(s => {
    (s.attributeBoosts || []).forEach(b => {
      totalAttributeBoosts[b.attributeId] = (totalAttributeBoosts[b.attributeId] || 0) + b.boostAmount;
    });
  });

  const handleOpenCreateModal = (preselectedWeaknessId?: string) => {
    setEditingSeal(null);
    let initialName = '';
    let initialDesc = '';
    let initialRune = '🪨';
    let initialBuffName = '';
    let initialBuffDesc = '';

    if (preselectedWeaknessId) {
      const targetWeakness = weaknesses.find(w => w.id === preselectedWeaknessId);
      if (targetWeakness) {
        const runeInfo = SLIP_RUNES[targetWeakness.category] || SLIP_RUNES.Obligations;
        initialName = `Chain of ${targetWeakness.name}`;
        initialDesc = `A heavy chain forged to shatter "${targetWeakness.name}". Root cause: "${targetWeakness.triggerCause}".`;
        initialRune = runeInfo.runeChar;
        initialBuffName = `Liberation: ${targetWeakness.name.replace(/^Weakness:\s*/i, '')}`;
        initialBuffDesc = `+15% XP on Recovery directives, +10 Momentum floor, and resilient mastery against ${targetWeakness.category} slips.`;
      }
    }

    setFormData({
      name: initialName,
      description: initialDesc,
      rarity: 'Common',
      requiredLevel: Math.max(1, playerInfo.level),
      costXP: 200,
      requiredQuestId: '',
      requiredSkillId: '',
      requiredSkillLevel: 1,
      buffName: initialBuffName,
      buffDescription: initialBuffDesc,
      xpBonusPercent: 15,
      momentumBoost: 5,
      runeSymbol: initialRune,
      selectedAttributeId: 'a-4',
      attributeBoostAmount: 2,
      boundWeaknessId: preselectedWeaknessId || ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (seal: PowerSeal) => {
    setEditingSeal(seal);
    const linkedWeakness = weaknesses.find(w => w.sealId === seal.id);
    setFormData({
      name: seal.name,
      description: seal.description,
      rarity: seal.rarity,
      requiredLevel: seal.requiredLevel,
      costXP: seal.costXP,
      requiredQuestId: seal.requiredQuestId || '',
      requiredSkillId: seal.requiredSkillId || '',
      requiredSkillLevel: seal.requiredSkillLevel || 1,
      buffName: seal.buffName,
      buffDescription: seal.buffDescription,
      xpBonusPercent: Math.round(((seal.xpBonusMultiplier || 1.0) - 1.0) * 100),
      momentumBoost: seal.momentumBoost || 5,
      runeSymbol: seal.runeSymbol || '🪨',
      selectedAttributeId: seal.attributeBoosts?.[0]?.attributeId || 'a-4',
      attributeBoostAmount: seal.attributeBoosts?.[0]?.boostAmount || 2,
      boundWeaknessId: linkedWeakness ? linkedWeakness.id : ''
    });
    setIsFormOpen(true);
  };

  const handleSaveSeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.buffName.trim()) return;

    const multiplier = 1 + (formData.xpBonusPercent / 100);
    const attrBoosts = formData.selectedAttributeId ? [{
      attributeId: formData.selectedAttributeId,
      boostAmount: formData.attributeBoostAmount
    }] : [];

    if (editingSeal) {
      updateSeal(editingSeal.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rarity: formData.rarity,
        requiredLevel: Number(formData.requiredLevel),
        costXP: Number(formData.costXP),
        requiredQuestId: formData.requiredQuestId || null,
        requiredSkillId: formData.requiredSkillId || null,
        requiredSkillLevel: Number(formData.requiredSkillLevel),
        buffName: formData.buffName.trim(),
        buffDescription: formData.buffDescription.trim(),
        xpBonusMultiplier: multiplier,
        momentumBoost: Number(formData.momentumBoost),
        attributeBoosts: attrBoosts,
        runeSymbol: formData.runeSymbol || '🪨'
      });
      setUnsealMessage({
        text: `✨ Elemental Ore "${formData.name.trim()}" updated successfully.`,
        isError: false
      });
    } else if (formData.boundWeaknessId) {
      const res = convertWeaknessToSeal(formData.boundWeaknessId, formData.rarity, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rarity: formData.rarity,
        requiredLevel: Number(formData.requiredLevel),
        costXP: Number(formData.costXP),
        requiredQuestId: formData.requiredQuestId || undefined,
        buffName: formData.buffName.trim(),
        buffDescription: formData.buffDescription.trim(),
        xpBonusMultiplier: multiplier,
        momentumBoost: Number(formData.momentumBoost),
        attributeBoosts: attrBoosts,
        runeSymbol: formData.runeSymbol || '🪨'
      });
      setUnsealMessage({
        text: res.success ? `✨ ${res.message}` : `⚠️ ${res.message}`,
        isError: !res.success
      });
    } else {
      addSeal({
        name: formData.name.trim(),
        description: formData.description.trim(),
        rarity: formData.rarity,
        requiredLevel: Number(formData.requiredLevel),
        costXP: Number(formData.costXP),
        requiredQuestId: formData.requiredQuestId || null,
        requiredSkillId: formData.requiredSkillId || null,
        requiredSkillLevel: Number(formData.requiredSkillLevel),
        buffName: formData.buffName.trim(),
        buffDescription: formData.buffDescription.trim(),
        xpBonusMultiplier: multiplier,
        momentumBoost: Number(formData.momentumBoost),
        attributeBoosts: attrBoosts,
        runeSymbol: formData.runeSymbol || '🪨'
      });
      setUnsealMessage({
        text: `✨ New Elemental Ore "${formData.name.trim()}" forged into your sanctum!`,
        isError: false
      });
    }

    setTimeout(() => setUnsealMessage(null), 5000);
    setIsFormOpen(false);
  };

  const handleDeleteSealWithFeedback = (seal: PowerSeal) => {
    const linkedWeakness = weaknesses.find(w => w.sealId === seal.id);
    deleteSeal(seal.id);
    if (linkedWeakness) {
      setUnsealMessage({
        text: `⛓️ Elemental Ore "${seal.name}" deleted. Chain of Nafs "${linkedWeakness.name}" has been liberated and is ready to be bound again!`,
        isError: false
      });
    } else {
      setUnsealMessage({
        text: `Elemental Ore "${seal.name}" deleted.`,
        isError: false
      });
    }
    setTimeout(() => setUnsealMessage(null), 5500);
  };

  const handleBindWeaknessDirect = (weaknessId: string) => {
    const targetWeakness = weaknesses.find(w => w.id === weaknessId);
    if (!targetWeakness) return;
    const res = convertWeaknessToSeal(weaknessId);
    setUnsealMessage({
      text: res.success ? `✨ ${res.message}` : `⚠️ ${res.message}`,
      isError: !res.success
    });
    setTimeout(() => setUnsealMessage(null), 5000);
  };

  const handleUnbindWeaknessDirect = (weaknessId: string) => {
    unbindWeaknessFromSeal(weaknessId);
    setUnsealMessage({
      text: '⛓️ Chain unbound from its elemental ore and restored to active state.',
      isError: false
    });
    setTimeout(() => setUnsealMessage(null), 5000);
  };

  const handleTriggerBreakSeal = (seal: PowerSeal) => {
    const res = breakSeal(seal.id);
    setUnsealMessage({ text: res.message, isError: !res.success });
    setSelectedSealForBreak(null);
    setTimeout(() => setUnsealMessage(null), 5000);
  };

  // Filter seals
  const filteredSeals = seals.filter(seal => {
    const matchesSearch = 
      seal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seal.buffName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : seal.status === statusFilter;
    const matchesRarity = rarityFilter === 'All' ? true : seal.rarity === rarityFilter;
    return matchesSearch && matchesStatus && matchesRarity;
  });

  return (
    <div className="space-y-6 pb-12 font-sans" id="sealing-power-system-container">
      
      {/* FORGED ORES & HEAVY CHAINS ALTAR BANNER */}
      <div className="p-6 bg-gradient-to-r from-[#0e1118] via-[#0b0d13] to-[#1c160a] border border-[#c5a059]/40 rounded-2xl relative overflow-hidden shadow-[0_0_35px_rgba(197,160,89,0.12)]">
        <ArabesqueCorner position="top-left" className="top-2 left-2 h-5 w-5" color="#c5a059" />
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-5 w-5" color="#c5a059" />
        
        {/* BACKGROUND METALLIC CHAIN LINKS PATTERN */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 opacity-10 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full text-[#c5a059]" viewBox="0 0 200 200" fill="none">
            <path d="M 20 20 L 180 180" stroke="currentColor" strokeWidth="12" strokeDasharray="16 8" />
            <path d="M 180 20 L 20 180" stroke="currentColor" strokeWidth="12" strokeDasharray="16 8" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2.5 bg-[#3a2e12]/80 border border-[#c5a059]/60 rounded-xl text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.25)]">
                <RubElHizbIcon className="h-6 w-6 text-[#c5a059] animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#fef08a] uppercase font-bold flex items-center gap-1">
                    <span>⛓️</span> FORGED ORE & CHAINS SANCTUM <span>⛓️</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#3a2e12]/80 text-[#fef08a] border border-[#c5a059]/50 font-bold uppercase">
                    CHAIN MATRIX v4.0
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  CHAIN-BOUND ELEMENTAL ORES
                </h2>
              </div>
            </div>
            <p className="text-xs text-zinc-300 max-w-2xl font-sans leading-relaxed">
              Shatter heavy forged iron chains binding raw luminescent elemental ores. Unchaining an ore bursts its shackles, releasing permanent passive multipliers, attribute surges, and operator perks into your system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {hasMissingDefaultSeals && (
              <button
                type="button"
                onClick={() => {
                  restoreMissingDefaultSeals();
                  setUnsealMessage({ 
                    text: '✦ Default elemental ores have been restored to your sanctum.', 
                    isError: false 
                  });
                  setTimeout(() => setUnsealMessage(null), 4500);
                }}
                className="px-3 py-2.5 bg-[#0b0d13] hover:bg-[#181d29] border border-white/10 hover:border-[#c5a059]/40 text-xs font-mono text-zinc-300 hover:text-white rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Restore any missing original default ores"
              >
                <span>✦ RESTORE DEFAULT ORES</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBindChainModalOpen(true)}
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-950/70 to-[#3a2e12] hover:to-[#574418] border border-amber-500/50 hover:border-amber-400 text-xs font-mono text-[#fef08a] rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm relative"
              title="Bind active Chains of the Nafs directly into Elemental Ores"
            >
              <span className="text-sm">⛓️</span>
              <span className="font-bold">BIND ACTIVE CHAINS</span>
              {unboundWeaknesses.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-amber-400 text-black font-black font-mono animate-pulse">
                  {unboundWeaknesses.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                calibrateSealsToSystemState();
                setUnsealMessage({ 
                  text: '✦ All elemental ore seals successfully harmonized to your current level and system state.', 
                  isError: false 
                });
                setTimeout(() => setUnsealMessage(null), 4500);
              }}
              className="px-3.5 py-2.5 bg-[#0b0d13] hover:bg-[#181d29] border border-[#c5a059]/40 hover:border-[#c5a059] text-xs font-mono text-[#fef08a] rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
              title="Calibrate and harmonize seal conditions (level, XP cost, streak) to current system state"
            >
              <RefreshCw className="h-4 w-4 text-[#c5a059]" />
              <span>HARMONIZE CONDITIONS</span>
            </button>

            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-[#3a2e12] via-[#8a6d2b] to-[#c5a059] hover:from-[#4d3d18] hover:to-[#e5c875] text-[#fef08a] font-bold rounded-xl text-xs font-mono tracking-wider transition shadow-[0_0_20px_rgba(197,160,89,0.3)] flex items-center gap-2 border border-[#c5a059]/60 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>FORGE NEW ELEMENTAL ORE</span>
            </button>
          </div>
        </div>

        {/* ACTIVE BUFF MATRIX HUD */}
        <div className="mt-6 pt-5 border-t border-[#c5a059]/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="bg-[#07080c]/90 border border-[#c5a059]/30 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(197,160,89,0.08)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">CHAINS SHATTERED</span>
              <span className="text-lg font-mono font-bold text-[#fef08a] flex items-baseline gap-1 mt-0.5">
                {brokenSeals.length} <span className="text-xs text-zinc-500 font-normal">/ {seals.length} UNCHAINED</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#3a2e12]/60 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Unlock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-[#07080c]/90 border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">PASSIVE XP MULTIPLIER</span>
              <span className="text-lg font-mono font-bold text-emerald-300 flex items-baseline gap-1 mt-0.5">
                +{xpBoostDisplayPercent}% <span className="text-xs text-emerald-500/80 font-normal">XP BOOST</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
          </div>

          <div className="bg-[#07080c]/90 border border-[#c5a059]/40 p-3.5 rounded-xl flex items-center justify-between col-span-1 sm:col-span-2 shadow-[0_0_15px_rgba(197,160,89,0.08)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">AWAKENED ATTRIBUTE SURGES</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {Object.keys(totalAttributeBoosts).length === 0 ? (
                  <span className="text-xs font-mono text-zinc-500">No active attribute surges. Shatter chains to awaken raw ore power.</span>
                ) : (
                  Object.entries(totalAttributeBoosts).map(([attrId, boost]) => {
                    const attr = state.attributes.find(a => a.id === attrId);
                    return (
                      <span key={attrId} className="px-2 py-0.5 text-[9.5px] font-mono bg-[#3a2e12]/80 text-[#fef08a] border border-[#c5a059]/50 rounded-lg font-bold shadow-sm">
                        +{boost} {attr?.name || 'ATTRIBUTE'}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#3a2e12]/80 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0 ml-2">
              <Award className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* ARCANE RESONANCE SET BONUSES */}
        <div className="mt-4 p-3.5 bg-[#07080c]/90 border border-[#c5a059]/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059] animate-pulse" />
            <span className="text-[10px] font-bold text-[#fef08a] uppercase tracking-wider">ELEMENTAL RESONANCE SYNERGY SETS:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 2 
                ? 'bg-[#3a2e12]/80 text-[#fef08a] border-[#c5a059]/60 shadow-[0_0_10px_rgba(197,160,89,0.3)]'
                : 'bg-zinc-900/80 text-zinc-500 border-white/5 opacity-60'
            }`}>
              {brokenSeals.length >= 2 ? '⛏️' : '⛓️'} DUAL VEIN (2+ Ores: Active)
            </span>
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 3 
                ? 'bg-purple-900/80 text-purple-200 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-900/80 text-zinc-500 border-white/5 opacity-60'
            }`}>
              {brokenSeals.length >= 3 ? '💎' : '⛓️'} TRINITY FORGE (3+ Ores: Active)
            </span>
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 5 
                ? 'bg-[#4a3a16]/90 text-[#fef08a] border-[#c5a059]/80 shadow-[0_0_10px_rgba(197,160,89,0.4)]'
                : 'bg-zinc-900/80 text-zinc-500 border-white/5 opacity-60'
            }`}>
              {brokenSeals.length >= 5 ? '🌋' : '⛓️'} PRIMORDIAL OVERLORD (5+ Ores: Active)
            </span>
          </div>
        </div>
      </div>

      {/* UNSEAL FEEDBACK ALERT */}
      <AnimatePresence>
        {unsealMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 shadow-xl ${
              unsealMessage.isError
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
                : 'bg-[#0b0d13]/95 border-[#c5a059]/60 text-[#fef08a] shadow-[0_0_20px_rgba(197,160,89,0.3)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {unsealMessage.isError ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              ) : (
                <RubElHizbIcon className="h-5 w-5 shrink-0 text-[#c5a059] animate-pulse" />
              )}
              <span className="font-semibold">{unsealMessage.text}</span>
            </div>
            <button onClick={() => setUnsealMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & CONTROL BAR */}
      <div className="p-4 bg-[#0b0d13]/90 border border-[#c5a059]/25 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#c5a059]/70" />
          <input
            type="text"
            placeholder="Search elemental ores, chain-bound minerals, or buff perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#07080c] border border-[#c5a059]/20 rounded-xl pl-10 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]/60"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#07080c] p-1 rounded-xl border border-[#c5a059]/20">
            {(['All', 'Locked', 'Broken'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-[10px] font-mono rounded-lg transition uppercase font-bold cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/60 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {st === 'All' ? 'ALL ORES' : st === 'Locked' ? '⛓️ CHAIN-BOUND' : '⛏️ UNCHAINED'}
              </button>
            ))}
          </div>

          {/* Rarity filter */}
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-[#07080c] border border-[#c5a059]/20 text-zinc-300 rounded-xl px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-[#c5a059]/60 cursor-pointer"
          >
            <option value="All">ALL RARITIES</option>
            <option value="Common">COMMON (IRON)</option>
            <option value="Rare">RARE (COBALT)</option>
            <option value="Epic">EPIC (MITHRIL)</option>
            <option value="Legendary">LEGENDARY (GOLD)</option>
            <option value="Divine">DIVINE (DRAGONSTONE)</option>
            <option value="Forbidden">FORBIDDEN (OBSIDIAN)</option>
          </select>

        </div>

      </div>

      {/* SEALS GRID */}
      {filteredSeals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#c5a059]/30 bg-[#07080c]/60 rounded-2xl space-y-3">
          <ShieldAlert className="h-12 w-12 text-[#c5a059] mx-auto animate-pulse" />
          <p className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
            NO ELEMENTAL ORES FOUND MATCHING CRITERIA
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Forge a new elemental ore or reset active search filters.
          </p>
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-[#3a2e12] hover:bg-[#4d3d18] border border-[#c5a059]/50 text-[#fef08a] rounded-xl text-xs font-mono font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>FORGE ELEMENTAL ORE</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSeals.map((seal) => {
            const isBroken = seal.status === 'Broken';
            const rarityStyle = RARITY_COLORS[seal.rarity] || RARITY_COLORS.Common;
            const meetsLevel = playerInfo.level >= seal.requiredLevel;
            const meetsXp = seal.costXP === 0 || playerInfo.totalXp >= seal.costXP;

            // Check linked quest & skill
            const reqQuest = seal.requiredQuestId ? state.quests.find(q => q.id === seal.requiredQuestId) : null;
            const meetsQuest = !reqQuest || reqQuest.status === 'Completed';

            const reqSkill = seal.requiredSkillId ? state.skills.find(s => s.id === seal.requiredSkillId) : null;
            const skillInfo = reqSkill ? getSkillXpAndLevel(reqSkill.id) : null;
            const meetsSkill = !reqSkill || (skillInfo && skillInfo.level >= (seal.requiredSkillLevel || 1));

            const maxStreakInSystem = state.quests.reduce((max, q) => Math.max(max, q.streakCount || 0, q.bestStreak || 0), 0);
            const meetsStreak = !seal.requiredStreakDays || maxStreakInSystem >= seal.requiredStreakDays;

            const canBreak = !isBroken && meetsLevel && meetsXp && meetsQuest && meetsSkill && meetsStreak;

            return (
              <motion.div
                key={seal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                  isBroken
                    ? 'bg-gradient-to-b from-[#1c160a]/90 via-[#0b0d13] to-[#07080c] border-[#c5a059]/70 shadow-[0_0_25px_rgba(197,160,89,0.25)]'
                    : `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                }`}
              >
                <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

                {/* RUNIC WATERMARK & CORNER BRACKETS */}
                <div className="absolute top-2 left-3 text-[9px] font-mono text-[#c5a059]/30 font-bold select-none pointer-events-none">
                  [ ⛓️ {rarityStyle.runeSymbol} ⛓️ ]
                </div>
                <div className="absolute top-2 right-8 text-[9px] font-mono text-zinc-500 font-bold select-none pointer-events-none">
                  #ORE-{seal.id.slice(-4).toUpperCase()}
                </div>

                <div className="space-y-3 relative z-10 pt-2">
                  
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-white tracking-wide leading-snug">
                        {seal.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${rarityStyle.badge}`}>
                          {seal.rarity}
                        </span>
                        <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-md border border-[#c5a059]/30 bg-[#07080c] text-[#fef08a] font-medium flex items-center gap-1">
                          <Pickaxe className="h-2.5 w-2.5 text-[#c5a059]" />
                          <span>{ORE_COMPLEXITY_INFO[seal.rarity]?.shapeName || 'Crystalline'}</span>
                          <span className="text-zinc-500 font-mono">({ORE_COMPLEXITY_INFO[seal.rarity]?.facetCount})</span>
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase border flex items-center gap-1.5 shrink-0 ${
                      isBroken 
                        ? 'bg-[#3a2e12]/90 text-[#fef08a] border-[#c5a059]/70 shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                        : 'bg-[#07080c] text-zinc-400 border-white/10'
                    }`}>
                      {isBroken ? <Unlock className="h-3 w-3 text-[#c5a059]" /> : <Lock className="h-3 w-3 text-amber-500/80" />}
                      <span>{isBroken ? 'UNCHAINED' : 'CHAIN-BOUND'}</span>
                    </span>
                  </div>

                  {/* FEATURED RAW ORE WITH CHAINS STAGE */}
                  <OreChainsStage seal={seal} isBroken={isBroken} canBreak={canBreak} />

                  <p className="text-xs text-zinc-300/80 font-sans leading-relaxed line-clamp-2">
                    {seal.description}
                  </p>

                  {/* UNLOCKED BUFF PERK DISPLAY */}
                  <div className={`p-3 rounded-xl border ${
                    isBroken 
                      ? 'bg-[#18150c]/90 border-[#c5a059]/50 text-amber-100 shadow-inner' 
                      : 'bg-[#07080c]/90 border-white/10 text-zinc-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-mono uppercase font-bold text-[#c5a059] tracking-wider flex items-center gap-1">
                        <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                        PERMANENT ORE PERK
                      </span>
                      {seal.xpBonusMultiplier && seal.xpBonusMultiplier > 1.0 && (
                        <span className="text-[9.5px] font-mono font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                          +{Math.round((seal.xpBonusMultiplier - 1.0) * 100)}% XP BOOST
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-bold text-white">{seal.buffName}</p>
                    <p className="text-[10.5px] font-sans text-zinc-400 mt-0.5">{seal.buffDescription}</p>
                  </div>

                  {/* UNSEALING REQUIREMENTS CHECKLIST */}
                  {!isBroken && (
                    <div className="space-y-1.5 pt-2 border-t border-[#c5a059]/20 text-[10.5px] font-mono">
                      <div className="text-[8.5px] font-mono text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                        ✦ UNCHAINING REQUIREMENTS:
                      </div>
                      
                      {/* Level req */}
                      <div className={`flex items-center justify-between p-1 rounded bg-[#07080c]/60 ${meetsLevel ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        <span>Player Level {seal.requiredLevel}+</span>
                        <span className="font-bold">{meetsLevel ? '✓ MET' : `LVL ${playerInfo.level}`}</span>
                      </div>

                      {/* XP cost */}
                      {seal.costXP > 0 && (
                        <div className={`flex items-center justify-between p-1 rounded bg-[#07080c]/60 ${meetsXp ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span>XP Sacrifice: {seal.costXP} XP</span>
                          <span className="font-bold">{meetsXp ? '✓ READY' : `${playerInfo.totalXp} XP`}</span>
                        </div>
                      )}

                      {/* Required quest */}
                      {reqQuest && (
                        <div className={`flex items-center justify-between p-1 rounded bg-[#07080c]/60 ${meetsQuest ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span className="truncate max-w-[170px]">Req Quest: "{reqQuest.name}"</span>
                          <span className="font-bold">{meetsQuest ? '✓ DONE' : 'INCOMPLETE'}</span>
                        </div>
                      )}

                      {/* Required skill */}
                      {reqSkill && (
                        <div className={`flex items-center justify-between p-1 rounded bg-[#07080c]/60 ${meetsSkill ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span>Skill "{reqSkill.name}" LVL {seal.requiredSkillLevel}+</span>
                          <span className="font-bold">{meetsSkill ? '✓ MET' : `LVL ${skillInfo?.level || 0}`}</span>
                        </div>
                      )}

                      {/* Required streak */}
                      {seal.requiredStreakDays && seal.requiredStreakDays > 0 && (
                        <div className={`flex items-center justify-between p-1 rounded bg-[#07080c]/60 ${meetsStreak ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span>Streak: {seal.requiredStreakDays}+ Days</span>
                          <span className="font-bold">{meetsStreak ? '✓ MET' : `${maxStreakInSystem} DAYS`}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Broken At Timestamp */}
                  {isBroken && seal.brokenAt && (
                    <div className="text-[9.5px] font-mono text-[#fef08a]/80 flex items-center justify-between pt-1 border-t border-[#c5a059]/20">
                      <span>UNCHAINED DATE:</span>
                      <span className="font-bold">{new Date(seal.brokenAt).toLocaleDateString()}</span>
                    </div>
                  )}

                </div>

                {/* CARD ACTION BUTTONS */}
                <div className="mt-5 pt-3 border-t border-[#c5a059]/20 flex flex-col gap-2 relative z-10">
                  {(() => {
                    const linkedWeakness = weaknesses.find(w => w.sealId === seal.id);
                    if (!linkedWeakness) return null;
                    return (
                      <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                        <span className="truncate flex items-center gap-1">
                          <span>⛓️</span>
                          <span>Chain: {linkedWeakness.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnbindWeaknessDirect(linkedWeakness.id)}
                          className="text-[9px] text-rose-300 hover:text-rose-100 hover:underline cursor-pointer ml-1 shrink-0"
                          title="Unbind this chain from this ore"
                        >
                          Unbind
                        </button>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(seal)}
                        className="p-1.5 bg-[#0b0d13] hover:bg-[#181d29] border border-[#c5a059]/30 text-zinc-400 hover:text-[#fef08a] rounded-lg transition cursor-pointer"
                        title="Edit Elemental Ore"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSealWithFeedback(seal)}
                        className="p-1.5 bg-[#0b0d13] hover:bg-rose-950 border border-rose-500/30 text-zinc-400 hover:text-rose-300 rounded-lg transition cursor-pointer"
                        title="Delete Elemental Ore (liberates any bound chains)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {isBroken && (
                        <button
                          onClick={() => relockSeal(seal.id)}
                          className="px-2 py-1 bg-[#0b0d13] hover:bg-[#181d29] border border-[#c5a059]/30 text-[9.5px] font-mono text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
                          title="Re-bind Chains"
                        >
                          RE-BIND
                        </button>
                      )}
                    </div>

                    {!isBroken ? (
                      <button
                        onClick={() => setSelectedSealForBreak(seal)}
                        className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                          canBreak
                            ? 'bg-gradient-to-r from-[#3a2e12] via-[#8a6d2b] to-[#c5a059] hover:from-[#4d3d18] hover:to-[#e5c875] text-[#fef08a] border-[#c5a059]/80 shadow-[0_0_20px_rgba(197,160,89,0.4)] animate-pulse'
                            : 'bg-zinc-900 text-zinc-500 border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{canBreak ? 'SHATTER CHAINS' : 'CHAIN-BOUND'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            addXp(25);
                            setUnsealMessage({ text: `✨ Elemental Ore Pulse Channeled from "${seal.name}"! +25 System XP Granted!`, isError: false });
                          }}
                        className="px-2.5 py-1.5 bg-[#3a2e12]/80 hover:bg-[#4d3d18] border border-[#c5a059]/60 text-[10px] font-mono font-bold text-[#fef08a] rounded-lg transition shadow-sm flex items-center gap-1 cursor-pointer"
                        title="Channel localized energy surge from this unchained ore"
                      >
                        <Zap className="h-3 w-3 text-[#c5a059] animate-pulse" />
                        <span>CHANNEL PULSE</span>
                      </button>
                      <span className="text-[10.5px] font-mono text-[#fef08a] font-bold flex items-center gap-1 bg-[#3a2e12]/90 border border-[#c5a059]/50 px-2.5 py-1.5 rounded-lg shadow-sm">
                        <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059] animate-pulse" />
                        UNCHAINED
                      </span>
                    </div>
                  )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* SHATTER SEAL CONFIRMATION CEREMONY MODAL */}
      <AnimatePresence>
        {selectedSealForBreak && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full bg-[#0b0d13] border border-[#c5a059]/60 rounded-2xl p-6 space-y-5 shadow-[0_0_40px_rgba(197,160,89,0.3)] text-left relative overflow-hidden"
            >
              <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-start justify-between border-b border-[#c5a059]/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-[#3a2e12]/80 border border-[#c5a059]/50 rounded-xl">{selectedSealForBreak.runeSymbol || '🪨'}</span>
                  <div>
                    <span className="text-[9.5px] font-mono text-[#fef08a] uppercase font-bold tracking-wider flex items-center gap-1">
                      <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                      <span>CHAIN-SHATTERING CEREMONY</span>
                    </span>
                    <h3 className="font-display text-lg font-bold text-white tracking-wide">
                      {selectedSealForBreak.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSealForBreak(null)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL ORE STAGE PREVIEW */}
              <OreChainsStage seal={selectedSealForBreak} isBroken={false} />

              <p className="text-xs font-sans text-zinc-300 leading-relaxed bg-[#1c160a]/60 border border-[#c5a059]/30 p-3.5 rounded-xl">
                "{selectedSealForBreak.description}"
              </p>

              {/* BUFF TO BE UNLOCKED */}
              <div className="p-3.5 bg-[#07080c] border border-emerald-500/40 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  PERMANENT PASSIVE BUFF TO UNLOCK
                </span>
                <p className="text-xs font-mono font-bold text-white">{selectedSealForBreak.buffName}</p>
                <p className="text-[10.5px] font-sans text-zinc-400">{selectedSealForBreak.buffDescription}</p>
              </div>

              {/* COST SACRIFICE NOTICE */}
              {selectedSealForBreak.costXP > 0 && (
                <div className="p-3 bg-[#3a2e12]/50 border border-[#c5a059]/40 rounded-xl text-xs font-mono text-[#fef08a] flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#c5a059]" />
                  <span>Shattering these chains sacrifices {selectedSealForBreak.costXP} XP from system reserves.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c5a059]/20">
                <button
                  type="button"
                  onClick={() => setSelectedSealForBreak(null)}
                  className="px-4 py-2 bg-[#07080c] hover:bg-[#181d29] border border-[#c5a059]/20 text-zinc-400 hover:text-white rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  ABORT
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerBreakSeal(selectedSealForBreak)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3a2e12] via-[#8a6d2b] to-[#c5a059] hover:from-[#4d3d18] hover:to-[#e5c875] text-[#fef08a] rounded-xl text-xs font-mono font-bold tracking-wider transition shadow-[0_0_25px_rgba(197,160,89,0.4)] flex items-center gap-2 border border-[#c5a059]/80 cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  <span>SHATTER CHAINS NOW</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT SEAL MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl p-6 space-y-4 shadow-[0_0_35px_rgba(197,160,89,0.2)] text-left relative"
            >
              <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                <div className="flex items-center gap-2">
                  <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                  <h3 className="font-display text-base font-bold text-white tracking-wide">
                    {editingSeal ? 'MODIFY ELEMENTAL ORE & CHAINS' : 'FORGE NEW ELEMENTAL ORE & CHAINS'}
                  </h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSeal} className="space-y-3 text-xs font-mono">
                
                {/* BIND TO ACTIVE CHAIN (OPTIONAL) */}
                {!editingSeal && weaknesses.length > 0 && (
                  <div className="p-3 bg-gradient-to-r from-amber-950/40 via-[#11141c] to-amber-950/20 border border-amber-500/40 rounded-xl space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <label className="text-[9.5px] font-mono text-[#fef08a] uppercase font-bold flex items-center gap-1.5">
                        <span>⛓️</span>
                        <span>BIND ACTIVE CHAIN OF THE NAFS (OPTIONAL)</span>
                      </label>
                      <span className="text-[9px] font-mono text-zinc-400">
                        {formData.boundWeaknessId ? 'Chain Selected' : 'Standalone Ore'}
                      </span>
                    </div>
                    <select
                      value={formData.boundWeaknessId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) {
                          setFormData(prev => ({ ...prev, boundWeaknessId: '' }));
                          return;
                        }
                        const targetWeakness = weaknesses.find(w => w.id === selectedId);
                        if (targetWeakness) {
                          const runeInfo = SLIP_RUNES[targetWeakness.category] || SLIP_RUNES.Obligations;
                          setFormData(prev => ({
                            ...prev,
                            boundWeaknessId: selectedId,
                            name: prev.name || `Chain of ${targetWeakness.name}`,
                            description: prev.description || `A heavy chain forged to shatter "${targetWeakness.name}". Root cause: "${targetWeakness.triggerCause}".`,
                            runeSymbol: runeInfo.runeChar,
                            buffName: prev.buffName || `Liberation: ${targetWeakness.name.replace(/^Weakness:\s*/i, '')}`,
                            buffDescription: prev.buffDescription || `+15% XP on Recovery directives, +10 Momentum floor, and resilient mastery against ${targetWeakness.category} slips.`
                          }));
                        }
                      }}
                      className="w-full bg-[#07080c] border border-amber-500/40 rounded-xl p-2 text-[#fef08a] font-mono text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- No Chain (Standalone Elemental Ore) --</option>
                      {weaknesses.map(w => {
                        const isBoundToOther = w.sealId && activeSealIds.has(w.sealId) && (!editingSeal || w.sealId !== editingSeal.id);
                        return (
                          <option key={w.id} value={w.id} disabled={Boolean(isBoundToOther)}>
                            {w.name} ({w.occurrenceCount}/5 slips - {w.category}) {isBoundToOther ? '[Already Bound]' : '[Ready to Bind]'}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[10px] font-sans text-zinc-400">
                      Selecting a chain binds this vulnerability directly to this forged ore. Shattering it grants permanent mastery over the slip.
                    </p>
                  </div>
                )}

                {/* Ore Name */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Ore Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Titanium Core & Heavy Chains"
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {/* CARVED ORE TABLET: CUSTOM INPUT & ARABIC RUNES PALETTE */}
                <div className="p-3 bg-gradient-to-b from-[#07080c] via-[#11141c] to-[#07080c] border-2 border-[#c5a059]/30 rounded-2xl space-y-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.95),_inset_0_1px_1px_rgba(255,255,255,0.06)] relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-1.5">
                    <span className="text-[9px] font-mono uppercase text-[#fef08a] font-bold flex items-center gap-1.5 tracking-wider">
                      <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                      CARVED ORE RUNES & ARABIC CALLIGRAPHY PALETTE
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">Click rune to insert or edit custom symbol</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 items-center">
                    {/* Carved Custom Input Slot */}
                    <div className="col-span-1">
                      <label className="text-[9px] font-mono text-[#c5a059] uppercase block mb-1 font-bold">Carved Symbol</label>
                      <input
                        type="text"
                        value={formData.runeSymbol}
                        onChange={(e) => setFormData({ ...formData, runeSymbol: e.target.value })}
                        placeholder="🪨"
                        className="w-full bg-black/90 border-2 border-[#c5a059]/40 rounded-xl py-2 px-1 text-center text-xl text-[#fef08a] font-serif font-bold tracking-widest shadow-[inset_0_3px_8px_rgba(0,0,0,0.95)] focus:outline-none focus:border-[#c5a059] transition"
                      />
                    </div>

                    {/* Carved Runes Palette */}
                    <div className="col-span-3 space-y-2">
                      <div>
                        <label className="text-[9px] font-mono text-[#c5a059] uppercase block mb-1 font-bold">
                          6 Sacred Nafs Slip Runes
                        </label>
                        <div className="grid grid-cols-6 gap-1 bg-black/60 border border-[#c5a059]/30 p-1.5 rounded-xl">
                          {Object.entries(SLIP_RUNES).map(([catKey, runeDef]) => {
                            const isSelected = formData.runeSymbol === runeDef.runeChar;
                            return (
                              <button
                                key={catKey}
                                type="button"
                                onClick={() => setFormData({ 
                                  ...formData, 
                                  runeSymbol: runeDef.runeChar,
                                  buffName: formData.buffName || `Aura of ${runeDef.arabicTitle}`,
                                  buffDescription: formData.buffDescription || `Sacred mastery unchaining ${runeDef.description}.`
                                })}
                                className={`flex flex-col items-center justify-center p-1 rounded-lg border transition cursor-pointer select-none ${
                                  isSelected 
                                    ? 'bg-[#3a2e12] border-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.5)] scale-105' 
                                    : 'bg-[#07080c] border-white/10 hover:border-[#c5a059]/40'
                                }`}
                                title={`${runeDef.name} (${runeDef.arabicTitle}) - ${runeDef.description}`}
                              >
                                <span className="text-base font-serif font-black text-[#fef08a] leading-tight">
                                  {runeDef.runeChar}
                                </span>
                                <span className="text-[7.5px] font-mono text-zinc-400 truncate w-full text-center">
                                  {runeDef.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Additional Ancient Runes & Symbols</label>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-black/60 border border-[#c5a059]/20 rounded-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
                          {SUGGESTED_RUNES.map((rune, idx) => {
                            const isSelected = formData.runeSymbol === rune;
                            return (
                              <button
                                key={`${rune}-${idx}`}
                                type="button"
                                onClick={() => setFormData({ ...formData, runeSymbol: rune })}
                                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition border font-serif font-bold select-none cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a] font-black shadow-[0_0_10px_rgba(197,160,89,0.4)] scale-105'
                                    : 'bg-[#07080c] border-[#c5a059]/20 text-zinc-400 hover:bg-[#181d29] hover:text-[#fef08a] hover:border-[#c5a059]/50'
                                }`}
                                title={`Select carved rune ${rune}`}
                              >
                                {rune}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Lore / Ore Origin</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the raw mineral properties and the heavy chains binding it..."
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {/* Rarity & Level & XP Cost */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Shape Complexity Rank</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value as SealRarity })}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 text-white rounded-xl p-2 focus:outline-none focus:border-[#c5a059] cursor-pointer text-xs"
                    >
                      <option value="Common">Common (Boulder • 5 Facets)</option>
                      <option value="Rare">Rare (Prism • 8 Facets)</option>
                      <option value="Epic">Epic (Octahedron • 14 Facets)</option>
                      <option value="Legendary">Legendary (Spire Cluster • 24 Facets)</option>
                      <option value="Divine">Divine (Celestial Polytope • 34 Facets)</option>
                      <option value="Forbidden">Forbidden (Tesseract • 48+ Facets)</option>
                    </select>
                    <div className="mt-1 text-[8.5px] font-mono text-zinc-400 truncate">
                      {ORE_COMPLEXITY_INFO[formData.rarity]?.shapeName}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Required Level</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.requiredLevel}
                      onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2 text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Unshackling Cost XP</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={formData.costXP}
                      onChange={(e) => setFormData({ ...formData, costXP: Number(e.target.value) })}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2 text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                {/* Linked Requirements */}
                <div className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono uppercase text-[#c5a059] font-bold">OPTIONAL LINKED REQUIREMENTS</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-0.5">Required Directive</label>
                      <select
                        value={formData.requiredQuestId}
                        onChange={(e) => setFormData({ ...formData, requiredQuestId: e.target.value })}
                        className="w-full bg-[#07080c] border border-[#c5a059]/30 text-zinc-300 rounded-lg p-1.5 focus:outline-none focus:border-[#c5a059] cursor-pointer"
                      >
                        <option value="">None (No quest requirement)</option>
                        {state.quests.map(q => (
                          <option key={q.id} value={q.id}>{q.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-0.5">Required Skill</label>
                      <select
                        value={formData.requiredSkillId}
                        onChange={(e) => setFormData({ ...formData, requiredSkillId: e.target.value })}
                        className="w-full bg-[#07080c] border border-[#c5a059]/30 text-zinc-300 rounded-lg p-1.5 focus:outline-none focus:border-[#c5a059] cursor-pointer"
                      >
                        <option value="">None (No skill requirement)</option>
                        {state.skills.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* BUFF SETTINGS */}
                <div className="p-3 bg-[#1c160a]/60 border border-[#c5a059]/40 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono uppercase text-[#fef08a] font-bold">UNCHAINED ORE PERK CONFIGURATION</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Perk Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.buffName}
                        onChange={(e) => setFormData({ ...formData, buffName: e.target.value })}
                        placeholder="e.g. Ironclad Focus Surge"
                        className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">XP Bonus Multiplier (+%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.xpBonusPercent}
                        onChange={(e) => setFormData({ ...formData, xpBonusPercent: Number(e.target.value) })}
                        className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-1.5 text-emerald-300 font-bold focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Perk Description</label>
                    <input
                      type="text"
                      value={formData.buffDescription}
                      onChange={(e) => setFormData({ ...formData, buffDescription: e.target.value })}
                      placeholder="e.g. +20% XP boost on all main directives and +2 Focus level."
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Boost Attribute</label>
                      <select
                        value={formData.selectedAttributeId}
                        onChange={(e) => setFormData({ ...formData, selectedAttributeId: e.target.value })}
                        className="w-full bg-[#07080c] border border-[#c5a059]/30 text-amber-300 font-bold rounded-lg p-1.5 focus:outline-none focus:border-[#c5a059] cursor-pointer"
                      >
                        {state.attributes.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Attribute Level Boost (+)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.attributeBoostAmount}
                        onChange={(e) => setFormData({ ...formData, attributeBoostAmount: Number(e.target.value) })}
                        className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-lg p-1.5 text-amber-300 font-bold focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#c5a059]/20">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-[#07080c] hover:bg-[#181d29] border border-[#c5a059]/20 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#3a2e12] via-[#8a6d2b] to-[#c5a059] hover:from-[#4d3d18] hover:to-[#e5c875] text-[#fef08a] rounded-xl font-bold transition shadow-lg cursor-pointer"
                  >
                    {editingSeal ? 'SAVE CHANGES' : 'FORGE ELEMENTAL ORE'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BIND CHAINS OF THE NAFS MODAL */}
      <AnimatePresence>
        {isBindChainModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl p-6 space-y-4 shadow-[0_0_40px_rgba(197,160,89,0.2)] text-left relative"
            >
              <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-[#3a2e12]/80 border border-[#c5a059]/60 rounded-xl text-[#fef08a]">
                    <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-white tracking-wide flex items-center gap-2">
                      <span>BIND CHAINS OF THE NAFS INTO ORES</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Bind recurrent slips and spiritual vulnerabilities into heavy forged elemental ores to shatter and overcome.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBindChainModalOpen(false)} 
                  className="text-zinc-400 hover:text-white cursor-pointer p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {weaknesses.length === 0 ? (
                <div className="p-8 text-center bg-[#07080c] border border-white/10 rounded-2xl space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-[#18150c] border border-[#c5a059]/30 flex items-center justify-center text-xl">
                    ⛓️
                  </div>
                  <h4 className="font-mono text-sm font-bold text-white">NO ACTIVE CHAINS FOUND</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans leading-relaxed">
                    When you track recurrent slips and weaknesses in Muḥāsabah (Self-Accountability), they form Chains of the Nafs that can be bound into elemental ores right here.
                  </p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                  {weaknesses.map((w) => {
                    const linkedSeal = seals.find(s => s.id === w.sealId);
                    const isBound = Boolean(linkedSeal && w.status === 'Sealed');
                    const runeDef = SLIP_RUNES[w.category] || SLIP_RUNES.Obligations;

                    return (
                      <div 
                        key={w.id}
                        className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isBound
                            ? 'bg-[#0f1418] border-emerald-500/30'
                            : 'bg-[#07080c] border-[#c5a059]/30 hover:border-[#c5a059]/60'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="h-7 w-7 rounded-lg bg-[#3a2e12] border border-[#c5a059]/50 flex items-center justify-center text-[#fef08a] font-serif font-bold text-sm">
                              {runeDef.runeChar}
                            </span>
                            <h4 className="text-sm font-mono font-bold text-white truncate">
                              {w.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/60 border border-white/10 text-zinc-300">
                              {w.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300">
                              {w.occurrenceCount}/5 slips
                            </span>
                          </div>

                          {w.triggerCause && (
                            <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                              <span className="text-zinc-500">Root Cause:</span> "{w.triggerCause}"
                            </p>
                          )}

                          <div className="pt-1 flex items-center gap-2 text-[10.5px] font-mono">
                            {isBound ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Bound to Ore: "{linkedSeal?.name}"
                              </span>
                            ) : (
                              <span className="text-[#fef08a] flex items-center gap-1 font-bold">
                                <span>⚡</span> Ready to be bound into Elemental Ore
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isBound ? (
                            <button
                              type="button"
                              onClick={() => handleUnbindWeaknessDirect(w.id)}
                              className="px-3 py-1.5 bg-[#0b0d13] hover:bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300 rounded-lg transition cursor-pointer"
                              title="Unbind this chain from its ore so you can re-bind it or delete it cleanly"
                            >
                              Unbind Chain
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleBindWeaknessDirect(w.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-[#3a2e12] to-[#8a6d2b] hover:from-[#4d3d18] hover:to-[#c5a059] border border-[#c5a059]/60 text-xs font-mono font-bold text-[#fef08a] rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                title="Quickly forge this chain into an elemental ore"
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span>Quick Bind</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsBindChainModalOpen(false);
                                  handleOpenCreateModal(w.id);
                                }}
                                className="px-3 py-1.5 bg-[#0b0d13] hover:bg-[#181d29] border border-[#c5a059]/40 text-xs font-mono text-zinc-300 hover:text-white rounded-lg transition cursor-pointer"
                                title="Customize stats, rarity, and perks for this chain ore"
                              >
                                Customize
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#c5a059]/20">
                <span className="text-[10px] font-mono text-zinc-400">
                  {unboundWeaknesses.length} unbound chains available
                </span>
                <button
                  type="button"
                  onClick={() => setIsBindChainModalOpen(false)}
                  className="px-4 py-2 bg-[#07080c] hover:bg-[#181d29] border border-[#c5a059]/30 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
