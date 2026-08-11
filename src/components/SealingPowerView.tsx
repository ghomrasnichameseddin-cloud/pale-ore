import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { PowerSeal, SealRarity } from '../types';
import { 
  Sparkles, Lock, Unlock, ShieldAlert, Award, Plus, Trash2, Edit3, 
  AlertCircle, Zap, Search, X, Pickaxe, Link as LinkIcon, Flame, Hammer,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUGGESTED_RUNES = [
  // Arabic Alphabet Calligraphy Runes
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي',
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
}> = {
  Common: {
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'bg-gradient-to-b from-slate-900/90 via-zinc-950 to-zinc-950',
    text: 'text-cyan-300',
    badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    runeSymbol: '⛓️',
    ringGradient: 'from-cyan-500 to-blue-600'
  },
  Rare: {
    border: 'border-purple-500/50 hover:border-purple-400',
    bg: 'bg-gradient-to-b from-purple-950/60 via-zinc-950 to-zinc-950',
    text: 'text-purple-300',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.2)]',
    runeSymbol: '🪨',
    ringGradient: 'from-purple-500 to-indigo-600'
  },
  Epic: {
    border: 'border-emerald-500/50 hover:border-emerald-400',
    bg: 'bg-gradient-to-b from-emerald-950/60 via-zinc-950 to-zinc-950',
    text: 'text-emerald-300',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    glow: 'shadow-[0_0_22px_rgba(16,185,129,0.2)]',
    runeSymbol: '💎',
    ringGradient: 'from-emerald-500 to-teal-600'
  },
  Legendary: {
    border: 'border-amber-500/60 hover:border-amber-400',
    bg: 'bg-gradient-to-b from-amber-950/60 via-zinc-950 to-zinc-950',
    text: 'text-amber-300',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    glow: 'shadow-[0_0_28px_rgba(245,158,11,0.25)]',
    runeSymbol: '🪙',
    ringGradient: 'from-amber-400 to-orange-600'
  },
  Divine: {
    border: 'border-rose-500/70 hover:border-rose-400',
    bg: 'bg-gradient-to-b from-rose-950/60 via-zinc-950 to-zinc-950',
    text: 'text-rose-300',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-500/70 font-bold shadow-[0_0_18px_rgba(244,63,94,0.35)]',
    glow: 'shadow-[0_0_32px_rgba(244,63,94,0.3)]',
    runeSymbol: '🔥',
    ringGradient: 'from-rose-500 to-red-600'
  },
  Forbidden: {
    border: 'border-violet-500/80 hover:border-violet-400',
    bg: 'bg-gradient-to-b from-violet-950/80 via-zinc-950 to-zinc-950',
    text: 'text-violet-300',
    badge: 'bg-violet-950/90 text-violet-300 border-violet-500/80 font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    glow: 'shadow-[0_0_35px_rgba(139,92,246,0.35)]',
    runeSymbol: '🌋',
    ringGradient: 'from-violet-600 to-fuchsia-700'
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
    stroke: '#06b6d4',
    glow: '',
    oreGrad1: '#1e293b',
    oreGrad2: '#0e7490',
    oreGrad3: '#0891b2',
    coreGradient: 'from-cyan-400 via-blue-500 to-indigo-700',
    sparkBg: 'bg-cyan-300',
    chainColor: '#475569',
    chainStroke: '#94a3b8',
    veinColor: '#22d3ee'
  },
  Rare: {
    stroke: '#a855f7',
    glow: '',
    oreGrad1: '#311042',
    oreGrad2: '#6b21a8',
    oreGrad3: '#9333ea',
    coreGradient: 'from-purple-300 via-purple-500 to-indigo-900',
    sparkBg: 'bg-purple-300',
    chainColor: '#3b2063',
    chainStroke: '#c084fc',
    veinColor: '#c084fc'
  },
  Epic: {
    stroke: '#10b981',
    glow: '',
    oreGrad1: '#022c22',
    oreGrad2: '#047857',
    oreGrad3: '#10b981',
    coreGradient: 'from-emerald-300 via-teal-500 to-emerald-900',
    sparkBg: 'bg-emerald-300',
    chainColor: '#1e3a2b',
    chainStroke: '#34d399',
    veinColor: '#34d399'
  },
  Legendary: {
    stroke: '#f59e0b',
    glow: '',
    oreGrad1: '#451a03',
    oreGrad2: '#b45309',
    oreGrad3: '#f59e0b',
    coreGradient: 'from-amber-200 via-amber-500 to-orange-800',
    sparkBg: 'bg-amber-300',
    chainColor: '#78350f',
    chainStroke: '#fbbf24',
    veinColor: '#fbbf24'
  },
  Divine: {
    stroke: '#f43f5e',
    glow: '',
    oreGrad1: '#4c0519',
    oreGrad2: '#be123c',
    oreGrad3: '#f43f5e',
    coreGradient: 'from-rose-200 via-pink-500 to-rose-900',
    sparkBg: 'bg-rose-300',
    chainColor: '#4c0519',
    chainStroke: '#fb7185',
    veinColor: '#fb7185'
  },
  Forbidden: {
    stroke: '#8b5cf6',
    glow: '',
    oreGrad1: '#17072b',
    oreGrad2: '#4c1d95',
    oreGrad3: '#7c3aed',
    coreGradient: 'from-violet-300 via-purple-600 to-black',
    sparkBg: 'bg-violet-300',
    chainColor: '#2e1065',
    chainStroke: '#a78bfa',
    veinColor: '#c084fc'
  }
};

// 3D Chain Path Link Generator Component
const Render3DChainPath: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  curveY?: number; count?: number;
  chainColor?: string; chainStroke?: string;
}> = ({ x1, y1, x2, y2, curveY = 0, count = 10, chainColor = '#475569', chainStroke = '#cbd5e1' }) => {
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
              <rect x="-10" y="-6" width="20" height="12" rx="5" fill={chainColor} stroke="#09090b" strokeWidth="1.8" />
              <rect x="-5" y="-2.5" width="10" height="5" rx="2.5" fill="#09090b" />
              {/* Top Specular Edge Highlight */}
              <path d="M -8 -4.5 L 8 -4.5" stroke={chainStroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
              {/* Bottom Shadow Edge */}
              <path d="M -8 4.5 L 8 4.5" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            </g>
          ) : (
            /* Narrow Side-On Interlocking Twisted Link */
            <g>
              <rect x="-5" y="-8.5" width="10" height="17" rx="4.5" fill="#18181b" stroke={chainColor} strokeWidth="2.2" />
              <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke={chainStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.95" />
              <line x1="-3" y1="-6.5" x2="-3" y2="6.5" stroke="#000000" strokeWidth="1" opacity="0.8" />
            </g>
          )}
        </g>
      ))}
    </g>
  );
};

const OreChainsStage: React.FC<OreChainsStageProps> = ({ seal, isBroken }) => {
  const theme = RARITY_ORE_THEMES[seal.rarity] || RARITY_ORE_THEMES.Common;
  const strokeColor = isBroken ? theme.stroke : '#52525b';

  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center my-3 group/ore select-none shadow-[inset_0_4px_20px_rgba(0,0,0,0.95),_0_10px_30px_rgba(0,0,0,0.8)]">
      
      {/* MINE CHAMBER & STONE MASONRY WALLS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_var(--tw-gradient-stops))] from-zinc-900/90 via-zinc-950 to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#71717a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      {/* FORGE PEDESTAL ALIVE GROUND AMBIENCE */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black via-zinc-950/80 to-transparent pointer-events-none" />

      {/* MAIN ORE & CHAINS DISPLAY CANVAS */}
      <div className={`relative w-60 h-60 flex items-center justify-center transition-all duration-700 ${isBroken ? theme.glow : ''}`}>
        
        {/* BACKGROUND METALLIC FORGE SHIELD RING */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="92" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="6 3" opacity="0.35" />
          <circle cx="100" cy="100" r="86" stroke={strokeColor} strokeWidth="2" opacity="0.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <circle
              key={deg}
              cx={100 + 86 * Math.cos((deg * Math.PI) / 180)}
              cy={100 + 86 * Math.sin((deg * Math.PI) / 180)}
              r="3"
              fill={strokeColor}
              stroke="#000"
              strokeWidth="1"
              opacity="0.8"
            />
          ))}
          <circle cx="100" cy="100" r="74" stroke={strokeColor} strokeWidth="1" strokeDasharray="12 4" opacity="0.25" />
        </svg>

        {/* 3D CARVED MINERAL MONOLITH ORE DISPLAY */}
        <div className="relative w-44 h-44 flex items-center justify-center z-10">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
            <defs>
              <linearGradient id={`ore-top-${seal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="50%" stopColor={theme.oreGrad1} />
                <stop offset="100%" stopColor={theme.oreGrad2} />
              </linearGradient>

              <linearGradient id={`ore-left-${seal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.oreGrad1} />
                <stop offset="100%" stopColor="#09090b" />
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
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="50%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>

            {/* 1. STONE FORGE PEDESTAL */}
            <ellipse cx="100" cy="165" rx="65" ry="16" fill="#000000" opacity="0.85" filter="blur(3px)" />
            <path d="M 40,160 L 160,160 L 145,175 L 55,175 Z" fill={`url(#pedestal-grad-${seal.id})`} stroke="#3f3f46" strokeWidth="1" />
            <line x1="40" y1="160" x2="160" y2="160" stroke="#71717a" strokeWidth="1" />

            {/* 2. ORE MONOLITH 3D CAST SHADOW */}
            <path d="M 100,25 L 155,60 L 140,145 L 60,155 L 30,85 Z" fill="#000000" opacity="0.7" transform="translate(5, 7)" />

            {/* 3. MAIN CHISELED FACETS */}
            {/* Top Roof Bevel Facet */}
            <path d="M 100,25 L 155,60 L 100,95 L 40,65 Z" fill={`url(#ore-top-${seal.id})`} stroke="#18181b" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M 100,25 L 40,65" stroke="#ffffff" strokeWidth="1.5" opacity="0.45" />

            {/* Left Vertical Chiseled Wall */}
            <path d="M 40,65 L 100,95 L 60,155 L 30,85 Z" fill={`url(#ore-left-${seal.id})`} stroke="#09090b" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 40,65 L 30,85 L 60,155" stroke="#71717a" strokeWidth="1" opacity="0.5" />

            {/* Right Front Facet */}
            <path d="M 100,95 L 155,60 L 140,145 L 60,155 Z" fill={`url(#ore-right-${seal.id})`} stroke="#09090b" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 155,60 L 140,145 L 60,155" stroke="#000000" strokeWidth="2" opacity="0.8" />

            {/* 4. INNER CRYSTALLINE CORE / FISSURE VEIN */}
            <path d="M 100,40 L 120,80 L 100,135 L 80,85 Z" fill={isBroken ? `url(#ore-core-${seal.id})` : '#27272a'} stroke={isBroken ? '#ffffff' : '#52525b'} strokeWidth="1.2" opacity={isBroken ? 0.95 : 0.75} />

            {/* 5. DEEP STONE FISSURES / CRACK LINES WITH OCCLUSION */}
            <path d="M 100,25 L 100,95" stroke={isBroken ? theme.veinColor : '#3f3f46'} strokeWidth={isBroken ? "2.5" : "1.5"} />
            <path d="M 40,65 L 100,95" stroke={isBroken ? theme.veinColor : '#3f3f46'} strokeWidth={isBroken ? "2" : "1.2"} />
            <path d="M 155,60 L 100,95" stroke={isBroken ? theme.veinColor : '#3f3f46'} strokeWidth={isBroken ? "2" : "1.2"} />
            <path d="M 60,155 L 100,95" stroke={isBroken ? theme.veinColor : '#3f3f46'} strokeWidth={isBroken ? "2.5" : "1.5"} />
          </svg>

          {/* ORE CENTER CARVED INSCRIPTION / ARABIC GLYPH */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
            <div className="relative flex items-center justify-center">
              {/* Carved Inner Shadow */}
              <span className="absolute text-3xl font-serif text-black font-black translate-x-[1.5px] translate-y-[2px] opacity-90">
                {seal.runeSymbol || '🪨'}
              </span>
              {/* Carved Specular Light Bevel */}
              <span className="absolute text-3xl font-serif text-amber-100/40 font-black -translate-x-[1px] -translate-y-[1px]">
                {seal.runeSymbol || '🪨'}
              </span>
              {/* Main Carved Rune Symbol */}
              <span className={`relative text-3xl font-serif font-black transition-transform duration-500 ${
                isBroken
                  ? 'scale-125 text-amber-200 [text-shadow:_0_0_12px_rgba(251,191,36,0.85),_0_2px_4px_rgba(0,0,0,0.95)]'
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
            <div className="relative z-30 px-3.5 py-1.5 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/80 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.95),_0_0_20px_rgba(245,158,11,0.35),_inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
              <Lock className="h-4 w-4 text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <span className="text-[10px] font-mono font-bold text-amber-200 tracking-widest uppercase flex items-center gap-1 [text-shadow:_0_1px_2px_rgba(0,0,0,0.9)]">
                CHAIN-BOUND
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 border border-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
            </div>

          </div>
        )}

        {/* SHATTERED HEAVY CHAIN FRAGMENTS (UNCHAINED / BROKEN STATE) */}
        {isBroken && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {/* Top Left Broken Chain End */}
            <div className="absolute top-4 left-5 rotate-45 flex items-center gap-1 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              <div className="w-5 h-3 border-2 border-amber-400 bg-zinc-900 rounded-lg shadow-inner" />
              <div className="w-3 h-5 border-2 border-zinc-500 bg-zinc-950 rounded-lg" />
            </div>

            {/* Top Right Broken Chain End */}
            <div className="absolute top-4 right-5 -rotate-45 flex items-center gap-1 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              <div className="w-3 h-5 border-2 border-zinc-500 bg-zinc-950 rounded-lg" />
              <div className="w-5 h-3 border-2 border-amber-400 bg-zinc-900 rounded-lg shadow-inner" />
            </div>

            {/* Bottom Fallen Fragment on Pedestal */}
            <div className="absolute bottom-4 left-10 rotate-12 flex items-center gap-1 opacity-75">
              <div className="w-4 h-2.5 border border-zinc-400 bg-black rounded" />
              <div className="w-2.5 h-4 border border-zinc-600 bg-zinc-900 rounded" />
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
    toggleBatterySaverMode
  } = usePOS();

  const isBatterySaver = state.batterySettings?.batterySaverMode ?? false;

  const playerInfo = getPlayerLevelInfo();
  const seals = state.seals || [];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Locked' | 'Broken'>('All');
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    attributeBoostAmount: 2
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

  const handleOpenCreateModal = () => {
    setEditingSeal(null);
    setFormData({
      name: '',
      description: '',
      rarity: 'Common',
      requiredLevel: Math.max(1, playerInfo.level),
      costXP: 200,
      requiredQuestId: '',
      requiredSkillId: '',
      requiredSkillLevel: 1,
      buffName: '',
      buffDescription: '',
      xpBonusPercent: 15,
      momentumBoost: 5,
      runeSymbol: '🪨',
      selectedAttributeId: 'a-4',
      attributeBoostAmount: 2
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (seal: PowerSeal) => {
    setEditingSeal(seal);
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
      attributeBoostAmount: seal.attributeBoosts?.[0]?.boostAmount || 2
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
    }

    setIsFormOpen(false);
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
      <div className="p-6 bg-gradient-to-r from-slate-950 via-zinc-950 to-cyan-950/90 border border-cyan-500/40 rounded-2xl relative overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.15)]">
        
        {/* BACKGROUND METALLIC CHAIN LINKS PATTERN */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 opacity-15 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full text-cyan-400" viewBox="0 0 200 200" fill="none">
            <path d="M 20 20 L 180 180" stroke="currentColor" strokeWidth="12" strokeDasharray="16 8" />
            <path d="M 180 20 L 20 180" stroke="currentColor" strokeWidth="12" strokeDasharray="16 8" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 bg-cyan-950/90 border border-cyan-500/60 rounded-xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Pickaxe className="h-6 w-6 text-cyan-400 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-amber-400/90 uppercase font-bold flex items-center gap-1">
                    <span>⛓️</span> FORGED ORE & CHAINS VAULT <span>⛓️</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 font-bold uppercase">
                    CHAIN MATRIX v4.0
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  CHAIN-BOUND ELEMENTAL ORES
                </h2>
              </div>
            </div>
            <p className="text-xs text-cyan-200/70 max-w-2xl font-sans leading-relaxed">
              Shatter heavy forged iron chains binding raw luminescent elemental ores. Unchaining an ore bursts its shackles, releasing permanent passive multipliers, attribute surges, and operator perks into your system.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold tracking-wider transition shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 border border-cyan-400/50"
            >
              <Plus className="h-4 w-4" />
              <span>FORGE NEW ELEMENTAL ORE</span>
            </button>
          </div>
        </div>

        {/* ACTIVE BUFF MATRIX HUD */}
        <div className="mt-6 pt-5 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="bg-zinc-950/90 border border-cyan-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">CHAINS SHATTERED</span>
              <span className="text-lg font-mono font-bold text-cyan-300 flex items-baseline gap-1 mt-0.5">
                {brokenSeals.length} <span className="text-xs text-zinc-500 font-normal">/ {seals.length} UNCHAINED</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Unlock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-zinc-950/90 border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
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

          <div className="bg-zinc-950/90 border border-amber-500/40 p-3.5 rounded-xl flex items-center justify-between col-span-1 sm:col-span-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">AWAKENED ATTRIBUTE SURGES</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {Object.keys(totalAttributeBoosts).length === 0 ? (
                  <span className="text-xs font-mono text-zinc-500">No active attribute surges. Shatter chains to awaken raw ore power.</span>
                ) : (
                  Object.entries(totalAttributeBoosts).map(([attrId, boost]) => {
                    const attr = state.attributes.find(a => a.id === attrId);
                    return (
                      <span key={attrId} className="px-2 py-0.5 text-[9.5px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/50 rounded-lg font-bold shadow-sm">
                        +{boost} {attr?.name || 'ATTRIBUTE'}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 ml-2">
              <Award className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* ARCANE RESONANCE SET BONUSES */}
        <div className="mt-4 p-3.5 bg-zinc-950/90 border border-cyan-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">ELEMENTAL RESONANCE SYNERGY SETS:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 2 
                ? 'bg-cyan-900/80 text-cyan-200 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
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
                ? 'bg-amber-900/80 text-amber-200 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
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
                : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {unsealMessage.isError ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              ) : (
                <Pickaxe className="h-5 w-5 shrink-0 text-cyan-400 animate-pulse" />
              )}
              <span className="font-semibold">{unsealMessage.text}</span>
            </div>
            <button onClick={() => setUnsealMessage(null)} className="text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & CONTROL BAR */}
      <div className="p-4 bg-zinc-950/80 border border-cyan-500/20 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-cyan-400/60" />
          <input
            type="text"
            placeholder="Search elemental ores, chain-bound minerals, or buff perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/10">
            {(['All', 'Locked', 'Broken'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-[10px] font-mono rounded-lg transition uppercase font-bold ${
                  statusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
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
            className="bg-zinc-900/90 border border-white/10 text-zinc-300 rounded-xl px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-cyan-500/60 cursor-pointer"
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
        <div className="text-center py-16 border border-dashed border-cyan-500/30 bg-zinc-950/60 rounded-2xl space-y-3">
          <ShieldAlert className="h-12 w-12 text-cyan-400 mx-auto animate-pulse" />
          <p className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
            NO ELEMENTAL ORES FOUND MATCHING CRITERIA
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Forge a new elemental ore or reset active search filters.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-mono font-bold transition inline-flex items-center gap-1.5"
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
                    ? 'bg-gradient-to-b from-cyan-950/60 via-zinc-950 to-zinc-950 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                    : `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                }`}
              >
                {/* RUNIC WATERMARK & CORNER BRACKETS */}
                <div className="absolute top-2 left-3 text-[9px] font-mono text-white/10 font-bold select-none pointer-events-none">
                  [ ⛓️ {rarityStyle.runeSymbol} ⛓️ ]
                </div>
                <div className="absolute top-2 right-3 text-[9px] font-mono text-white/10 font-bold select-none pointer-events-none">
                  #ORE-{seal.id.slice(-4).toUpperCase()}
                </div>

                <div className="space-y-3 relative z-10 pt-2">
                  
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-white tracking-wide leading-snug">
                        {seal.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${rarityStyle.badge}`}>
                          {seal.rarity}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase border flex items-center gap-1.5 shrink-0 ${
                      isBroken 
                        ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-zinc-950 text-zinc-400 border-white/10'
                    }`}>
                      {isBroken ? <Unlock className="h-3 w-3 text-cyan-400" /> : <Lock className="h-3 w-3 text-amber-500/80" />}
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
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-100 shadow-inner' 
                      : 'bg-zinc-950/80 border-white/10 text-zinc-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-mono uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                        <Pickaxe className="h-3 w-3 text-amber-400" />
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
                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-[10.5px] font-mono">
                      <div className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                        ✦ UNCHAINING REQUIREMENTS:
                      </div>
                      
                      {/* Level req */}
                      <div className={`flex items-center justify-between p-1 rounded bg-zinc-950/50 ${meetsLevel ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        <span>Player Level {seal.requiredLevel}+</span>
                        <span className="font-bold">{meetsLevel ? '✓ MET' : `LVL ${playerInfo.level}`}</span>
                      </div>

                      {/* XP cost */}
                      {seal.costXP > 0 && (
                        <div className={`flex items-center justify-between p-1 rounded bg-zinc-950/50 ${meetsXp ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span>XP Sacrifice: {seal.costXP} XP</span>
                          <span className="font-bold">{meetsXp ? '✓ READY' : `${playerInfo.totalXp} XP`}</span>
                        </div>
                      )}

                      {/* Required quest */}
                      {reqQuest && (
                        <div className={`flex items-center justify-between p-1 rounded bg-zinc-950/50 ${meetsQuest ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span className="truncate max-w-[170px]">Req Quest: "{reqQuest.name}"</span>
                          <span className="font-bold">{meetsQuest ? '✓ DONE' : 'INCOMPLETE'}</span>
                        </div>
                      )}

                      {/* Required skill */}
                      {reqSkill && (
                        <div className={`flex items-center justify-between p-1 rounded bg-zinc-950/50 ${meetsSkill ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span>Skill "{reqSkill.name}" LVL {seal.requiredSkillLevel}+</span>
                          <span className="font-bold">{meetsSkill ? '✓ MET' : `LVL ${skillInfo?.level || 0}`}</span>
                        </div>
                      )}

                      {/* Required streak */}
                      {seal.requiredStreakDays && seal.requiredStreakDays > 0 && (
                        <div className={`flex items-center justify-between p-1 rounded bg-zinc-950/50 ${meetsStreak ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          <span>Streak: {seal.requiredStreakDays}+ Days</span>
                          <span className="font-bold">{meetsStreak ? '✓ MET' : `${maxStreakInSystem} DAYS`}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Broken At Timestamp */}
                  {isBroken && seal.brokenAt && (
                    <div className="text-[9.5px] font-mono text-cyan-300/80 flex items-center justify-between pt-1 border-t border-cyan-500/20">
                      <span>UNCHAINED DATE:</span>
                      <span className="font-bold">{new Date(seal.brokenAt).toLocaleDateString()}</span>
                    </div>
                  )}

                </div>

                {/* CARD ACTION BUTTONS */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(seal)}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white rounded-lg transition"
                      title="Edit Elemental Ore"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSeal(seal.id)}
                      className="p-1.5 bg-zinc-900 hover:bg-rose-950 border border-white/10 text-zinc-400 hover:text-rose-300 rounded-lg transition"
                      title="Delete Elemental Ore"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {isBroken && (
                      <button
                        onClick={() => relockSeal(seal.id)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[9.5px] font-mono text-zinc-400 hover:text-zinc-200 rounded-lg transition"
                        title="Re-bind Chains"
                      >
                        RE-BIND CHAINS
                      </button>
                    )}
                  </div>

                  {!isBroken ? (
                    <button
                      onClick={() => setSelectedSealForBreak(seal)}
                      className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl border transition flex items-center gap-1.5 ${
                        canBreak
                          ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:to-teal-500 text-white border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse'
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
                        className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-[10px] font-mono font-bold text-cyan-200 rounded-lg transition shadow-sm flex items-center gap-1"
                        title="Channel localized energy surge from this unchained ore"
                      >
                        <Zap className="h-3 w-3 text-amber-400 animate-pulse" />
                        <span>CHANNEL PULSE</span>
                      </button>
                      <span className="text-[10.5px] font-mono text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1.5 rounded-lg shadow-sm">
                        <Pickaxe className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        UNCHAINED
                      </span>
                    </div>
                  )}
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
              className="max-w-md w-full bg-zinc-950 border border-cyan-500/60 rounded-2xl p-6 space-y-5 shadow-[0_0_40px_rgba(6,182,212,0.3)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Pickaxe className="h-36 w-36 text-cyan-400 animate-pulse" />
              </div>

              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-cyan-950/80 border border-cyan-500/50 rounded-xl">{selectedSealForBreak.runeSymbol || '🪨'}</span>
                  <div>
                    <span className="text-[9.5px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                      ✦ CHAIN-SHATTERING CEREMONY ✦
                    </span>
                    <h3 className="font-display text-lg font-bold text-white tracking-wide">
                      {selectedSealForBreak.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSealForBreak(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL ORE STAGE PREVIEW */}
              <OreChainsStage seal={selectedSealForBreak} isBroken={false} />

              <p className="text-xs font-sans text-zinc-300 leading-relaxed bg-cyan-950/40 border border-cyan-500/30 p-3.5 rounded-xl">
                "{selectedSealForBreak.description}"
              </p>

              {/* BUFF TO BE UNLOCKED */}
              <div className="p-3.5 bg-zinc-900 border border-emerald-500/40 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  PERMANENT PASSIVE BUFF TO UNLOCK
                </span>
                <p className="text-xs font-mono font-bold text-white">{selectedSealForBreak.buffName}</p>
                <p className="text-[10.5px] font-sans text-zinc-400">{selectedSealForBreak.buffDescription}</p>
              </div>

              {/* COST SACRIFICE NOTICE */}
              {selectedSealForBreak.costXP > 0 && (
                <div className="p-3 bg-amber-950/50 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Shattering these chains sacrifices {selectedSealForBreak.costXP} XP from system reserves.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedSealForBreak(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono transition"
                >
                  ABORT
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerBreakSeal(selectedSealForBreak)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold tracking-wider transition shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-2 border border-cyan-400/60"
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
              className="max-w-xl w-full bg-zinc-950 border border-cyan-500/50 rounded-2xl p-6 space-y-4 shadow-[0_0_35px_rgba(6,182,212,0.2)] text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Pickaxe className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-display text-base font-bold text-white tracking-wide">
                    {editingSeal ? 'MODIFY ELEMENTAL ORE & CHAINS' : 'FORGE NEW ELEMENTAL ORE & CHAINS'}
                  </h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSeal} className="space-y-3 text-xs font-mono">
                
                {/* Ore Name */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Ore Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Titanium Core & Heavy Chains"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* CARVED ORE TABLET: CUSTOM INPUT & ARABIC RUNES PALETTE */}
                <div className="p-3 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-zinc-800/80 rounded-2xl space-y-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.95),_inset_0_1px_1px_rgba(255,255,255,0.06)] relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                    <span className="text-[9px] font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5 tracking-wider [text-shadow:_0_1px_2px_rgba(0,0,0,0.9)]">
                      <span>⛏️</span> CARVED ORE RUNES & ARABIC CALLIGRAPHY PALETTE
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">Click rune to insert or edit custom symbol</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 items-center">
                    {/* Carved Custom Input Slot */}
                    <div className="col-span-1">
                      <label className="text-[9px] font-mono text-amber-400/90 uppercase block mb-1 font-bold">Carved Symbol</label>
                      <input
                        type="text"
                        value={formData.runeSymbol}
                        onChange={(e) => setFormData({ ...formData, runeSymbol: e.target.value })}
                        placeholder="🪨"
                        className="w-full bg-black/90 border-2 border-zinc-800 rounded-xl py-2 px-1 text-center text-xl text-amber-200 font-serif font-bold tracking-widest shadow-[inset_0_3px_8px_rgba(0,0,0,0.95),_0_1px_0_rgba(255,255,255,0.05)] focus:outline-none focus:border-amber-500/80 [text-shadow:_1px_1px_3px_rgba(0,0,0,0.95),_-1px_-1px_1px_rgba(255,255,255,0.1)] transition"
                      />
                    </div>

                    {/* Carved Runes Palette */}
                    <div className="col-span-3">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Arabic Calligraphy Runes</label>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-black/60 border border-zinc-800/90 rounded-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
                        {SUGGESTED_RUNES.map((rune, idx) => {
                          const isSelected = formData.runeSymbol === rune;
                          return (
                            <button
                              key={`${rune}-${idx}`}
                              type="button"
                              onClick={() => setFormData({ ...formData, runeSymbol: rune })}
                              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition border font-serif font-bold select-none ${
                                isSelected
                                  ? 'bg-amber-950/80 border-amber-500/90 text-amber-300 font-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_10px_rgba(245,158,11,0.35)] scale-105 [text-shadow:_1px_1px_3px_rgba(0,0,0,0.9),_0_0_8px_rgba(245,158,11,0.7)]'
                                  : 'bg-zinc-950/90 border-zinc-800/80 text-amber-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),_0_1px_0_rgba(255,255,255,0.05)] hover:bg-zinc-900 hover:text-amber-100 hover:border-amber-500/40 [text-shadow:_1px_1px_2px_rgba(0,0,0,0.9),_-1px_-1px_0.5px_rgba(255,255,255,0.1)]'
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

                {/* Description */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Lore / Ore Origin</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the raw mineral properties and the heavy chains binding it..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Rarity & Level & XP Cost */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Mineral Rarity</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value as SealRarity })}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl p-2 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Common">Common (Iron)</option>
                      <option value="Rare">Rare (Cobalt)</option>
                      <option value="Epic">Epic (Mithril)</option>
                      <option value="Legendary">Legendary (Gold)</option>
                      <option value="Divine">Divine (Dragonstone)</option>
                      <option value="Forbidden">Forbidden (Obsidian)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Required Level</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.requiredLevel}
                      onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Linked Requirements */}
                <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold">OPTIONAL LINKED REQUIREMENTS</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase block mb-0.5">Required Directive</label>
                      <select
                        value={formData.requiredQuestId}
                        onChange={(e) => setFormData({ ...formData, requiredQuestId: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg p-1.5 focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg p-1.5 focus:outline-none focus:border-cyan-500"
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
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono uppercase text-cyan-300 font-bold">UNCHAINED ORE PERK CONFIGURATION</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Perk Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.buffName}
                        onChange={(e) => setFormData({ ...formData, buffName: e.target.value })}
                        placeholder="e.g. Ironclad Focus Surge"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Boost Attribute</label>
                      <select
                        value={formData.selectedAttributeId}
                        onChange={(e) => setFormData({ ...formData, selectedAttributeId: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-amber-300 font-bold rounded-lg p-1.5 focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-bold transition shadow-lg"
                  >
                    {editingSeal ? 'SAVE CHANGES' : 'FORGE ELEMENTAL ORE'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
