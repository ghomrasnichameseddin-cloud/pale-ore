import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { PowerSeal, SealRarity } from '../types';
import { 
  Sparkles, Lock, Unlock, ShieldAlert, Award, Plus, Trash2, Edit3, 
  AlertCircle, Zap, Search, X, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    bg: 'bg-gradient-to-b from-cyan-950/40 via-zinc-950 to-zinc-950',
    text: 'text-cyan-300',
    badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    runeSymbol: '✦',
    ringGradient: 'from-cyan-500 to-blue-600'
  },
  Rare: {
    border: 'border-purple-500/50 hover:border-purple-400',
    bg: 'bg-gradient-to-b from-purple-950/40 via-zinc-950 to-zinc-950',
    text: 'text-purple-300',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.2)]',
    runeSymbol: '✧',
    ringGradient: 'from-purple-500 to-indigo-600'
  },
  Epic: {
    border: 'border-emerald-500/50 hover:border-emerald-400',
    bg: 'bg-gradient-to-b from-emerald-950/40 via-zinc-950 to-zinc-950',
    text: 'text-emerald-300',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    glow: 'shadow-[0_0_22px_rgba(16,185,129,0.2)]',
    runeSymbol: '✵',
    ringGradient: 'from-emerald-500 to-teal-600'
  },
  Legendary: {
    border: 'border-amber-500/60 hover:border-amber-400',
    bg: 'bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950',
    text: 'text-amber-300',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    glow: 'shadow-[0_0_28px_rgba(245,158,11,0.25)]',
    runeSymbol: '⚜️',
    ringGradient: 'from-amber-400 to-orange-600'
  },
  Divine: {
    border: 'border-rose-500/70 hover:border-rose-400',
    bg: 'bg-gradient-to-b from-rose-950/50 via-zinc-950 to-zinc-950',
    text: 'text-rose-300',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-500/70 font-bold shadow-[0_0_18px_rgba(244,63,94,0.35)]',
    glow: 'shadow-[0_0_32px_rgba(244,63,94,0.3)]',
    runeSymbol: '🔯',
    ringGradient: 'from-rose-500 to-red-600'
  },
  Forbidden: {
    border: 'border-violet-500/80 hover:border-violet-400',
    bg: 'bg-gradient-to-b from-violet-950/60 via-zinc-950 to-zinc-950',
    text: 'text-violet-300',
    badge: 'bg-violet-950/90 text-violet-300 border-violet-500/80 font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    glow: 'shadow-[0_0_35px_rgba(139,92,246,0.35)]',
    runeSymbol: '👁️',
    ringGradient: 'from-violet-600 to-fuchsia-700'
  }
};

/* -------------------------------------------------------------------------- */
/*             FEATURED POWER SEAL GEOMETRIC MAGIC FORMATION STAGE            */
/* -------------------------------------------------------------------------- */
interface SealCrystalOrbStageProps {
  seal: PowerSeal;
  isBroken: boolean;
  canBreak?: boolean;
}

const RARITY_MAGIC_COLORS: Record<SealRarity, {
  stroke: string;
  glow: string;
  coreGradient: string;
  sparkBg: string;
  chainBorder: string;
}> = {
  Common: {
    stroke: '#06b6d4',
    glow: 'drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]',
    coreGradient: 'from-cyan-400 via-blue-500 to-indigo-700',
    sparkBg: 'bg-cyan-300',
    chainBorder: 'border-cyan-500/50'
  },
  Rare: {
    stroke: '#a855f7',
    glow: 'drop-shadow-[0_0_14px_rgba(168,85,247,0.85)]',
    coreGradient: 'from-purple-300 via-purple-500 to-indigo-900',
    sparkBg: 'bg-purple-300',
    chainBorder: 'border-purple-500/50'
  },
  Epic: {
    stroke: '#10b981',
    glow: 'drop-shadow-[0_0_14px_rgba(16,185,129,0.85)]',
    coreGradient: 'from-emerald-300 via-teal-500 to-emerald-900',
    sparkBg: 'bg-emerald-300',
    chainBorder: 'border-emerald-500/50'
  },
  Legendary: {
    stroke: '#f59e0b',
    glow: 'drop-shadow-[0_0_16px_rgba(245,158,11,0.9)]',
    coreGradient: 'from-amber-200 via-amber-500 to-orange-800',
    sparkBg: 'bg-amber-300',
    chainBorder: 'border-amber-500/60'
  },
  Divine: {
    stroke: '#f43f5e',
    glow: 'drop-shadow-[0_0_18px_rgba(244,63,94,0.95)]',
    coreGradient: 'from-rose-200 via-pink-500 to-rose-900',
    sparkBg: 'bg-rose-300',
    chainBorder: 'border-rose-500/60'
  },
  Forbidden: {
    stroke: '#8b5cf6',
    glow: 'drop-shadow-[0_0_20px_rgba(139,92,246,1)]',
    coreGradient: 'from-violet-300 via-purple-600 to-black',
    sparkBg: 'bg-violet-300',
    chainBorder: 'border-violet-500/70'
  }
};

const SealCrystalOrbStage: React.FC<SealCrystalOrbStageProps> = ({ seal, isBroken }) => {
  const theme = RARITY_MAGIC_COLORS[seal.rarity] || RARITY_MAGIC_COLORS.Common;
  const strokeColor = isBroken ? theme.stroke : '#71717a';

  return (
    <div className="relative w-full h-56 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center my-3 group/orb select-none shadow-2xl">
      
      {/* BACKGROUND RADIAL SACRED AMBIENCE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/60 via-black to-zinc-950 pointer-events-none" />

      {/* FLOATING UNSEALED ENERGY PARTICLES */}
      {isBroken && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className={`absolute bottom-4 left-1/4 w-2 h-2 rounded-full ${theme.sparkBg} animate-ping opacity-90`} />
          <div className="absolute bottom-8 right-1/3 w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse opacity-80" />
          <div className="absolute top-6 left-1/3 w-2 h-2 rounded-full bg-cyan-300 animate-ping opacity-75" />
          <div className={`absolute top-4 right-1/4 w-1.5 h-1.5 rounded-full ${theme.sparkBg} animate-bounce opacity-80`} />
          <div className="absolute top-1/2 left-6 w-1 h-1 rounded-full bg-white animate-ping opacity-60" />
          <div className="absolute bottom-1/3 right-8 w-1 h-1 rounded-full bg-purple-300 animate-ping opacity-70" />
        </div>
      )}

      {/* SVG GEOMETRICALLY COMPLICATED MAGIC FORMATION (TRANSMUTATION ARRAY) */}
      <div className={`relative w-48 h-48 flex items-center justify-center transition-all duration-700 ${isBroken ? theme.glow : ''}`}>
        
        {/* LAYER 1: OUTER RUNIC & CELESTIAL GLYPH RING (STATIONARY SACRED ARRAY) */}
        <svg className="absolute inset-0 w-full h-full transition-opacity duration-700" viewBox="0 0 240 240" fill="none">
          {/* Outer Tick Circle */}
          <circle cx="120" cy="120" r="116" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
          {/* Outer Border Circles */}
          <circle cx="120" cy="120" r="110" stroke={strokeColor} strokeWidth="1.5" opacity="0.8" />
          <circle cx="120" cy="120" r="102" stroke={strokeColor} strokeWidth="1" strokeDasharray="8 4" opacity="0.7" />
          <circle cx="120" cy="120" r="96" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />

          {/* Radial Tick Lines at 12 Cardinal Points */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <line
              key={deg}
              x1={120 + 102 * Math.cos((deg * Math.PI) / 180)}
              y1={120 + 102 * Math.sin((deg * Math.PI) / 180)}
              x2={120 + 110 * Math.cos((deg * Math.PI) / 180)}
              y2={120 + 110 * Math.sin((deg * Math.PI) / 180)}
              stroke={strokeColor}
              strokeWidth="1.5"
              opacity="0.85"
            />
          ))}

          {/* Arcane Rune Symbols in Outer Perimeter */}
          {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'].map((symbol, idx) => {
            const angle = (idx * 30 * Math.PI) / 180;
            const x = 120 + 99 * Math.cos(angle);
            const y = 120 + 99 * Math.sin(angle) + 3;
            return (
              <text
                key={idx}
                x={x}
                y={y}
                textAnchor="middle"
                fill={strokeColor}
                fontSize="8"
                fontWeight="bold"
                opacity="0.85"
              >
                {symbol}
              </text>
            );
          })}
        </svg>

        {/* LAYER 2: DOUBLE INTERLACED HEXAGRAM & SACRED GEOMETRY STAR MATRIX (STATIONARY) */}
        <svg className="absolute inset-0 w-full h-full transition-opacity duration-700" viewBox="0 0 240 240" fill="none">
          {/* Concentric Geometric Circle */}
          <circle cx="120" cy="120" r="92" stroke={strokeColor} strokeWidth="1" strokeDasharray="12 4" opacity="0.6" />
          <circle cx="120" cy="120" r="82" stroke={strokeColor} strokeWidth="1.5" opacity="0.75" />

          {/* Hexagram 1 (6-pointed Star) */}
          <polygon points="120,28 199,165 41,165" stroke={strokeColor} strokeWidth="1.2" fill="none" opacity="0.8" />
          <polygon points="120,212 41,75 199,75" stroke={strokeColor} strokeWidth="1.2" fill="none" opacity="0.8" />

          {/* Hexagram 2 (Rotated 30 degrees for 12-Pointed Magic Array) */}
          <polygon points="166,41 166,199 28,120" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="6 3" fill="none" opacity="0.6" />
          <polygon points="74,41 212,120 74,199" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="6 3" fill="none" opacity="0.6" />

          {/* Bisecting Chords across Center */}
          <line x1="120" y1="28" x2="120" y2="212" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
          <line x1="41" y1="75" x2="199" y2="165" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
          <line x1="41" y1="165" x2="199" y2="75" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />

          {/* Inner Octagram / Rotated Squares */}
          <rect x="71" y="71" width="98" height="98" stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.5" />
          <rect x="71" y="71" width="98" height="98" stroke={strokeColor} strokeWidth="1" fill="none" transform="rotate(45 120 120)" opacity="0.5" />
        </svg>

        {/* LAYER 3: INNER SACRED NODES & HEXAGONAL CORE MATRIX (STATIONARY) */}
        <svg className="absolute inset-0 w-full h-full transition-opacity duration-700" viewBox="0 0 240 240" fill="none">
          {/* Inner Runic Circles */}
          <circle cx="120" cy="120" r="58" stroke={strokeColor} strokeWidth="1.5" opacity="0.8" />
          <circle cx="120" cy="120" r="48" stroke={strokeColor} strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />
          <circle cx="120" cy="120" r="38" stroke={strokeColor} strokeWidth="1.2" opacity="0.8" />

          {/* Inner Hexagon with Geometric Node Dots */}
          <polygon points="120,62 170,91 170,149 120,178 70,149 70,91" stroke={strokeColor} strokeWidth="1.2" fill="none" opacity="0.85" />
          
          {/* Geometric Vertex Circles (Node Points) */}
          {[[120, 62], [170, 91], [170, 149], [120, 178], [70, 149], [70, 91]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.5" fill={strokeColor} opacity="0.9" />
          ))}

          {/* Inner Star Array Lines */}
          <line x1="120" y1="62" x2="120" y2="178" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
          <line x1="170" y1="91" x2="70" y2="149" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
          <line x1="170" y1="149" x2="70" y2="91" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
        </svg>

        {/* CENTER SACRED GEM / RUNIC HEART */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          
          {/* GLOWING ORB / CRYSTAL SPHERE */}
          <div className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-700 ${
            isBroken
              ? `bg-gradient-to-tr ${theme.coreGradient} shadow-[0_0_35px_rgba(255,255,255,0.8)] scale-110 animate-pulse`
              : 'bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 border border-zinc-700/80 shadow-inner'
          }`}>
            
            {/* SPHERE FACET LIGHT OVERLAY */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.5),_transparent_60%)] pointer-events-none" />
            
            {/* FACETED DIAMOND CORE POLYGON */}
            <div className={`relative h-11 w-11 rotate-45 border-2 transition-transform duration-500 ${
              isBroken 
                ? 'border-white/90 bg-white/30 shadow-[0_0_20px_rgba(255,255,255,0.9)]' 
                : 'border-zinc-600/80 bg-zinc-900/90'
            } flex items-center justify-center backdrop-blur-sm`}>
              
              {/* INNER RUNIC EMBLEM */}
              <span className={`-rotate-45 text-xl font-bold select-none ${
                isBroken ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]' : 'text-zinc-500 opacity-60'
              }`}>
                {seal.runeSymbol || '🔮'}
              </span>
            </div>

            {/* RADIANT UNSEALED AURA RING */}
            {isBroken && (
              <div className="absolute -inset-2.5 rounded-full border-2 border-dashed border-white/80 opacity-90 animate-pulse" />
            )}

          </div>
        </div>

      </div>

      {/* OVERLAY HEAVY BINDING CHAINS & SEAL SIGIL (LOCKED STATE) */}
      {!isBroken && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          
          {/* SVG HEAVY METALLIC BINDING CHAINS */}
          <svg className="absolute inset-0 w-full h-full text-zinc-500" viewBox="0 0 200 120" fill="none">
            {/* Left-top to Right-bottom chain line */}
            <path d="M 10 10 L 190 110" stroke="#3f3f46" strokeWidth="6" strokeDasharray="8 4" className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]" />
            <path d="M 10 10 L 190 110" stroke="#a1a1aa" strokeWidth="2.5" strokeDasharray="8 4" />
            
            {/* Right-top to Left-bottom chain line */}
            <path d="M 190 10 L 10 110" stroke="#3f3f46" strokeWidth="6" strokeDasharray="8 4" className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]" />
            <path d="M 190 10 L 10 110" stroke="#a1a1aa" strokeWidth="2.5" strokeDasharray="8 4" />
          </svg>

          {/* CENTRAL RUNIC PADLOCK SEAL BADGE */}
          <div className="relative z-30 p-2.5 bg-zinc-950/95 border-2 border-amber-500/80 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-1.5 backdrop-blur-md">
            <Lock className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-[9.5px] font-mono font-bold text-amber-300 tracking-wider uppercase">
              SEAL BOUND
            </span>
          </div>

        </div>
      )}

      {/* SHATTERED CHAINS FLOATING OUTWARD (UNSEALED STATE) */}
      {isBroken && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="absolute top-3 left-3 text-zinc-500/60 rotate-45 flex items-center gap-1">
            <div className="w-4 h-2 border-2 border-purple-400/60 rounded-full" />
            <div className="w-3 h-2 border-2 border-purple-400/40 rounded-full translate-y-2" />
            <span className="text-amber-400 text-xs animate-ping">⚡</span>
          </div>

          <div className="absolute top-3 right-3 text-zinc-500/60 -rotate-45 flex items-center gap-1">
            <span className="text-amber-400 text-xs animate-ping">⚡</span>
            <div className="w-4 h-2 border-2 border-purple-400/60 rounded-full" />
            <div className="w-3 h-2 border-2 border-purple-400/40 rounded-full translate-y-2" />
          </div>

          <div className="absolute bottom-2 left-6 text-zinc-500/50 rotate-12 flex items-center gap-1">
            <div className="w-4 h-2 border-2 border-zinc-600 rounded-full" />
            <span className="text-purple-400 text-[10px]">✧</span>
          </div>

          <div className="absolute bottom-2 right-6 text-zinc-500/50 -rotate-12 flex items-center gap-1">
            <span className="text-purple-400 text-[10px]">✧</span>
            <div className="w-4 h-2 border-2 border-zinc-600 rounded-full" />
          </div>
        </div>
      )}

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
    runeSymbol: '🔮',
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
      runeSymbol: '🔮',
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
      runeSymbol: seal.runeSymbol || '🔮',
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
        runeSymbol: formData.runeSymbol || '🔮'
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
        runeSymbol: formData.runeSymbol || '🔮'
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
      
      {/* SACRED SEALING ALTAR BANNER & ROTATING RUNIC SIGIL */}
      <div className="p-6 bg-gradient-to-r from-purple-950/80 via-zinc-950 to-indigo-950/90 border border-purple-500/40 rounded-2xl relative overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.2)]">
        
        {/* STATIONARY SVG ARCANE RUNIC RING IN BACKGROUND */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 opacity-20 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full text-purple-400" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1" strokeDasharray="6 3" />
            <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="0.8" />
            <polygon points="100,10 178,145 22,145" stroke="currentColor" strokeWidth="1" />
            <polygon points="100,190 22,55 178,55" stroke="currentColor" strokeWidth="1" />
            <polygon points="145,22 145,178 10,100" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 2" />
            <polygon points="55,22 190,100 55,178" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 2" />
            <rect x="58" y="58" width="84" height="84" stroke="currentColor" strokeWidth="0.8" transform="rotate(45 100 100)" />
            <circle cx="100" cy="100" r="42" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2" />
            <text x="100" y="18" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="serif">ᚠ</text>
            <text x="182" y="103" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="serif">ᚢ</text>
            <text x="100" y="188" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="serif">ᚦ</text>
            <text x="18" y="103" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="serif">ᚨ</text>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 bg-purple-950/90 border border-purple-500/60 rounded-xl text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Wand2 className="h-6 w-6 text-purple-400 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-amber-400/90 uppercase font-bold flex items-center gap-1">
                    <span>✦</span> SACRED RUNIC ALTAR <span>✦</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-950/90 text-purple-300 border border-purple-500/50 font-bold uppercase">
                    CRYSTAL & CHAIN MATRIX v3.5
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  POWER SEALS & CHAIN-BOUND ORBS
                </h2>
              </div>
            </div>
            <p className="text-xs text-purple-200/70 max-w-2xl font-sans leading-relaxed">
              Shatter heavy iron chains binding ancient power crystals and radiant energy orbs. Unsealing a bound orb bursts its chains, unleashing permanent passive multipliers, attribute surges, and operator perks into your system.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleBatterySaverMode}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition flex items-center gap-2 border ${
                isBatterySaver
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900/90 text-zinc-400 border-white/10 hover:text-emerald-300'
              }`}
              title="Toggle PC Battery Saver to pause heavy 3D crystal rotations and eliminate GPU heat"
            >
              <Zap className={`h-4 w-4 ${isBatterySaver ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
              <span>{isBatterySaver ? '⚡ ECO DEFENSE ON' : 'ECO SAVER'}</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold tracking-wider transition shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 border border-purple-400/50"
            >
              <Plus className="h-4 w-4" />
              <span>FORM NEW POWER SEAL</span>
            </button>
          </div>
        </div>

        {/* ACTIVE BUFF MATRIX HUD */}
        <div className="mt-6 pt-5 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="bg-zinc-950/90 border border-purple-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">CHAINS SHATTERED</span>
              <span className="text-lg font-mono font-bold text-purple-300 flex items-baseline gap-1 mt-0.5">
                {brokenSeals.length} <span className="text-xs text-zinc-500 font-normal">/ {seals.length} UNSEALED</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Unlock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-zinc-950/90 border border-cyan-500/40 p-3.5 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">PASSIVE XP MULTIPLIER</span>
              <span className="text-lg font-mono font-bold text-cyan-300 flex items-baseline gap-1 mt-0.5">
                +{xpBoostDisplayPercent}% <span className="text-xs text-cyan-500/80 font-normal">XP BOOST</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
          </div>

          <div className="bg-zinc-950/90 border border-amber-500/40 p-3.5 rounded-xl flex items-center justify-between col-span-1 sm:col-span-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">AWAKENED ATTRIBUTE SURGES</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {Object.keys(totalAttributeBoosts).length === 0 ? (
                  <span className="text-xs font-mono text-zinc-500">No active attribute surges. Shatter chains to awaken crystal power.</span>
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
        <div className="mt-4 p-3.5 bg-zinc-950/90 border border-purple-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">RESONANCE SYNERGY SETS:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 2 
                ? 'bg-purple-900/80 text-purple-200 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-900/80 text-zinc-500 border-white/5 opacity-60'
            }`}>
              {brokenSeals.length >= 2 ? '✦' : '✧'} DUAL ALIGNMENT (2+ Seals: Active)
            </span>
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 3 
                ? 'bg-cyan-900/80 text-cyan-200 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/80 text-zinc-500 border-white/5 opacity-60'
            }`}>
              {brokenSeals.length >= 3 ? '✦' : '✧'} TRINITY MASTERY (3+ Seals: Active)
            </span>
            <span className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-bold flex items-center gap-1 ${
              brokenSeals.length >= 5 
                ? 'bg-amber-900/80 text-amber-200 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-900/80 text-zinc-500 border-white/5 opacity-60'
            }`}>
              {brokenSeals.length >= 5 ? '✦' : '✧'} COSMIC OVERLORD (5+ Seals: Active)
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
                : 'bg-purple-950/90 border-purple-500/60 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {unsealMessage.isError ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              ) : (
                <Sparkles className="h-5 w-5 shrink-0 text-amber-400 animate-pulse" />
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
      <div className="p-4 bg-zinc-950/80 border border-purple-500/20 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-purple-400/60" />
          <input
            type="text"
            placeholder="Search power crystals, bound orbs, or buff perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60"
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
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {st === 'All' ? 'ALL ORBS' : st === 'Locked' ? '⛓️ CHAIN-BOUND' : '🔮 UNSEALED'}
              </button>
            ))}
          </div>

          {/* Rarity filter */}
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-zinc-900/90 border border-white/10 text-zinc-300 rounded-xl px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-purple-500/60 cursor-pointer"
          >
            <option value="All">ALL RARITIES</option>
            <option value="Common">COMMON</option>
            <option value="Rare">RARE</option>
            <option value="Epic">EPIC</option>
            <option value="Legendary">LEGENDARY</option>
            <option value="Divine">DIVINE</option>
            <option value="Forbidden">FORBIDDEN</option>
          </select>

        </div>

      </div>

      {/* SEALS GRID */}
      {filteredSeals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-purple-500/30 bg-zinc-950/60 rounded-2xl space-y-3">
          <ShieldAlert className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
          <p className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
            NO POWER ORBS FOUND MATCHING CRITERIA
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            Form a new custom seal or reset active search filters.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 rounded-xl text-xs font-mono font-bold transition inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>FORM CUSTOM POWER SEAL</span>
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
                    ? 'bg-gradient-to-b from-purple-950/60 via-zinc-950 to-zinc-950 border-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                    : `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                }`}
              >
                {/* RUNIC WATERMARK & CORNER BRACKETS */}
                <div className="absolute top-2 left-3 text-[9px] font-mono text-white/10 font-bold select-none pointer-events-none">
                  [ ✧ {rarityStyle.runeSymbol} ✧ ]
                </div>
                <div className="absolute top-2 right-3 text-[9px] font-mono text-white/10 font-bold select-none pointer-events-none">
                  #SEAL-{seal.id.slice(-4).toUpperCase()}
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
                        ? 'bg-purple-950/90 text-purple-300 border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'bg-zinc-950 text-zinc-400 border-white/10'
                    }`}>
                      {isBroken ? <Unlock className="h-3 w-3 text-purple-400" /> : <Lock className="h-3 w-3 text-amber-500/80" />}
                      <span>{isBroken ? 'UNSEALED' : 'CHAIN-BOUND'}</span>
                    </span>
                  </div>

                  {/* FEATURED CRYSTAL ORB WITH CHAINS STAGE */}
                  <SealCrystalOrbStage seal={seal} isBroken={isBroken} canBreak={canBreak} />

                  <p className="text-xs text-zinc-300/80 font-sans leading-relaxed line-clamp-2">
                    {seal.description}
                  </p>

                  {/* UNLOCKED BUFF PERK DISPLAY */}
                  <div className={`p-3 rounded-xl border ${
                    isBroken 
                      ? 'bg-purple-950/80 border-purple-500/50 text-purple-100 shadow-inner' 
                      : 'bg-zinc-950/80 border-white/10 text-zinc-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-mono uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        PERMANENT BUFF PERK
                      </span>
                      {seal.xpBonusMultiplier && seal.xpBonusMultiplier > 1.0 && (
                        <span className="text-[9.5px] font-mono font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2 py-0.5 rounded-md">
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
                    <div className="text-[9.5px] font-mono text-purple-300/80 flex items-center justify-between pt-1 border-t border-purple-500/20">
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
                      title="Edit Power Seal"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSeal(seal.id)}
                      className="p-1.5 bg-zinc-900 hover:bg-rose-950 border border-white/10 text-zinc-400 hover:text-rose-300 rounded-lg transition"
                      title="Delete Power Seal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {isBroken && (
                      <button
                        onClick={() => relockSeal(seal.id)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[9.5px] font-mono text-zinc-400 hover:text-zinc-200 rounded-lg transition"
                        title="Relock Seal"
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
                          ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse'
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
                          setUnsealMessage({ text: `✨ Arcane Resonance Pulse Channeled from "${seal.name}"! +25 System XP Granted!`, isError: false });
                        }}
                        className="px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-[10px] font-mono font-bold text-purple-200 rounded-lg transition shadow-sm flex items-center gap-1"
                        title="Channel localized energy surge from this unsealed orb"
                      >
                        <Zap className="h-3 w-3 text-amber-400 animate-pulse" />
                        <span>CHANNEL PULSE</span>
                      </button>
                      <span className="text-[10.5px] font-mono text-purple-300 font-bold flex items-center gap-1 bg-purple-950/80 border border-purple-500/40 px-2.5 py-1.5 rounded-lg shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        AWAKENED
                      </span>
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* SHATTER SEAL CONFIRMATION RITUAL MODAL */}
      <AnimatePresence>
        {selectedSealForBreak && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full bg-zinc-950 border border-purple-500/60 rounded-2xl p-6 space-y-5 shadow-[0_0_40px_rgba(168,85,247,0.3)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Wand2 className="h-36 w-36 text-purple-400 animate-pulse" />
              </div>

              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-purple-950/80 border border-purple-500/50 rounded-xl">{selectedSealForBreak.runeSymbol || '🔮'}</span>
                  <div>
                    <span className="text-[9.5px] font-mono text-purple-400 uppercase font-bold tracking-wider">
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

              {/* MODAL CRYSTAL PREVIEW */}
              <SealCrystalOrbStage seal={selectedSealForBreak} isBroken={false} />

              <p className="text-xs font-sans text-zinc-300 leading-relaxed bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-xl">
                "{selectedSealForBreak.description}"
              </p>

              {/* BUFF TO BE UNLOCKED */}
              <div className="p-3.5 bg-zinc-900 border border-cyan-500/40 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
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
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold tracking-wider transition shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center gap-2 border border-purple-400/60"
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
              className="max-w-xl w-full bg-zinc-950 border border-purple-500/50 rounded-2xl p-6 space-y-4 shadow-[0_0_35px_rgba(168,85,247,0.2)] text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h3 className="font-display text-base font-bold text-white tracking-wide">
                    {editingSeal ? 'MODIFY POWER SEAL' : 'FORM NEW POWER SEAL'}
                  </h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSeal} className="space-y-3 text-xs font-mono">
                
                {/* Name & Rune */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Rune Symbol</label>
                    <input
                      type="text"
                      value={formData.runeSymbol}
                      onChange={(e) => setFormData({ ...formData, runeSymbol: e.target.value })}
                      placeholder="🔮"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-center text-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Seal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Seal of Spectral Acceleration"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Lore / Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the mental or system limitation this seal enforces..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Rarity & Level & XP Cost */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Rarity Tier</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value as SealRarity })}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl p-2 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Divine">Divine</option>
                      <option value="Forbidden">Forbidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Required Level</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.requiredLevel}
                      onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Cost XP Sacrifice</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={formData.costXP}
                      onChange={(e) => setFormData({ ...formData, costXP: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-purple-500"
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
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg p-1.5 focus:outline-none focus:border-purple-500"
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
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg p-1.5 focus:outline-none focus:border-purple-500"
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
                <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono uppercase text-purple-300 font-bold">GRANTED BUFF PERK CONFIGURATION</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Buff Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.buffName}
                        onChange={(e) => setFormData({ ...formData, buffName: e.target.value })}
                        placeholder="e.g. Hyper-Focus Surge"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
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
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-cyan-300 font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Buff Description</label>
                    <input
                      type="text"
                      value={formData.buffDescription}
                      onChange={(e) => setFormData({ ...formData, buffDescription: e.target.value })}
                      placeholder="e.g. +20% XP boost on all main directives and +2 Focus level."
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase block mb-0.5">Boost Attribute</label>
                      <select
                        value={formData.selectedAttributeId}
                        onChange={(e) => setFormData({ ...formData, selectedAttributeId: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-amber-300 font-bold rounded-lg p-1.5 focus:outline-none focus:border-purple-500"
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
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 text-amber-300 font-bold focus:outline-none focus:border-purple-500"
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
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition shadow-lg"
                  >
                    {editingSeal ? 'SAVE CHANGES' : 'CREATE POWER SEAL'}
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
