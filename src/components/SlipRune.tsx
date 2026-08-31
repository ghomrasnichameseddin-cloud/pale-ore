import React from 'react';
import { MuhasabahCategory } from '../types';
import { Shield, EyeOff, MessageSquare, Heart, HeartHandshake, Clock } from 'lucide-react';
import {
  AncientCarvedRune,
  AncientCarvedRuneProps,
  RuneShape,
  StoneVariant,
  GlowIntensity,
  RuneSize,
  RuneVisualState
} from './AncientCarvedRune';

export {
  AncientCarvedRune,
  type AncientCarvedRuneProps,
  type RuneShape,
  type StoneVariant,
  type GlowIntensity,
  type RuneSize,
  type RuneVisualState
};

export interface SlipRuneData {
  category: MuhasabahCategory;
  name: string;
  arabicTitle: string;
  runeChar: string;
  colorHex: string;
  secondaryHex: string;
  colorName: string;
  statBonus: string;
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
    name: 'Divine Pillar',
    arabicTitle: 'رَمْزُ العَهْدِ وَالفَرَائِض',
    runeChar: 'ف',
    colorHex: '#d4af37',
    secondaryHex: '#fef08a',
    colorName: 'Gold',
    statBonus: 'Faith +2',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-950/40',
    glowColor: 'rgba(212, 175, 55, 0.45)',
    themeColor: 'amber',
    attributeId: 'a-9',
    attributeName: 'Faith',
    description: 'Bound to the sacred pillars, daily prayers, and fundamental covenants.',
    icon: Shield
  },
  Desires: {
    category: 'Desires',
    name: 'Veiled Fire',
    arabicTitle: 'رَمْزُ النَّفْسِ وَالهَوَى',
    runeChar: 'ش',
    colorHex: '#e11d48',
    secondaryHex: '#fca5a5',
    colorName: 'Crimson',
    statBonus: 'Discipline +2',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/50',
    bgColor: 'bg-rose-950/40',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    themeColor: 'rose',
    attributeId: 'a-5',
    attributeName: 'Discipline',
    description: 'Bound to impulses of the lower nafs, dopamine hooks, and unguarded gaze.',
    icon: EyeOff
  },
  Speech: {
    category: 'Speech',
    name: 'Pierced Seal',
    arabicTitle: 'رَمْزُ صَمْتِ اللِّسَان',
    runeChar: 'ل',
    colorHex: '#06b6d4',
    secondaryHex: '#a5f3fc',
    colorName: 'Cyan',
    statBonus: 'Social +2',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-950/40',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    themeColor: 'cyan',
    attributeId: 'a-8',
    attributeName: 'Social',
    description: 'Bound to backbiting, idle chatter, sharp words, and unbridled speech.',
    icon: MessageSquare
  },
  Heart: {
    category: 'Heart',
    name: 'Inner Sanctum',
    arabicTitle: 'رَمْزُ طَهَارَةِ القَلْب',
    runeChar: 'ق',
    colorHex: '#9333ea',
    secondaryHex: '#e9d5ff',
    colorName: 'Purple',
    statBonus: 'Wisdom +2',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-950/40',
    glowColor: 'rgba(147, 51, 234, 0.45)',
    themeColor: 'purple',
    attributeId: 'a-7',
    attributeName: 'Wisdom',
    description: 'Bound to hidden pride, envy, malice, ostentation, and spiritual vanity.',
    icon: Heart
  },
  Rights: {
    category: 'Rights',
    name: 'Eternal Justice',
    arabicTitle: 'رَمْزُ العَدْلِ وَالحُقُوق',
    runeChar: 'ح',
    colorHex: '#10b981',
    secondaryHex: '#a7f3d0',
    colorName: 'Jade',
    statBonus: 'Strength +2',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-950/40',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    themeColor: 'emerald',
    attributeId: 'a-1',
    attributeName: 'Strength',
    description: 'Bound to the rights of others, broken promises, unpaid debts, and injustices.',
    icon: HeartHandshake
  },
  'Wasted Potential': {
    category: 'Wasted Potential',
    name: 'Fleeting Breath',
    arabicTitle: 'رَمْزُ أَنْفَاسِ العُمُر',
    runeChar: 'ض',
    colorHex: '#6366f1',
    secondaryHex: '#c7d2fe',
    colorName: 'Indigo',
    statBonus: 'Focus +2',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/50',
    bgColor: 'bg-indigo-950/40',
    glowColor: 'rgba(99, 102, 241, 0.45)',
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
  stoneVariant?: StoneVariant;
  shape?: RuneShape;
  visualState?: RuneVisualState;
}

export const SlipRune: React.FC<SlipRuneProps> = ({
  category,
  size = 'md',
  className = '',
  showRuneGlow = true,
  showCharOnly = false,
  stoneVariant = 'basalt',
  shape = 'octagram',
  visualState
}) => {
  const rune = SLIP_RUNES[category] || SLIP_RUNES.Obligations;

  if (showCharOnly) {
    return (
      <span
        className={`font-serif font-black select-none ${rune.textColor} ${className}`}
        style={{
          textShadow: showRuneGlow
            ? `0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.18), 0 0 10px ${rune.glowColor}`
            : `0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.18)`
        }}
      >
        {rune.runeChar}
      </span>
    );
  }

  return (
    <AncientCarvedRune
      category={category}
      size={size}
      shape={shape}
      stoneVariant={stoneVariant}
      glowIntensity={showRuneGlow ? 'subtle' : 'none'}
      className={className}
      showCracks={true}
      showWeathering={true}
      visualState={visualState}
    />
  );
};
