export type CodexThemeId = 'imperial-gold' | 'shadow-blue' | 'emerald-manuscript' | 'obsidian-silver' | 'astral-violet' | 'crimson-sovereign';
export type CodexOrnamentation = 'minimal' | 'standard' | 'rich';
export type CodexGlow = 'low' | 'standard' | 'high';
export type CodexDensity = 'compact' | 'standard' | 'spacious';

export interface VisualCodexSettings {
  theme: CodexThemeId;
  ornamentation: CodexOrnamentation;
  glow: CodexGlow;
  density: CodexDensity;
  reducedMotion: boolean;
}

export interface CodexThemeMetadata {
  id: CodexThemeId;
  name: string;
  subtitle: string;
  description: string;
  archetype: string;
  swatches: {
    void: string;
    surface: string;
    card: string;
    accent: string;
    bright: string;
    highlight: string;
  };
  hierarchy: string;
  atmosphere: string;
}

export const CODEX_THEMES: Record<CodexThemeId, CodexThemeMetadata> = {
  'imperial-gold': {
    id: 'imperial-gold',
    name: 'Imperial Gold',
    subtitle: 'Illuminated Manuscript & Cyber-Islamic RPG',
    description: 'The canonical Pale Ore identity. Gilded antique gold, deep onyx void, and illuminated geometric calligraphy.',
    archetype: 'Imperial Sovereign',
    swatches: {
      void: '#07080c',
      surface: '#0b0d13',
      card: '#0f121a',
      accent: '#c5a059',
      bright: '#e5c875',
      highlight: '#fef08a'
    },
    hierarchy: 'Onyx Void → Antique Gold → Bright Gold → Celestial Inset',
    atmosphere: 'Solemn, royal, illuminated, divine discipline'
  },
  'shadow-blue': {
    id: 'shadow-blue',
    name: 'Shadow Blue',
    subtitle: 'Black Deep Sapphire & Royal Cobalt Veins',
    description: 'A formidable nocturnal realm carved from deep pitch-black obsidian void and abyssal stone, coursing with deep royal sapphire and crystalline cobalt power veins.',
    archetype: 'Nocturnal Arcane Sentinel',
    swatches: {
      void: '#030407',
      surface: '#06080d',
      card: '#090c14',
      accent: '#1e3a8a',
      bright: '#2563eb',
      highlight: '#60a5fa'
    },
    hierarchy: 'Obsidian Void → Deep Sapphire → Royal Cobalt Power Vein',
    atmosphere: 'Nocturnal obsidian, royal sapphire intensity, electric cobalt veins, disciplined arcane focus'
  },
  'emerald-manuscript': {
    id: 'emerald-manuscript',
    name: 'Emerald Manuscript',
    subtitle: 'Sacred Jade & Illuminated Obsidian Manuscript',
    description: 'Deep pitch-black obsidian manuscript tablets illuminated by sacred jade calligraphy, verdant forest borders, and celestial celadon telemetry against pure dark stone.',
    archetype: 'Scholarly Sage',
    swatches: {
      void: '#030504',
      surface: '#060907',
      card: '#0a0d0b',
      accent: '#047857',
      bright: '#059669',
      highlight: '#34d399'
    },
    hierarchy: 'Obsidian Void → Sacred Jade Inlay → Celadon Telemetry',
    atmosphere: 'Illuminated obsidian, sacred jade sanctuary, disciplined scholarly contemplation'
  },
  'obsidian-silver': {
    id: 'obsidian-silver',
    name: 'Obsidian Silver',
    subtitle: 'Tactical Graphite, Sterling Silver & Pearlescent White',
    description: 'Pure monolithic stealth. Deep obsidian and graphite surfaces chiseled with razor-sharp sterling silver veins and crystalline pearlescent white highlights that gleam against the dark void.',
    archetype: 'Tactical Monolith',
    swatches: {
      void: '#040406',
      surface: '#090a0f',
      card: '#12131a',
      accent: '#8492a6',
      bright: '#cbd5e1',
      highlight: '#fcfdff'
    },
    hierarchy: 'Monolithic Obsidian → Sterling Silver → Pearlescent White',
    atmosphere: 'Stealth, monolithic, crystalline pearlescent sheen, zero distraction'
  },
  'astral-violet': {
    id: 'astral-violet',
    name: 'Astral Violet',
    subtitle: 'Obsidian Slate & Ethereal Violet Power Veins',
    description: 'A mystical nocturnal dimension carved from deep obsidian slate and abyssal midnight, coursing with ethereal violet power veins and radiant amethyst luminescence that strikingly illuminates the dark stone.',
    archetype: 'Ethereal Ascendant / Qiyam Vigil',
    swatches: {
      void: '#030206',
      surface: '#080512',
      card: '#110a22',
      accent: '#7c3aed',
      bright: '#a855f7',
      highlight: '#f3e8ff'
    },
    hierarchy: 'Obsidian Slate → Royal Amethyst → Ethereal Violet Vein',
    atmosphere: 'Mystical night vigil, concentrated ethereal mana, pulsing power veins'
  },
  'crimson-sovereign': {
    id: 'crimson-sovereign',
    name: 'Crimson Sovereign',
    subtitle: 'Bloodstone Damascus & Imperial Ruby Veins',
    description: 'A formidable realm forged in pure obsidian black stone, chiseled with deep Damascus ruby power veins and radiant crimson illumination. Embodies martial Furūsiyya chivalry, resolute discipline, and uncompromising accountability.',
    archetype: 'Vanguard Sovereign / Furūsiyya',
    swatches: {
      void: '#040304',
      surface: '#070507',
      card: '#0b080a',
      accent: '#b91c1c',
      bright: '#dc2626',
      highlight: '#f87171'
    },
    hierarchy: 'Obsidian Void → Bloodstone Damascus → Imperial Ruby Power Vein',
    atmosphere: 'Deep black obsidian, imperial ruby chivalry, resolute discipline, incandescent crimson veins'
  }
};

export const DEFAULT_VISUAL_CODEX_SETTINGS: VisualCodexSettings = {
  theme: 'imperial-gold',
  ornamentation: 'standard',
  glow: 'standard',
  density: 'standard',
  reducedMotion: false
};

export const CODEX_STORAGE_KEY = 'pale_ore_visual_codex_v1';

export const getStoredVisualCodexSettings = (): VisualCodexSettings => {
  if (typeof window === 'undefined') return DEFAULT_VISUAL_CODEX_SETTINGS;
  try {
    const raw = localStorage.getItem(CODEX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validThemes: CodexThemeId[] = ['imperial-gold', 'shadow-blue', 'emerald-manuscript', 'obsidian-silver', 'astral-violet', 'crimson-sovereign'];
      return {
        theme: (validThemes.includes(parsed.theme) ? parsed.theme : 'imperial-gold') as CodexThemeId,
        ornamentation: (['minimal', 'standard', 'rich'].includes(parsed.ornamentation) ? parsed.ornamentation : 'standard') as CodexOrnamentation,
        glow: (['low', 'standard', 'high'].includes(parsed.glow) ? parsed.glow : 'standard') as CodexGlow,
        density: (['compact', 'standard', 'spacious'].includes(parsed.density) ? parsed.density : 'standard') as CodexDensity,
        reducedMotion: Boolean(parsed.reducedMotion)
      };
    }
  } catch (err) {
    console.error('Error reading Visual Codex settings:', err);
  }
  return DEFAULT_VISUAL_CODEX_SETTINGS;
};

export const applyVisualCodexToDOM = (settings: VisualCodexSettings): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', settings.theme);
  root.setAttribute('data-ornamentation', settings.ornamentation);
  root.setAttribute('data-glow', settings.glow);
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-reduced-motion', String(settings.reducedMotion));

  // Sync theme-color meta tag with current void background
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const bgVoid = CODEX_THEMES[settings.theme]?.swatches.void || '#07080c';
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', bgVoid);
  }

  // Also update body background
  if (document.body) {
    document.body.style.backgroundColor = bgVoid;
  }
};

export const saveStoredVisualCodexSettings = (settings: VisualCodexSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(settings));
    applyVisualCodexToDOM(settings);
  } catch (err) {
    console.error('Error saving Visual Codex settings:', err);
  }
};
