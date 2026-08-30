import React, { useId } from 'react';
import { MuhasabahCategory } from '../types';

export const CATEGORY_RUNE_METADATA: Record<MuhasabahCategory, {
  runeChar: string;
  colorHex: string;
  secondaryHex: string;
  name: string;
  arabicTitle: string;
  attributeName: string;
  statBonus: string;
  sigilTitle: string;
}> = {
  Obligations: {
    runeChar: 'ف',
    colorHex: '#d4af37', // Gold
    secondaryHex: '#fef08a',
    name: 'Divine Pillar',
    arabicTitle: 'رَمْزُ العَهْدِ وَالفَرَائِض',
    attributeName: 'Faith',
    statBonus: 'Faith +2',
    sigilTitle: 'ف — Divine Pillar — Gold — Faith +2'
  },
  Desires: {
    runeChar: 'ش',
    colorHex: '#e11d48', // Crimson
    secondaryHex: '#fca5a5',
    name: 'Veiled Fire',
    arabicTitle: 'رَمْزُ النَّفْسِ وَالهَوَى',
    attributeName: 'Discipline',
    statBonus: 'Discipline +2',
    sigilTitle: 'ش — Veiled Fire — Crimson — Discipline +2'
  },
  Speech: {
    runeChar: 'ل',
    colorHex: '#06b6d4', // Cyan
    secondaryHex: '#a5f3fc',
    name: 'Pierced Seal',
    arabicTitle: 'رَمْزُ صَمْتِ اللِّسَان',
    attributeName: 'Social',
    statBonus: 'Social +2',
    sigilTitle: 'ل — Pierced Seal — Cyan — Social +2'
  },
  Heart: {
    runeChar: 'ق',
    colorHex: '#9333ea', // Purple
    secondaryHex: '#e9d5ff',
    name: 'Inner Sanctum',
    arabicTitle: 'رَمْزُ طَهَارَةِ القَلْب',
    attributeName: 'Wisdom',
    statBonus: 'Wisdom +2',
    sigilTitle: 'ق — Inner Sanctum — Purple — Wisdom +2'
  },
  Rights: {
    runeChar: 'ح',
    colorHex: '#10b981', // Jade
    secondaryHex: '#a7f3d0',
    name: 'Eternal Justice',
    arabicTitle: 'رَمْزُ العَدْلِ وَالحُقُوق',
    attributeName: 'Strength',
    statBonus: 'Strength +2',
    sigilTitle: 'ح — Eternal Justice — Jade — Strength +2'
  },
  'Wasted Potential': {
    runeChar: 'ض',
    colorHex: '#6366f1', // Indigo
    secondaryHex: '#c7d2fe',
    name: 'Fleeting Breath',
    arabicTitle: 'رَمْزُ أَنْفَاسِ العُمُر',
    attributeName: 'Focus',
    statBonus: 'Focus +2',
    sigilTitle: 'ض — Fleeting Breath — Indigo — Focus +2'
  }
};

export type RuneShape = 'octagram' | 'tablet' | 'diamond' | 'round';
export type StoneVariant = 'basalt' | 'meteorite' | 'iron' | 'obsidian';
export type GlowIntensity = 'none' | 'subtle' | 'radiant';
export type RuneSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | number;

export interface AncientCarvedRuneProps {
  /** The character, ligature, or symbol carved into the stone (e.g. 'ف', 'ش', '﷽', '۞', '💎') */
  glyph?: string;
  /** Spiritual category to automatically bind sacred geometry, rune character, and conduit hue */
  category?: MuhasabahCategory;
  /** Shape of the chiseled stone/metal slab */
  shape?: RuneShape;
  /** Stone / mineral material finish */
  stoneVariant?: StoneVariant;
  /** Conduit illumination color (overrides category default) */
  conduitColor?: string;
  /** Secondary chiseled highlight tint */
  secondaryColor?: string;
  /** Glow intensity from within the carved trench */
  glowIntensity?: GlowIntensity;
  /** Size preset or numeric pixel dimension */
  size?: RuneSize;
  /** Whether to render hairline stress fractures and weathered fissures */
  showCracks?: boolean;
  /** Whether to render chiseled corner rivets / alignment nodes */
  showRivets?: boolean;
  /** Weathered chipping on edge vertices */
  showWeathering?: boolean;
  /** CSS class names */
  className?: string;
  /** Interactive state (hover resonance) */
  interactive?: boolean;
  /** Accessible title or tooltip */
  title?: string;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Optional custom child icon or symbol if not using string glyph */
  children?: React.ReactNode;
}

// Pixel dimensions and font scales for presets
const SIZE_CONFIG: Record<string, { px: number; fontSize: number; strokeMultiplier: number }> = {
  xs: { px: 20, fontSize: 13, strokeMultiplier: 0.8 },
  sm: { px: 26, fontSize: 16, strokeMultiplier: 0.9 },
  md: { px: 38, fontSize: 23, strokeMultiplier: 1.0 },
  lg: { px: 52, fontSize: 32, strokeMultiplier: 1.2 },
  xl: { px: 68, fontSize: 42, strokeMultiplier: 1.4 },
  '2xl': { px: 92, fontSize: 56, strokeMultiplier: 1.6 },
  hero: { px: 130, fontSize: 78, strokeMultiplier: 2.0 }
};

// Material color palettes for dark stone & metal slabs
const STONE_PALETTES: Record<StoneVariant, {
  slabGradStart: string;
  slabGradMid: string;
  slabGradEnd: string;
  bevelHighlight: string;
  bevelShadow: string;
  grooveDepth: string;
  fissureColor: string;
  crackHighlight: string;
  surfaceMote: string;
}> = {
  basalt: {
    slabGradStart: '#181b24',
    slabGradMid: '#0f1118',
    slabGradEnd: '#06070a',
    bevelHighlight: 'rgba(215, 225, 240, 0.28)',
    bevelShadow: 'rgba(0, 0, 0, 0.95)',
    grooveDepth: '#030406',
    fissureColor: '#050609',
    crackHighlight: 'rgba(255, 255, 255, 0.12)',
    surfaceMote: 'rgba(255, 255, 255, 0.04)'
  },
  meteorite: {
    slabGradStart: '#1c1722',
    slabGradMid: '#120f18',
    slabGradEnd: '#070509',
    bevelHighlight: 'rgba(235, 210, 255, 0.25)',
    bevelShadow: 'rgba(0, 0, 0, 0.96)',
    grooveDepth: '#040206',
    fissureColor: '#050308',
    crackHighlight: 'rgba(216, 180, 254, 0.15)',
    surfaceMote: 'rgba(192, 132, 252, 0.05)'
  },
  iron: {
    slabGradStart: '#1d2226',
    slabGradMid: '#13171a',
    slabGradEnd: '#080a0c',
    bevelHighlight: 'rgba(200, 230, 245, 0.32)',
    bevelShadow: 'rgba(0, 0, 0, 0.98)',
    grooveDepth: '#020304',
    fissureColor: '#040507',
    crackHighlight: 'rgba(165, 243, 252, 0.14)',
    surfaceMote: 'rgba(148, 163, 184, 0.05)'
  },
  obsidian: {
    slabGradStart: '#13141b',
    slabGradMid: '#0a0a0f',
    slabGradEnd: '#020204',
    bevelHighlight: 'rgba(255, 255, 255, 0.35)',
    bevelShadow: 'rgba(0, 0, 0, 0.98)',
    grooveDepth: '#010102',
    fissureColor: '#020203',
    crackHighlight: 'rgba(255, 255, 255, 0.16)',
    surfaceMote: 'rgba(255, 255, 255, 0.06)'
  }
};

export const AncientCarvedRune: React.FC<AncientCarvedRuneProps> = ({
  glyph,
  category,
  shape = 'octagram',
  stoneVariant = 'basalt',
  conduitColor,
  secondaryColor,
  glowIntensity = 'subtle',
  size = 'md',
  showCracks = true,
  showRivets = true,
  showWeathering = true,
  className = '',
  interactive = false,
  title,
  onClick,
  children
}) => {
  const uniqueId = useId().replace(/:/g, '-');

  // Resolve category fallback if provided or from runeChar glyph
  const rawGlyph = glyph ? glyph.trim() : '';
  const detectedCategory: MuhasabahCategory | null = category || (
    rawGlyph === 'ف' ? 'Obligations' :
    rawGlyph === 'ش' ? 'Desires' :
    rawGlyph === 'ل' ? 'Speech' :
    rawGlyph === 'ق' ? 'Heart' :
    rawGlyph === 'ح' ? 'Rights' :
    rawGlyph === 'ض' ? 'Wasted Potential' :
    null
  );

  const categoryRune = detectedCategory ? (CATEGORY_RUNE_METADATA[detectedCategory] || CATEGORY_RUNE_METADATA.Obligations) : null;
  const resolvedGlyph = rawGlyph || categoryRune?.runeChar || 'ف';
  const resolvedConduitColor = conduitColor || categoryRune?.colorHex || '#d4af37';
  const resolvedSecondaryColor = secondaryColor || categoryRune?.secondaryHex || '#fef08a';

  // Dimension calculations
  let pixelSize = 38;
  let fontPixelSize = 23;
  let strokeMult = 1.0;

  if (typeof size === 'number') {
    pixelSize = size;
    fontPixelSize = Math.round(size * 0.6);
    strokeMult = size / 38;
  } else if (SIZE_CONFIG[size]) {
    pixelSize = SIZE_CONFIG[size].px;
    fontPixelSize = SIZE_CONFIG[size].fontSize;
    strokeMult = SIZE_CONFIG[size].strokeMultiplier;
  }

  const mat = STONE_PALETTES[stoneVariant] || STONE_PALETTES.basalt;

  // Glow filter parameters
  const glowOpacities = {
    none: 0,
    subtle: 0.45,
    radiant: 0.85
  };
  const glowAlpha = glowOpacities[glowIntensity];

  const tooltip = title || (categoryRune ? `${categoryRune.sigilTitle}` : `Carved Inscription: ${resolvedGlyph}`);

  // Base 100x100 coordinate geometry
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group ${
        interactive ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      title={tooltip}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Stone Slab Gradient with directional light bevel */}
          <linearGradient id={`stone-grad-${uniqueId}`} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor={mat.slabGradStart} />
            <stop offset="50%" stopColor={mat.slabGradMid} />
            <stop offset="100%" stopColor={mat.slabGradEnd} />
          </linearGradient>

          {/* 2. Top-Left Rim Bevel Gleam */}
          <linearGradient id={`bevel-rim-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={mat.bevelHighlight} />
            <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.7)" />
            <stop offset="100%" stopColor={mat.bevelShadow} />
          </linearGradient>

          {/* 3. Carved Groove Shadow Filter (Deep Chiseled Trench Relief) */}
          <filter id={`carved-relief-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="1.4" in="SourceAlpha" result="shadowOffset" />
            <feGaussianBlur in="shadowOffset" stdDeviation="1.0" result="shadowBlur" />
            <feFlood floodColor="#000000" floodOpacity="0.95" result="shadowFlood" />
            <feComposite in="shadowFlood" in2="shadowBlur" operator="in" result="deepShadow" />

            {/* Inner Conduit Smolder */}
            {glowIntensity !== 'none' && (
              <>
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="conduitBlur" />
                <feFlood floodColor={resolvedConduitColor} floodOpacity={glowAlpha} result="conduitFlood" />
                <feComposite in="conduitFlood" in2="conduitBlur" operator="in" result="conduitGlow" />
              </>
            )}

            <feMerge>
              {glowIntensity !== 'none' && <feMergeNode in="conduitGlow" />}
              <feMergeNode in="deepShadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 4. Fine Weathering Noise Pattern Overlay */}
          <radialGradient id={`ambient-core-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={resolvedConduitColor} stopOpacity={glowAlpha * 0.28} />
            <stop offset="70%" stopColor={mat.slabGradMid} stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>

          {/* 5. Authentic Stone Surface Texture Filter */}
          <filter id={`stone-texture-${uniqueId}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.5   0 0 0 0 0.5   0 0 0 0 0.5   0 0 0 0.14 0" in="noise" result="coloredNoise" />
            <feBlend mode="overlay" in="SourceGraphic" in2="coloredNoise" />
          </filter>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* LAYER 1: CHISELED STONE/METAL SLAB BASE & BEVELS     */}
        {/* ---------------------------------------------------- */}

        {/* SHAPE A: OCTAGRAM (Rub El Hizb Star Tablet) */}
        {shape === 'octagram' && (
          <g filter={`url(#stone-texture-${uniqueId})`}>
            {/* Outer Drop Shadow under stone */}
            <rect x="15" y="15" width="70" height="70" rx="4" fill="#000000" opacity="0.6" filter="blur(2px)" />
            <rect x="15" y="15" width="70" height="70" rx="4" transform="rotate(45 50 50)" fill="#000000" opacity="0.6" filter="blur(2px)" />

            {/* Primary Stone Squares */}
            <rect
              x="16"
              y="16"
              width="68"
              height="68"
              rx="4"
              fill={`url(#stone-grad-${uniqueId})`}
              stroke={`url(#bevel-rim-${uniqueId})`}
              strokeWidth="1.6"
            />
            <rect
              x="16"
              y="16"
              width="68"
              height="68"
              rx="4"
              transform="rotate(45 50 50)"
              fill={`url(#stone-grad-${uniqueId})`}
              stroke={`url(#bevel-rim-${uniqueId})`}
              strokeWidth="1.6"
            />

            {/* Inner Chiseled Recess Trench */}
            <circle cx="50" cy="50" r="39" fill={`url(#ambient-core-${uniqueId})`} stroke="#040507" strokeWidth="1.8" />
            <circle cx="50" cy="50" r="37.5" stroke={mat.bevelHighlight} strokeWidth="0.6" strokeOpacity="0.5" />
          </g>
        )}

        {/* SHAPE B: TABLET (Chamfered Sacred Stele) */}
        {shape === 'tablet' && (
          <g filter={`url(#stone-texture-${uniqueId})`}>
            {/* Outer Drop Shadow */}
            <polygon
              points="20,12 80,12 90,22 90,78 80,88 20,88 10,78 10,22"
              fill="#000000"
              opacity="0.65"
              filter="blur(2px)"
              transform="translate(1, 2)"
            />
            {/* Main Chiseled Tablet */}
            <polygon
              points="20,12 80,12 90,22 90,78 80,88 20,88 10,78 10,22"
              fill={`url(#stone-grad-${uniqueId})`}
              stroke={`url(#bevel-rim-${uniqueId})`}
              strokeWidth="1.8"
            />
            {/* Inner Chiseled Inset Stele Border */}
            <polygon
              points="23,17 77,17 85,25 85,75 77,83 23,83 15,75 15,25"
              fill={`url(#ambient-core-${uniqueId})`}
              stroke="#040507"
              strokeWidth="1.5"
            />
            <polygon
              points="23,17 77,17 85,25 85,75 77,83 23,83 15,75 15,25"
              stroke={mat.bevelHighlight}
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          </g>
        )}

        {/* SHAPE C: DIAMOND (Acoustic Talisman Rhombus) */}
        {shape === 'diamond' && (
          <g filter={`url(#stone-texture-${uniqueId})`}>
            {/* Drop Shadow */}
            <polygon points="50,9 91,50 50,91 9,50" fill="#000000" opacity="0.65" filter="blur(2px)" transform="translate(1, 2)" />
            {/* Main Diamond Slab */}
            <polygon
              points="50,9 91,50 50,91 9,50"
              fill={`url(#stone-grad-${uniqueId})`}
              stroke={`url(#bevel-rim-${uniqueId})`}
              strokeWidth="1.8"
            />
            {/* Inner Inscription Facet */}
            <polygon
              points="50,16 84,50 50,84 16,50"
              fill={`url(#ambient-core-${uniqueId})`}
              stroke="#040507"
              strokeWidth="1.6"
            />
            <polygon
              points="50,17 83,50 50,83 17,50"
              stroke={mat.bevelHighlight}
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
          </g>
        )}

        {/* SHAPE D: ROUND (Ancient Relic Medallion) */}
        {shape === 'round' && (
          <g filter={`url(#stone-texture-${uniqueId})`}>
            {/* Drop Shadow */}
            <circle cx="51" cy="52" r="41" fill="#000000" opacity="0.6" filter="blur(2px)" />
            {/* Outer Stone Rim */}
            <circle
              cx="50"
              cy="50"
              r="41"
              fill={`url(#stone-grad-${uniqueId})`}
              stroke={`url(#bevel-rim-${uniqueId})`}
              strokeWidth="1.8"
            />
            {/* Inner Depressed Bed */}
            <circle cx="50" cy="50" r="34" fill={`url(#ambient-core-${uniqueId})`} stroke="#040507" strokeWidth="1.8" />
            <circle cx="50" cy="50" r="33" stroke={mat.bevelHighlight} strokeWidth="0.5" strokeOpacity="0.4" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* LAYER 2 & 4: THE 6 SACRED CARVED NAFS SIGILS        */}
        {/* (Combines Arabic letter with sacred geometry deeply   */}
        {/*  engraved into stone with bas-relief trench shadows) */}
        {/* ---------------------------------------------------- */}

        {/* SIGIL 1: ف — Divine Pillar — Gold — Faith +2 */}
        {detectedCategory === 'Obligations' && (
          <g id={`sigil-divine-pillar-${uniqueId}`} className="select-none pointer-events-none">
            {/* --- PASS 1: DEEP CAST-SHADOW CAVITY (Simulates recessed V-groove depth) --- */}
            <g transform="translate(0.9, 1.3)" opacity="0.95">
              {/* Dual Rub El Hizb Squares */}
              <rect x="22" y="22" width="56" height="56" rx="3" stroke="#000000" strokeWidth="2.4" fill="none" />
              <rect x="22" y="22" width="56" height="56" rx="3" transform="rotate(45 50 50)" stroke="#000000" strokeWidth="2.4" fill="none" />
              {/* Twin Fortress Pillars */}
              <line x1="26" y1="28" x2="26" y2="76" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="74" y1="28" x2="74" y2="76" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="22" y1="76" x2="30" y2="76" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="70" y1="76" x2="78" y2="76" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" />
              {/* Apex Beacon Pyramid */}
              <polygon points="50,12 57,21 43,21" fill="#000000" stroke="#000000" strokeWidth="1.2" />
              {/* Dot Starburst Diamond */}
              <polygon points="50,22 53,25 50,28 47,25" fill="#000000" />
              {/* Central Letter ف Shadow */}
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill="#000000">
                ف
              </text>
            </g>

            {/* --- PASS 2: SPECULAR CHISEL LIP HIGHLIGHT (Top-left catch) --- */}
            <g transform="translate(-0.6, -0.6)" opacity="0.48">
              <rect x="22" y="22" width="56" height="56" rx="3" stroke={mat.bevelHighlight} strokeWidth="0.65" fill="none" />
              <rect x="22" y="22" width="56" height="56" rx="3" transform="rotate(45 50 50)" stroke={mat.bevelHighlight} strokeWidth="0.65" fill="none" />
              <line x1="26" y1="28" x2="26" y2="76" stroke={mat.bevelHighlight} strokeWidth="0.8" strokeLinecap="round" />
              <line x1="74" y1="28" x2="74" y2="76" stroke={mat.bevelHighlight} strokeWidth="0.8" strokeLinecap="round" />
              <polygon points="50,12 57,21 43,21" stroke={mat.bevelHighlight} strokeWidth="0.5" fill="none" />
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill="none" stroke={mat.bevelHighlight} strokeWidth="0.75">
                ف
              </text>
            </g>

            {/* --- PASS 3: CONDUIT ENERGY GLOW IN THE CARVED GROOVE --- */}
            {glowIntensity !== 'none' && (
              <g opacity={glowAlpha}>
                <rect x="22" y="22" width="56" height="56" rx="3" stroke={resolvedConduitColor} strokeWidth="1.8" fill="none" style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <rect x="22" y="22" width="56" height="56" rx="3" transform="rotate(45 50 50)" stroke={resolvedConduitColor} strokeWidth="1.8" fill="none" style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <line x1="26" y1="28" x2="26" y2="76" stroke={resolvedConduitColor} strokeWidth="2.2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <line x1="74" y1="28" x2="74" y2="76" stroke={resolvedConduitColor} strokeWidth="2.2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <polygon points="50,12 57,21 43,21" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <polygon points="50,22 53,25 50,28 47,25" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedSecondaryColor})` }} />
                <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }}>
                  ف
                </text>
              </g>
            )}

            {/* --- PASS 4: INLAID GOLD MINERAL CHISEL RIM --- */}
            <g>
              {/* Dual Rub El Hizb Squares */}
              <rect x="22" y="22" width="56" height="56" rx="3" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.8" fill="none" />
              <rect x="22" y="22" width="56" height="56" rx="3" transform="rotate(45 50 50)" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.8" fill="none" />
              {/* Twin Fortress Pillars */}
              <line x1="26" y1="28" x2="26" y2="76" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.9" />
              <line x1="74" y1="28" x2="74" y2="76" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.9" />
              {/* Pillar capitols and plinths */}
              <line x1="22" y1="76" x2="30" y2="76" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="70" y1="76" x2="78" y2="76" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="22" y1="28" x2="30" y2="28" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="70" y1="28" x2="78" y2="28" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              {/* Apex Beacon Pyramid */}
              <polygon points="50,12 57,21 43,21" fill={resolvedSecondaryColor} opacity="0.9" stroke="#040507" strokeWidth="0.8" />
              {/* Dot Starburst Diamond */}
              <polygon points="50,22 53.5,25.5 50,29 46.5,25.5" fill="#fef08a" stroke="#040507" strokeWidth="0.6" />
              {/* Central Letter ف Face */}
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill={resolvedSecondaryColor} stroke="#07090e" strokeWidth="0.8" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.2)' }}>
                ف
              </text>
            </g>
          </g>
        )}

        {/* SIGIL 2: ش — Veiled Fire — Crimson — Discipline +2 */}
        {detectedCategory === 'Desires' && (
          <g id={`sigil-veiled-fire-${uniqueId}`} className="select-none pointer-events-none">
            {/* PASS 1: DEEP CAST-SHADOW CAVITY */}
            <g transform="translate(0.9, 1.3)" opacity="0.95">
              <circle cx="50" cy="50" r="39" stroke="#000000" strokeWidth="2.4" strokeDasharray="14 5" fill="none" />
              <path d="M 18,50 Q 50,20 82,50 Q 50,80 18,50 Z" stroke="#000000" strokeWidth="2.6" fill="#000000" />
              {/* Triple Flame Spikes */}
              <path d="M 44,28 Q 41,20 44,14 Q 47,20 44,28 Z" fill="#000000" />
              <path d="M 50,23 Q 47,15 50,9 Q 53,15 50,23 Z" fill="#000000" />
              <path d="M 56,28 Q 53,20 56,14 Q 59,20 56,28 Z" fill="#000000" />
              {/* Letter ش Shadow */}
              <text x="50" y="59" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill="#000000">
                ش
              </text>
            </g>

            {/* PASS 2: SPECULAR CHISEL LIP HIGHLIGHT */}
            <g transform="translate(-0.6, -0.6)" opacity="0.48">
              <circle cx="50" cy="50" r="39" stroke={mat.bevelHighlight} strokeWidth="0.65" strokeDasharray="14 5" fill="none" />
              <path d="M 18,50 Q 50,20 82,50 Q 50,80 18,50 Z" stroke={mat.bevelHighlight} strokeWidth="0.7" fill="none" />
              <text x="50" y="59" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill="none" stroke={mat.bevelHighlight} strokeWidth="0.75">
                ش
              </text>
            </g>

            {/* PASS 3: CONDUIT ENERGY GLOW */}
            {glowIntensity !== 'none' && (
              <g opacity={glowAlpha}>
                <path d="M 18,50 Q 50,20 82,50 Q 50,80 18,50 Z" stroke={resolvedConduitColor} strokeWidth="2.2" fill="none" style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <path d="M 44,28 Q 41,20 44,14 Q 47,20 44,28 Z" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <path d="M 50,23 Q 47,15 50,9 Q 53,15 50,23 Z" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <path d="M 56,28 Q 53,20 56,14 Q 59,20 56,28 Z" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <text x="50" y="59" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 5px ${resolvedConduitColor})` }}>
                  ش
                </text>
              </g>
            )}

            {/* PASS 4: INLAID CRIMSON MINERAL CHISEL RIM */}
            <g>
              <circle cx="50" cy="50" r="39" stroke={resolvedConduitColor} strokeWidth="1.2" strokeDasharray="14 5" strokeOpacity="0.7" fill="none" />
              <path d="M 18,50 Q 50,20 82,50 Q 50,80 18,50 Z" stroke={resolvedConduitColor} strokeWidth="1.4" strokeOpacity="0.85" fill="#1b050d" fillOpacity="0.4" />
              {/* Triple Chiseled Flame Embers */}
              <path d="M 44,28 Q 41,20 44,14 Q 47,20 44,28 Z" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.6" />
              <path d="M 50,23 Q 47,15 50,9 Q 53,15 50,23 Z" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.6" />
              <path d="M 56,28 Q 53,20 56,14 Q 59,20 56,28 Z" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.6" />
              {/* Radial Containment Spurs */}
              <line x1="22" y1="22" x2="27" y2="27" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" />
              <line x1="78" y1="22" x2="73" y2="27" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" />
              <line x1="22" y1="78" x2="27" y2="73" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" />
              <line x1="78" y1="78" x2="73" y2="73" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" />
              {/* Central Letter ش Face */}
              <text x="50" y="59" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="40" fill={resolvedSecondaryColor} stroke="#07090e" strokeWidth="0.8" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.2)' }}>
                ش
              </text>
            </g>
          </g>
        )}

        {/* SIGIL 3: ل — Pierced Seal — Cyan — Social +2 */}
        {detectedCategory === 'Speech' && (
          <g id={`sigil-pierced-seal-${uniqueId}`} className="select-none pointer-events-none">
            {/* PASS 1: DEEP CAST-SHADOW CAVITY */}
            <g transform="translate(0.9, 1.3)" opacity="0.95">
              <polygon points="50,11 89,50 50,89 11,50" stroke="#000000" strokeWidth="2.6" fill="#000000" />
              <polygon points="50,21 79,50 50,79 21,50" stroke="#000000" strokeWidth="2.0" fill="none" />
              {/* 4 Sound-Suppression Nodes */}
              <circle cx="50" cy="13" r="3.2" fill="#000000" />
              <circle cx="87" cy="50" r="3.2" fill="#000000" />
              <circle cx="50" cy="87" r="3.2" fill="#000000" />
              <circle cx="13" cy="50" r="3.2" fill="#000000" />
              {/* Piercing Mast of Lam */}
              <line x1="50" y1="14" x2="50" y2="58" stroke="#000000" strokeWidth="3.2" strokeLinecap="round" />
              {/* Letter ل Shadow */}
              <text x="49" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="42" fill="#000000">
                ل
              </text>
            </g>

            {/* PASS 2: SPECULAR CHISEL LIP HIGHLIGHT */}
            <g transform="translate(-0.6, -0.6)" opacity="0.48">
              <polygon points="50,11 89,50 50,89 11,50" stroke={mat.bevelHighlight} strokeWidth="0.7" fill="none" />
              <polygon points="50,21 79,50 50,79 21,50" stroke={mat.bevelHighlight} strokeWidth="0.55" fill="none" />
              <line x1="50" y1="14" x2="50" y2="58" stroke={mat.bevelHighlight} strokeWidth="0.8" strokeLinecap="round" />
              <text x="49" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="42" fill="none" stroke={mat.bevelHighlight} strokeWidth="0.75">
                ل
              </text>
            </g>

            {/* PASS 3: CONDUIT ENERGY GLOW */}
            {glowIntensity !== 'none' && (
              <g opacity={glowAlpha}>
                <polygon points="50,11 89,50 50,89 11,50" stroke={resolvedConduitColor} strokeWidth="2.2" fill="none" style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <line x1="50" y1="14" x2="50" y2="58" stroke={resolvedConduitColor} strokeWidth="2.4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <circle cx="50" cy="13" r="3" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <circle cx="87" cy="50" r="3" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <circle cx="50" cy="87" r="3" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <circle cx="13" cy="50" r="3" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <text x="49" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="42" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 5px ${resolvedConduitColor})` }}>
                  ل
                </text>
              </g>
            )}

            {/* PASS 4: INLAID CYAN MINERAL CHISEL RIM */}
            <g>
              <polygon points="50,11 89,50 50,89 11,50" stroke={resolvedConduitColor} strokeWidth="1.4" strokeOpacity="0.85" fill="#04121a" fillOpacity="0.5" />
              <polygon points="50,21 79,50 50,79 21,50" stroke={resolvedSecondaryColor} strokeWidth="1.0" strokeDasharray="4 2" strokeOpacity="0.75" fill="none" />
              {/* Piercing Spear Line */}
              <line x1="50" y1="14" x2="50" y2="58" stroke={resolvedSecondaryColor} strokeWidth="1.8" strokeLinecap="round" />
              {/* Sound-Seal Nodes */}
              <circle cx="50" cy="13" r="2.8" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.8" />
              <circle cx="87" cy="50" r="2.8" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.8" />
              <circle cx="50" cy="87" r="2.8" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.8" />
              <circle cx="13" cy="50" r="2.8" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.8" />
              {/* Acoustic Dampening Crosshairs */}
              <line x1="28" y1="50" x2="72" y2="50" stroke={resolvedConduitColor} strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.6" />
              {/* Central Letter ل Face */}
              <text x="49" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="42" fill={resolvedSecondaryColor} stroke="#07090e" strokeWidth="0.8" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.2)' }}>
                ل
              </text>
            </g>
          </g>
        )}

        {/* SIGIL 4: ق — Inner Sanctum — Purple — Wisdom +2 */}
        {detectedCategory === 'Heart' && (
          <g id={`sigil-inner-sanctum-${uniqueId}`} className="select-none pointer-events-none">
            {/* PASS 1: DEEP CAST-SHADOW CAVITY */}
            <g transform="translate(0.9, 1.3)" opacity="0.95">
              <path
                d="M 50,25 C 42,13 18,17 18,38 C 18,59 50,81 50,81 C 50,81 82,59 82,38 C 82,17 58,13 50,25 Z"
                stroke="#000000"
                strokeWidth="2.8"
                fill="#000000"
              />
              <polygon points="42,29 58,29 69,40 69,54 58,65 42,65 31,54 31,40" stroke="#000000" strokeWidth="2.0" fill="none" />
              {/* Twin Gemstone Dots */}
              <polygon points="44,18 47,21 44,24 41,21" fill="#000000" />
              <polygon points="56,18 59,21 56,24 53,21" fill="#000000" />
              {/* Letter ق Shadow */}
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill="#000000">
                ق
              </text>
            </g>

            {/* PASS 2: SPECULAR CHISEL LIP HIGHLIGHT */}
            <g transform="translate(-0.6, -0.6)" opacity="0.48">
              <path
                d="M 50,25 C 42,13 18,17 18,38 C 18,59 50,81 50,81 C 50,81 82,59 82,38 C 82,17 58,13 50,25 Z"
                stroke={mat.bevelHighlight}
                strokeWidth="0.75"
                fill="none"
              />
              <polygon points="42,29 58,29 69,40 69,54 58,65 42,65 31,54 31,40" stroke={mat.bevelHighlight} strokeWidth="0.55" fill="none" />
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill="none" stroke={mat.bevelHighlight} strokeWidth="0.75">
                ق
              </text>
            </g>

            {/* PASS 3: CONDUIT ENERGY GLOW */}
            {glowIntensity !== 'none' && (
              <g opacity={glowAlpha}>
                <path
                  d="M 50,25 C 42,13 18,17 18,38 C 18,59 50,81 50,81 C 50,81 82,59 82,38 C 82,17 58,13 50,25 Z"
                  stroke={resolvedConduitColor}
                  strokeWidth="2.2"
                  fill="none"
                  style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }}
                />
                <polygon points="44,18 47,21 44,24 41,21" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedSecondaryColor})` }} />
                <polygon points="56,18 59,21 56,24 53,21" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedSecondaryColor})` }} />
                <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 5px ${resolvedConduitColor})` }}>
                  ق
                </text>
              </g>
            )}

            {/* PASS 4: INLAID PURPLE MINERAL CHISEL RIM */}
            <g>
              <path
                d="M 50,25 C 42,13 18,17 18,38 C 18,59 50,81 50,81 C 50,81 82,59 82,38 C 82,17 58,13 50,25 Z"
                stroke={resolvedConduitColor}
                strokeWidth="1.5"
                strokeOpacity="0.85"
                fill="#180724"
                fillOpacity="0.45"
              />
              {/* Inscribed Octagonal Sanctum Chamber */}
              <polygon points="42,29 58,29 69,40 69,54 58,65 42,65 31,54 31,40" stroke={resolvedSecondaryColor} strokeWidth="0.9" strokeDasharray="4 2" strokeOpacity="0.75" fill="none" />
              {/* Twin Illuminated Gemstone Jewels */}
              <polygon points="44,18 47.5,21.5 44,25 40.5,21.5" fill="#e9d5ff" stroke="#040507" strokeWidth="0.6" />
              <polygon points="56,18 59.5,21.5 56,25 52.5,21.5" fill="#e9d5ff" stroke="#040507" strokeWidth="0.6" />
              {/* Inner Diamond Core Guideline */}
              <polygon points="50,40 57,47 50,54 43,47" stroke={resolvedConduitColor} strokeWidth="0.8" fill="none" opacity="0.6" />
              {/* Central Letter ق Face */}
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill={resolvedSecondaryColor} stroke="#07090e" strokeWidth="0.8" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.2)' }}>
                ق
              </text>
            </g>
          </g>
        )}

        {/* SIGIL 5: ح — Eternal Justice — Jade — Strength +2 */}
        {detectedCategory === 'Rights' && (
          <g id={`sigil-eternal-justice-${uniqueId}`} className="select-none pointer-events-none">
            {/* PASS 1: DEEP CAST-SHADOW CAVITY */}
            <g transform="translate(0.9, 1.3)" opacity="0.95">
              {/* Balance Beam */}
              <line x1="18" y1="34" x2="82" y2="34" stroke="#000000" strokeWidth="3.0" strokeLinecap="round" />
              {/* Plumb Line */}
              <line x1="50" y1="20" x2="50" y2="56" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
              {/* Left Scale Pan */}
              <path d="M 14,56 Q 22,64 30,56 Z" fill="#000000" stroke="#000000" strokeWidth="2.0" />
              <line x1="22" y1="34" x2="16" y2="56" stroke="#000000" strokeWidth="1.8" />
              <line x1="22" y1="34" x2="28" y2="56" stroke="#000000" strokeWidth="1.8" />
              {/* Right Scale Pan */}
              <path d="M 70,56 Q 78,64 86,56 Z" fill="#000000" stroke="#000000" strokeWidth="2.0" />
              <line x1="78" y1="34" x2="72" y2="56" stroke="#000000" strokeWidth="1.8" />
              <line x1="78" y1="34" x2="84" y2="56" stroke="#000000" strokeWidth="1.8" />
              {/* Letter ح Shadow */}
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="39" fill="#000000">
                ح
              </text>
            </g>

            {/* PASS 2: SPECULAR CHISEL LIP HIGHLIGHT */}
            <g transform="translate(-0.6, -0.6)" opacity="0.48">
              <line x1="18" y1="34" x2="82" y2="34" stroke={mat.bevelHighlight} strokeWidth="0.8" strokeLinecap="round" />
              <line x1="50" y1="20" x2="50" y2="56" stroke={mat.bevelHighlight} strokeWidth="0.6" strokeLinecap="round" />
              <path d="M 14,56 Q 22,64 30,56 Z" stroke={mat.bevelHighlight} strokeWidth="0.6" fill="none" />
              <path d="M 70,56 Q 78,64 86,56 Z" stroke={mat.bevelHighlight} strokeWidth="0.6" fill="none" />
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="39" fill="none" stroke={mat.bevelHighlight} strokeWidth="0.75">
                ح
              </text>
            </g>

            {/* PASS 3: CONDUIT ENERGY GLOW */}
            {glowIntensity !== 'none' && (
              <g opacity={glowAlpha}>
                <line x1="18" y1="34" x2="82" y2="34" stroke={resolvedConduitColor} strokeWidth="2.4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <path d="M 14,56 Q 22,64 30,56 Z" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <path d="M 70,56 Q 78,64 86,56 Z" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="39" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 5px ${resolvedConduitColor})` }}>
                  ح
                </text>
              </g>
            )}

            {/* PASS 4: INLAID JADE MINERAL CHISEL RIM */}
            <g>
              {/* Balance Beam */}
              <line x1="18" y1="34" x2="82" y2="34" stroke={resolvedConduitColor} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
              <line x1="50" y1="20" x2="50" y2="56" stroke={resolvedConduitColor} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
              {/* Pivot Ring & Plumb Weight */}
              <circle cx="50" cy="22" r="3.6" stroke={resolvedSecondaryColor} strokeWidth="1.4" fill="none" />
              <polygon points="50,56 53,60 50,64 47,60" fill={resolvedSecondaryColor} stroke="#040507" strokeWidth="0.6" />
              {/* Scale Pans */}
              <path d="M 14,56 Q 22,64 30,56 Z" fill="#042017" fillOpacity="0.6" stroke={resolvedSecondaryColor} strokeWidth="1.3" />
              <line x1="22" y1="34" x2="16" y2="56" stroke={resolvedSecondaryColor} strokeWidth="1.0" opacity="0.85" />
              <line x1="22" y1="34" x2="28" y2="56" stroke={resolvedSecondaryColor} strokeWidth="1.0" opacity="0.85" />
              <polygon points="22,53 24.5,56 22,59 19.5,56" fill="#a7f3d0" stroke="#040507" strokeWidth="0.5" />

              <path d="M 70,56 Q 78,64 86,56 Z" fill="#042017" fillOpacity="0.6" stroke={resolvedSecondaryColor} strokeWidth="1.3" />
              <line x1="78" y1="34" x2="72" y2="56" stroke={resolvedSecondaryColor} strokeWidth="1.0" opacity="0.85" />
              <line x1="78" y1="34" x2="84" y2="56" stroke={resolvedSecondaryColor} strokeWidth="1.0" opacity="0.85" />
              <polygon points="78,53 80.5,56 78,59 75.5,56" fill="#a7f3d0" stroke="#040507" strokeWidth="0.5" />

              {/* Central Letter ح Face */}
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="39" fill={resolvedSecondaryColor} stroke="#07090e" strokeWidth="0.8" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.2)' }}>
                ح
              </text>
            </g>
          </g>
        )}

        {/* SIGIL 6: ض — Fleeting Breath — Indigo — Focus +2 */}
        {detectedCategory === 'Wasted Potential' && (
          <g id={`sigil-fleeting-breath-${uniqueId}`} className="select-none pointer-events-none">
            {/* PASS 1: DEEP CAST-SHADOW CAVITY */}
            <g transform="translate(0.9, 1.3)" opacity="0.95">
              <circle cx="50" cy="50" r="38" stroke="#000000" strokeWidth="2.4" fill="none" />
              <circle cx="50" cy="50" r="31" stroke="#000000" strokeWidth="1.8" strokeDasharray="4 4" fill="none" />
              {/* Hourglass Cones */}
              <polygon points="34,25 66,25 50,49" stroke="#000000" strokeWidth="2.2" fill="#000000" />
              <polygon points="50,49 66,73 34,73" stroke="#000000" strokeWidth="2.2" fill="#000000" />
              {/* Crown Star Dot */}
              <polygon points="63,20 65,23 68,23 66,26 67,29 63,27 59,29 60,26 58,23 61,23" fill="#000000" />
              {/* Letter ض Shadow */}
              <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill="#000000">
                ض
              </text>
            </g>

            {/* PASS 2: SPECULAR CHISEL LIP HIGHLIGHT */}
            <g transform="translate(-0.6, -0.6)" opacity="0.48">
              <circle cx="50" cy="50" r="38" stroke={mat.bevelHighlight} strokeWidth="0.7" fill="none" />
              <polygon points="34,25 66,25 50,49" stroke={mat.bevelHighlight} strokeWidth="0.6" fill="none" />
              <polygon points="50,49 66,73 34,73" stroke={mat.bevelHighlight} strokeWidth="0.6" fill="none" />
              <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill="none" stroke={mat.bevelHighlight} strokeWidth="0.75">
                ض
              </text>
            </g>

            {/* PASS 3: CONDUIT ENERGY GLOW */}
            {glowIntensity !== 'none' && (
              <g opacity={glowAlpha}>
                <circle cx="50" cy="50" r="38" stroke={resolvedConduitColor} strokeWidth="2.0" fill="none" style={{ filter: `drop-shadow(0 0 4px ${resolvedConduitColor})` }} />
                <polygon points="34,25 66,25 50,49" stroke={resolvedConduitColor} strokeWidth="1.8" fill="none" style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <polygon points="50,49 66,73 34,73" stroke={resolvedConduitColor} strokeWidth="1.8" fill="none" style={{ filter: `drop-shadow(0 0 3px ${resolvedConduitColor})` }} />
                <polygon points="63,20 65,23 68,23 66,26 67,29 63,27 59,29 60,26 58,23 61,23" fill={resolvedSecondaryColor} style={{ filter: `drop-shadow(0 0 4px ${resolvedSecondaryColor})` }} />
                <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill={resolvedConduitColor} style={{ filter: `drop-shadow(0 0 5px ${resolvedConduitColor})` }}>
                  ض
                </text>
              </g>
            )}

            {/* PASS 4: INLAID INDIGO MINERAL CHISEL RIM */}
            <g>
              <circle cx="50" cy="50" r="38" stroke={resolvedConduitColor} strokeWidth="1.3" strokeOpacity="0.8" fill="#090a1f" fillOpacity="0.45" />
              <circle cx="50" cy="50" r="31" stroke={resolvedSecondaryColor} strokeWidth="0.9" strokeDasharray="4 4" strokeOpacity="0.65" fill="none" />
              {/* Hourglass Geometry */}
              <polygon points="34,25 66,25 50,49" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.8" fill="none" />
              <polygon points="50,49 66,73 34,73" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.8" fill="none" />
              {/* Astrolabe Solar Calibration Ticks */}
              <line x1="50" y1="12" x2="50" y2="18" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="50" y1="82" x2="50" y2="88" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="12" y1="50" x2="18" y2="50" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="82" y1="50" x2="88" y2="50" stroke={resolvedSecondaryColor} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="23" y1="23" x2="27" y2="27" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              <line x1="77" y1="23" x2="73" y2="27" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              <line x1="23" y1="77" x2="27" y2="73" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              <line x1="77" y1="77" x2="73" y2="73" stroke={resolvedSecondaryColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              {/* Crown Zenith Star Dot */}
              <polygon points="63,20 65,23 68,23 66,26 67,29 63,27 59,29 60,26 58,23 61,23" fill="#c7d2fe" stroke="#040507" strokeWidth="0.6" />
              {/* Central Letter ض Face */}
              <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" className="font-serif font-black" fontSize="38" fill={resolvedSecondaryColor} stroke="#07090e" strokeWidth="0.8" style={{ textShadow: '0 -1px 1px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.2)' }}>
                ض
              </text>
            </g>
          </g>
        )}

        {/* UNIVERSAL SACRED GEOMETRY (For custom glyphs or unmapped categories) */}
        {!detectedCategory && (
          <g opacity="0.8">
            <circle cx="50" cy="50" r="31" stroke={resolvedConduitColor} strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.45" />
            <line x1="50" y1="12" x2="50" y2="18" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
            <line x1="50" y1="82" x2="50" y2="88" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
            <line x1="12" y1="50" x2="18" y2="50" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
            <line x1="82" y1="50" x2="88" y2="50" stroke={resolvedConduitColor} strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* LAYER 3: WEATHERING, CRACKS & CHIPPING               */}
        {/* ---------------------------------------------------- */}
        {showCracks && (
          <g opacity="0.8">
            {/* Primary Stress Fracture */}
            <path
              d="M 68,16 L 63,24 L 66,32 L 60,38 L 56,43"
              stroke="#030406"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="miter"
            />
            {/* Accompanying hair-line crack highlight */}
            <path
              d="M 68.6,16.5 L 63.6,24.5 L 66.6,32.5 L 60.6,38.5 L 56.6,43.5"
              stroke={mat.crackHighlight}
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            {/* Conduit energy fissure seep */}
            {glowIntensity !== 'none' && (
              <path
                d="M 67.5,17 L 63.2,24.2 L 66.2,32.2 L 60.2,38.2"
                stroke={resolvedConduitColor}
                strokeWidth="0.5"
                strokeOpacity={glowAlpha * 0.6}
              />
            )}

            {/* Secondary lower fissure */}
            <path
              d="M 28,78 L 33,72 L 30,65 L 36,59"
              stroke="#020305"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M 28.5,78.5 L 33.5,72.5 L 30.5,65.5"
              stroke={mat.crackHighlight}
              strokeWidth="0.4"
            />
          </g>
        )}

        {/* Chiseled Corner Wear / Edge Chips */}
        {showWeathering && (
          <g>
            <polygon points="17,21 21,17 19,23" fill="#040507" opacity="0.9" />
            <line x1="17" y1="21" x2="21" y2="17" stroke={mat.bevelHighlight} strokeWidth="0.6" strokeOpacity="0.4" />
            <circle cx="27" cy="36" r="0.8" fill="#000000" opacity="0.8" />
            <circle cx="27.4" cy="36.4" r="0.4" fill={mat.crackHighlight} />
            <circle cx="73" cy="62" r="0.9" fill="#000000" opacity="0.8" />
            <circle cx="73.4" cy="62.4" r="0.4" fill={mat.crackHighlight} />
          </g>
        )}

        {/* Alignment Rivets / Mason Dowels */}
        {showRivets && (
          <g>
            <circle cx="50" cy="8" r="1.4" fill="#030406" stroke={mat.bevelHighlight} strokeWidth="0.4" />
            <circle cx="92" cy="50" r="1.4" fill="#030406" stroke={mat.bevelHighlight} strokeWidth="0.4" />
            <circle cx="50" cy="92" r="1.4" fill="#030406" stroke={mat.bevelHighlight} strokeWidth="0.4" />
            <circle cx="8" cy="50" r="1.4" fill="#030406" stroke={mat.bevelHighlight} strokeWidth="0.4" />
          </g>
        )}

        {/* Custom children or non-category custom glyph */}
        {children ? (
          <foreignObject x="18" y="18" width="64" height="64" className="overflow-visible">
            <div className="w-full h-full flex items-center justify-center">
              {children}
            </div>
          </foreignObject>
        ) : !detectedCategory && (
          /\p{Extended_Pictographic}/u.test(resolvedGlyph) ? (
            /* Talismanic Mineral / Elemental Emoji Rendering with Chiseled Bas-Relief */
            <g id={`glyph-emoji-${uniqueId}`}>
              <text
                x="50"
                y="59"
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none pointer-events-none"
                fontSize={fontPixelSize * (100 / pixelSize) * 0.82}
                opacity="0.9"
                style={{ filter: 'blur(1px)' }}
              >
                {resolvedGlyph}
              </text>
              <text
                x="50"
                y="57"
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none pointer-events-none"
                fontSize={fontPixelSize * (100 / pixelSize) * 0.82}
                style={{
                  filter: glowIntensity !== 'none'
                    ? `drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 6px ${resolvedConduitColor})`
                    : `drop-shadow(0 2px 4px rgba(0,0,0,0.95))`
                }}
              >
                {resolvedGlyph}
              </text>
            </g>
          ) : (
            <g id={`glyph-custom-${uniqueId}`}>
              {/* DEEP INSET CHISELED SHADOW */}
              <text
                x="50"
                y="59"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-serif font-black select-none pointer-events-none"
                fontSize={fontPixelSize * (100 / pixelSize)}
                fill="#000000"
                opacity="0.95"
                transform="translate(0, 1.2)"
              >
                {resolvedGlyph}
              </text>
              {/* UPPER CHISEL SPECULAR CATCH */}
              <text
                x="50"
                y="56.5"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-serif font-black select-none pointer-events-none"
                fontSize={fontPixelSize * (100 / pixelSize)}
                fill="none"
                stroke={mat.bevelHighlight}
                strokeWidth="0.75"
                strokeOpacity="0.45"
              >
                {resolvedGlyph}
              </text>
              {/* CONDUIT ENERGY GLOW */}
              {glowIntensity !== 'none' && (
                <text
                  x="50"
                  y="57.5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-serif font-black select-none pointer-events-none"
                  fontSize={fontPixelSize * (100 / pixelSize)}
                  fill={resolvedConduitColor}
                  opacity={glowAlpha}
                  style={{
                    filter: `drop-shadow(0 0 ${strokeMult * 2.5}px ${resolvedConduitColor})`
                  }}
                >
                  {resolvedGlyph}
                </text>
              )}
              {/* CORE CHISELED SURFACE */}
              <text
                x="50"
                y="57.5"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-serif font-black select-none pointer-events-none"
                fontSize={fontPixelSize * (100 / pixelSize)}
                fill={resolvedSecondaryColor}
                stroke="#07090e"
                strokeWidth="0.8"
                style={{
                  textShadow: `0 -1px 1px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.15)`
                }}
              >
                {resolvedGlyph}
              </text>
            </g>
          )
        )}
      </svg>
    </div>
  );
};

