import React from 'react';
import { MuhasabahCategory } from '../types';
import { Shield, EyeOff, MessageSquare, Heart, HeartHandshake, Clock } from 'lucide-react';

export interface SlipRuneData {
  category: MuhasabahCategory;
  name: string;
  arabicTitle: string;
  runeChar: string;
  colorHex: string;
  secondaryHex: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  themeColor: 'amber' | 'rose' | 'cyan' | 'purple' | 'emerald' | 'indigo';
  attributeId: string;
  attributeName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SLIP_RUNES: Record<MuhasabahCategory, SlipRuneData> = {
  Obligations: {
    category: 'Obligations',
    name: 'Rune of the Divine Pillar',
    arabicTitle: 'رَمْزُ العَهْدِ وَالفَرَائِض',
    runeChar: 'ف',
    colorHex: '#c5a059',
    secondaryHex: '#fef08a',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-950/40',
    glowColor: 'rgba(197, 160, 89, 0.4)',
    themeColor: 'amber',
    attributeId: 'a-9',
    attributeName: 'Faith',
    description: 'Bound to the sacred pillars, daily prayers, and fundamental covenants.',
    icon: Shield
  },
  Desires: {
    category: 'Desires',
    name: 'Rune of the Veiled Fire',
    arabicTitle: 'رَمْزُ النَّفْسِ وَالهَوَى',
    runeChar: 'ش',
    colorHex: '#f43f5e',
    secondaryHex: '#fca5a5',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/50',
    bgColor: 'bg-rose-950/40',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    themeColor: 'rose',
    attributeId: 'a-5',
    attributeName: 'Discipline',
    description: 'Bound to impulses of the lower nafs, dopamine hooks, and unguarded gaze.',
    icon: EyeOff
  },
  Speech: {
    category: 'Speech',
    name: 'Rune of the Pierced Seal',
    arabicTitle: 'رَمْزُ صَمْتِ اللِّسَان',
    runeChar: 'ل',
    colorHex: '#06b6d4',
    secondaryHex: '#a5f3fc',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-950/40',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    themeColor: 'cyan',
    attributeId: 'a-8',
    attributeName: 'Social',
    description: 'Bound to backbiting, idle chatter, sharp words, and unbridled speech.',
    icon: MessageSquare
  },
  Heart: {
    category: 'Heart',
    name: 'Rune of the Inner Sanctum',
    arabicTitle: 'رَمْزُ طَهَارَةِ القَلْب',
    runeChar: 'ق',
    colorHex: '#a855f7',
    secondaryHex: '#e9d5ff',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-950/40',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    themeColor: 'purple',
    attributeId: 'a-7',
    attributeName: 'Wisdom',
    description: 'Bound to hidden pride, envy, malice, ostentation, and spiritual vanity.',
    icon: Heart
  },
  Rights: {
    category: 'Rights',
    name: 'Rune of Eternal Justice',
    arabicTitle: 'رَمْزُ العَدْلِ وَالحُقُوق',
    runeChar: 'ح',
    colorHex: '#10b981',
    secondaryHex: '#a7f3d0',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-950/40',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    themeColor: 'emerald',
    attributeId: 'a-1',
    attributeName: 'Strength',
    description: 'Bound to the rights of others, broken promises, unpaid debts, and injustices.',
    icon: HeartHandshake
  },
  'Wasted Potential': {
    category: 'Wasted Potential',
    name: 'Rune of the Fleeting Breath',
    arabicTitle: 'رَمْزُ أَنْفَاسِ العُمُر',
    runeChar: 'ض',
    colorHex: '#6366f1',
    secondaryHex: '#c7d2fe',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/50',
    bgColor: 'bg-indigo-950/40',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    themeColor: 'indigo',
    attributeId: 'a-4',
    attributeName: 'Focus',
    description: 'Bound to procrastination, mindless scrolling, and squandered moments of youth.',
    icon: Clock
  }
};

interface SlipRuneProps {
  category: MuhasabahCategory;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRuneGlow?: boolean;
  showCharOnly?: boolean;
}

export const SlipRune: React.FC<SlipRuneProps> = ({
  category,
  size = 'md',
  className = '',
  showRuneGlow = true,
  showCharOnly = false
}) => {
  const rune = SLIP_RUNES[category] || SLIP_RUNES.Obligations;

  const sizeDimensions = {
    xs: { px: 18, viewBox: '0 0 100 100', textClass: 'text-[11px]' },
    sm: { px: 24, viewBox: '0 0 100 100', textClass: 'text-[13px]' },
    md: { px: 36, viewBox: '0 0 100 100', textClass: 'text-lg' },
    lg: { px: 48, viewBox: '0 0 100 100', textClass: 'text-2xl' },
    xl: { px: 64, viewBox: '0 0 100 100', textClass: 'text-3xl' }
  }[size];

  const dim = sizeDimensions.px;

  if (showCharOnly) {
    return (
      <span
        className={`font-serif font-black ${rune.textColor} ${className}`}
        style={{ textShadow: showRuneGlow ? `0 0 8px ${rune.glowColor}` : undefined }}
      >
        {rune.runeChar}
      </span>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dim, height: dim }}
      title={`${rune.name} (${rune.arabicTitle}) - ${category}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`rune-grad-${category}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor={rune.colorHex} />
            <stop offset="100%" stopColor="#07080c" />
          </linearGradient>
          <filter id={`rune-glow-${category}-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. OUTER PROTECTIVE BACKGROUND CIRCLE */}
        <circle cx="50" cy="50" r="46" fill="#07080c" stroke={rune.colorHex} strokeWidth="1.5" strokeOpacity="0.4" />

        {/* 2. SPECIFIC SACRED GEOMETRY BY CATEGORY */}
        {category === 'Obligations' && (
          /* Pillar / Octagram of Al-Farā'iḍ */
          <g>
            {/* Rub El Hizb Dual Squares */}
            <rect x="22" y="22" width="56" height="56" rx="3" stroke={rune.colorHex} strokeWidth="1.4" fill="none" opacity="0.6" />
            <rect x="22" y="22" width="56" height="56" rx="3" transform="rotate(45 50 50)" stroke={rune.colorHex} strokeWidth="1.4" fill="none" opacity="0.6" />
            {/* Fortress Pillars Left & Right */}
            <line x1="28" y1="35" x2="28" y2="65" stroke={rune.secondaryHex} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <line x1="72" y1="35" x2="72" y2="65" stroke={rune.secondaryHex} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            {/* Crown Apex */}
            <polygon points="50,14 55,24 45,24" fill={rune.secondaryHex} opacity="0.9" />
          </g>
        )}

        {category === 'Desires' && (
          /* Veiled Flame / Thorn Crescents of Al-Hawā */
          <g>
            {/* Interlocking Crescent Horns */}
            <circle cx="50" cy="50" r="40" stroke={rune.colorHex} strokeWidth="1.2" strokeDasharray="18 6" opacity="0.6" />
            {/* Pierced Eye Arc */}
            <path d="M 22,50 Q 50,26 78,50 Q 50,74 22,50 Z" stroke={rune.colorHex} strokeWidth="1.2" fill="#1b050d" fillOpacity="0.7" />
            {/* Flame Prongs Top & Bottom */}
            <path d="M 50,18 Q 54,28 50,34 Q 46,28 50,18 Z" fill={rune.secondaryHex} opacity="0.9" />
            <path d="M 50,82 Q 53,74 50,68 Q 47,74 50,82 Z" fill={rune.secondaryHex} opacity="0.9" />
          </g>
        )}

        {category === 'Speech' && (
          /* Acoustic Resonance & Sound Seal Diamond of Āfāt al-Lisān */
          <g>
            {/* Concentric Resonating Rhombus */}
            <polygon points="50,12 88,50 50,88 12,50" stroke={rune.colorHex} strokeWidth="1.4" fill="#04121a" fillOpacity="0.8" />
            <polygon points="50,22 78,50 50,78 22,50" stroke={rune.secondaryHex} strokeWidth="1" strokeDasharray="6 3" fill="none" opacity="0.5" />
            {/* Silent Breath Nodes */}
            <circle cx="16" cy="50" r="2.5" fill={rune.secondaryHex} />
            <circle cx="84" cy="50" r="2.5" fill={rune.secondaryHex} />
            <line x1="30" y1="50" x2="70" y2="50" stroke={rune.colorHex} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          </g>
        )}

        {category === 'Heart' && (
          /* Sacred Heart Core & Inner Crystal Sanctum of Amrāḍ al-Qulūb */
          <g>
            {/* Mystical Layered Heart Silhouette */}
            <path
              d="M 50,28 C 42,16 22,20 22,38 C 22,56 50,78 50,78 C 50,78 78,56 78,38 C 78,20 58,16 50,28 Z"
              stroke={rune.colorHex}
              strokeWidth="1.5"
              fill="#180724"
              fillOpacity="0.85"
            />
            {/* Inner Sacred Octagram Star Inlay */}
            <circle cx="50" cy="46" r="14" stroke={rune.secondaryHex} strokeWidth="1" strokeDasharray="4 2" fill="none" opacity="0.7" />
            {/* Core Heart Radiance Droplets */}
            <circle cx="50" cy="20" r="2" fill={rune.secondaryHex} />
            <circle cx="50" cy="85" r="2.5" fill={rune.secondaryHex} />
          </g>
        )}

        {category === 'Rights' && (
          /* Scales of Justice & Covenant Circles of Ḥuqūq al-'Ibād */
          <g>
            {/* Justice Scale Fulcrum & Beam */}
            <line x1="22" y1="36" x2="78" y2="36" stroke={rune.colorHex} strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="20" x2="50" y2="80" stroke={rune.colorHex} strokeWidth="1.5" strokeLinecap="round" />
            {/* Scale Pans Left & Right */}
            <path d="M 22,36 L 16,56 Q 22,62 28,56 Z" fill="#042017" stroke={rune.secondaryHex} strokeWidth="1.2" />
            <path d="M 78,36 L 72,56 Q 78,62 84,56 Z" fill="#042017" stroke={rune.secondaryHex} strokeWidth="1.2" />
            {/* Upper Balance Ring */}
            <circle cx="50" cy="20" r="4" stroke={rune.secondaryHex} strokeWidth="1.5" fill="none" />
          </g>
        )}

        {category === 'Wasted Potential' && (
          /* Celestial Astrolabe / Sundial Hourglass of Iḍā'at al-Waqt */
          <g>
            {/* Astrolabe Circular Ring with Hour Ticks */}
            <circle cx="50" cy="50" r="38" stroke={rune.colorHex} strokeWidth="1.2" fill="#090a1f" fillOpacity="0.85" />
            <circle cx="50" cy="50" r="32" stroke={rune.secondaryHex} strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6" />
            {/* Hourglass Intersecting Cones */}
            <polygon points="34,26 66,26 50,50" stroke={rune.colorHex} strokeWidth="1.2" fill="none" opacity="0.7" />
            <polygon points="50,50 66,74 34,74" stroke={rune.colorHex} strokeWidth="1.2" fill="none" opacity="0.7" />
            {/* Cardinal Solar Ticks */}
            <line x1="50" y1="12" x2="50" y2="18" stroke={rune.secondaryHex} strokeWidth="1.8" />
            <line x1="50" y1="82" x2="50" y2="88" stroke={rune.secondaryHex} strokeWidth="1.8" />
            <line x1="12" y1="50" x2="18" y2="50" stroke={rune.secondaryHex} strokeWidth="1.8" />
            <line x1="82" y1="50" x2="88" y2="50" stroke={rune.secondaryHex} strokeWidth="1.8" />
          </g>
        )}

        {/* 3. CENTRAL TALISMANIC ARABIC CALLIGRAPHIC GLYPH */}
        <text
          x="50"
          y="57"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-serif font-black select-none"
          fontSize="34"
          fill={rune.secondaryHex}
          stroke="#07080c"
          strokeWidth="0.8"
          style={{
            filter: showRuneGlow ? `drop-shadow(0 0 6px ${rune.glowColor})` : undefined
          }}
        >
          {rune.runeChar}
        </text>

        {/* 4. CORNER ORBITAL SPARKLES */}
        <circle cx="50" cy="8" r="1.5" fill={rune.secondaryHex} opacity="0.9" />
        <circle cx="92" cy="50" r="1.5" fill={rune.secondaryHex} opacity="0.9" />
        <circle cx="50" cy="92" r="1.5" fill={rune.secondaryHex} opacity="0.9" />
        <circle cx="8" cy="50" r="1.5" fill={rune.secondaryHex} opacity="0.9" />
      </svg>
    </div>
  );
};
