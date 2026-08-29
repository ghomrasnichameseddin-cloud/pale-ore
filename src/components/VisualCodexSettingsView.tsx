import React from 'react';
import { usePOS } from '../POSContext';
import { CODEX_THEMES } from '../utils/visualCodex';
import { CodexThemeId, CodexOrnamentation, CodexGlow, CodexDensity } from '../types';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';
import { 
  Palette, Sparkles, Sliders, Eye, Check, RefreshCw, Moon, Shield, 
  Layers, Zap, Cpu, Compass, BookOpen, Minimize2, Maximize2
} from 'lucide-react';

export const VisualCodexSettingsView: React.FC = () => {
  const { visualCodex, updateVisualCodexSettings, setTheme } = usePOS();

  const currentTheme = visualCodex?.theme || 'imperial-gold';
  const currentOrnamentation = visualCodex?.ornamentation || 'standard';
  const currentGlow = visualCodex?.glow || 'standard';
  const currentDensity = visualCodex?.density || 'standard';
  const reducedMotion = visualCodex?.reducedMotion ?? false;

  const themesList = Object.values(CODEX_THEMES);

  const handleResetToDefaults = () => {
    updateVisualCodexSettings({
      theme: 'imperial-gold',
      ornamentation: 'standard',
      glow: 'standard',
      density: 'standard',
      reducedMotion: false
    });
  };

  return (
    <div className="space-y-8" id="visual-codex-container">
      
      {/* CODEX HERO & MANIFESTO */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-accent)] relative overflow-hidden bg-[var(--bg-card)]/90">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-5 w-5" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-5 w-5" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)]">
                <Palette className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-bright)] font-bold">
                SYSTEM_APPEARANCE • VISUAL CODEX ARCHITECTURE
              </span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <span>VISUAL CODEX CANONICAL REGISTRY</span>
            </h2>
            <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed">
              Calibrate the chromatic identity, sacred geometry density, and luminescence of Pale Ore. 
              Underlying character levels, XP equations, prayer covenants, and campaign objectives remain immutable across all codices.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleResetToDefaults}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-void)] hover:bg-[var(--accent-surface)] border border-white/10 hover:border-[var(--border-accent)] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset Visual Codex to default Imperial Gold specifications"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
              <span>RESET TO CANONICAL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 PRIMARY VISUAL CODICES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              CODICES OF PALE ORE ({themesList.length} SACRED REALMS)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            CURRENT CODEX: <span className="text-[var(--accent-highlight)] font-bold uppercase">{CODEX_THEMES[currentTheme]?.name}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themesList.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'glass-panel border-[var(--border-strong)] shadow-[0_0_25px_var(--glow-color)] bg-[var(--bg-surface)]'
                    : 'bg-[#0b0d13]/70 hover:bg-[#0f121a] border-white/10 hover:border-[var(--border-accent)]'
                }`}
              >
                {/* Visual Accent Glow Header */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none transition-opacity group-hover:opacity-45"
                  style={{ backgroundColor: theme.swatches.bright }}
                />

                {/* Ethereal Power Vein Accent Stripe */}
                <div 
                  className="h-1 w-full rounded-full mb-3"
                  style={{
                    background: `linear-gradient(90deg, ${theme.swatches.card} 0%, ${theme.swatches.accent} 50%, ${theme.swatches.highlight} 100%)`
                  }}
                />

                <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top metadata row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="h-3 w-3 rounded-full border border-white/20 shrink-0" 
                            style={{ backgroundColor: theme.swatches.accent }} 
                          />
                          <h4 className="font-display text-base font-bold text-white tracking-wide">
                            {theme.name}
                          </h4>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          {theme.subtitle}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-highlight)] text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 shadow-sm">
                          <Check className="h-3 w-3 text-[var(--accent-highlight)]" /> ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/5 text-zinc-400 group-hover:text-zinc-200 group-hover:border-white/20 text-[10px] font-mono font-bold shrink-0 transition-colors">
                          SELECT
                        </span>
                      )}
                    </div>

                    {/* Aesthetic Lore & Architectural traits */}
                    <div className="mt-3 p-3 rounded-xl bg-[#07080c]/80 border border-white/5 space-y-2">
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {theme.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1.5 border-t border-white/5">
                        <span>HIERARCHY:</span>
                        <span className="text-zinc-300 font-medium truncate max-w-[170px]">{theme.hierarchy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chromatic Palette Swatches (All 6 design tokens) */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                      CHROMATIC SPECIFICATION
                    </span>
                    <div className="grid grid-cols-6 gap-1">
                      <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col gap-0.5 items-center" title={`Void: ${theme.swatches.void}`}>
                        <div 
                          className="h-3.5 w-full rounded border border-white/10" 
                          style={{ backgroundColor: theme.swatches.void }} 
                        />
                        <span className="text-[7px] font-mono text-zinc-500 truncate uppercase">Void</span>
                      </div>
                      <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col gap-0.5 items-center" title={`Surface: ${theme.swatches.surface}`}>
                        <div 
                          className="h-3.5 w-full rounded border border-white/10" 
                          style={{ backgroundColor: theme.swatches.surface }} 
                        />
                        <span className="text-[7px] font-mono text-zinc-500 truncate uppercase">Surf</span>
                      </div>
                      <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col gap-0.5 items-center" title={`Card: ${theme.swatches.card}`}>
                        <div 
                          className="h-3.5 w-full rounded border border-white/10" 
                          style={{ backgroundColor: theme.swatches.card }} 
                        />
                        <span className="text-[7px] font-mono text-zinc-500 truncate uppercase">Card</span>
                      </div>
                      <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col gap-0.5 items-center" title={`Accent: ${theme.swatches.accent}`}>
                        <div 
                          className="h-3.5 w-full rounded border border-white/10" 
                          style={{ backgroundColor: theme.swatches.accent }} 
                        />
                        <span className="text-[7px] font-mono text-zinc-500 truncate uppercase">Acc</span>
                      </div>
                      <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col gap-0.5 items-center" title={`Bright: ${theme.swatches.bright}`}>
                        <div 
                          className="h-3.5 w-full rounded border border-white/10" 
                          style={{ backgroundColor: theme.swatches.bright }} 
                        />
                        <span className="text-[7px] font-mono text-zinc-500 truncate uppercase">Bri</span>
                      </div>
                      <div className="p-1 rounded bg-black/40 border border-white/5 flex flex-col gap-0.5 items-center" title={`Highlight: ${theme.swatches.highlight}`}>
                        <div 
                          className="h-3.5 w-full rounded border border-white/10" 
                          style={{ backgroundColor: theme.swatches.highlight }} 
                        />
                        <span className="text-[7px] font-mono text-zinc-500 truncate uppercase">High</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer action */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-zinc-500">REALM: {theme.id}</span>
                  <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-[var(--accent-highlight)]' : 'text-zinc-400 group-hover:text-white'}`}>
                    {isSelected ? 'ENGAGED REALM' : 'ENGAGE CODEX →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CALIBRATION CONTROLS (ORNAMENTATION, GLOW, DENSITY, MOTION) */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-accent)] space-y-6 bg-[var(--bg-card)]/90 relative">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

        <div className="border-b border-white/10 pb-3">
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--accent-bright)]" />
            <span>VISUAL CODEX CALIBRATION MATRIX</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Calibrate geometric ornamentation level, sanctum aura luminescence, spatial padding, and animation responsiveness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. ORNAMENTATION LEVEL */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-void)] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                ORNAMENTATION
              </span>
              <span className="text-[10px] font-mono text-[var(--accent-highlight)] uppercase font-bold">
                {currentOrnamentation}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Controls Girih stars, Mashrabiya latticework, and gilded corner bracket density.
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['minimal', 'standard', 'rich'] as CodexOrnamentation[]).map((level) => (
                <button
                  key={level}
                  onClick={() => updateVisualCodexSettings({ ornamentation: level })}
                  className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                    currentOrnamentation === level
                      ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border-[var(--border-accent)] shadow-sm'
                      : 'bg-[var(--bg-surface)] text-zinc-400 hover:text-zinc-200 border-white/5'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SANCTUM GLOW */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-void)] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                LUMINESCENCE
              </span>
              <span className="text-[10px] font-mono text-[var(--accent-highlight)] uppercase font-bold">
                {currentGlow}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Calibrates neon aura halos, progress bar radiance, and card hover lighting.
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['low', 'standard', 'high'] as CodexGlow[]).map((glow) => (
                <button
                  key={glow}
                  onClick={() => updateVisualCodexSettings({ glow: glow })}
                  className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                    currentGlow === glow
                      ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border-[var(--border-accent)] shadow-sm'
                      : 'bg-[var(--bg-surface)] text-zinc-400 hover:text-zinc-200 border-white/5'
                  }`}
                >
                  {glow}
                </button>
              ))}
            </div>
          </div>

          {/* 3. INTERFACE DENSITY */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-void)] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                SPATIAL DENSITY
              </span>
              <span className="text-[10px] font-mono text-[var(--accent-highlight)] uppercase font-bold">
                {currentDensity}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Adjusts container margins, internal card padding, and telemetry information packing.
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['compact', 'standard', 'spacious'] as CodexDensity[]).map((density) => (
                <button
                  key={density}
                  onClick={() => updateVisualCodexSettings({ density: density })}
                  className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                    currentDensity === density
                      ? 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border-[var(--border-accent)] shadow-sm'
                      : 'bg-[var(--bg-surface)] text-zinc-400 hover:text-zinc-200 border-white/5'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>

          {/* 4. REDUCED MOTION */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-void)] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                  MOTION ENGINE
                </span>
                <span className={`text-[10px] font-mono uppercase font-bold ${reducedMotion ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {reducedMotion ? 'REDUCED' : 'DYNAMIC'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1">
                Disables tab entrance transitions and kinetic animations for immediate render responsiveness.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => updateVisualCodexSettings({ reducedMotion: !reducedMotion })}
                className={`w-full py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                  reducedMotion
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    : 'bg-[var(--bg-surface)] text-zinc-300 hover:text-white border-white/10'
                }`}
              >
                {reducedMotion ? 'DISABLE REDUCED MOTION' : 'ENABLE REDUCED MOTION'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* LIVE CODEX ARTIFACT SANDBOX (VERIFICATION & PREVIEW) */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-accent)] space-y-6 bg-[var(--bg-card)]/90 relative">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />

        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-[var(--accent-bright)]" />
              <span>LIVE COMPONENT ARTIFACT VERIFICATION</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Live inspection showing how UI components and semantic accents respond to your current token matrix.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-zinc-300">
            REAL-TIME RENDER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Artifact 1: Talisman Frame with Gilded Corner */}
          <div className="talisman-frame gilded-corners rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--accent-highlight)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <RubElHizbIcon className="h-3 w-3 text-[var(--accent-bright)]" /> TALISMAN FRAME
              </span>
              <span className="text-[9px] text-[var(--accent-bright)] font-bold">LVL 42</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Rendered with dual inset hairline borders and themed metallic corner brackets.
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>RESONANCE</span>
                <span className="text-[var(--accent-highlight)] font-bold">78%</span>
              </div>
              <div className="w-full bg-[var(--bg-void)] h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className="rpg-progress-gold h-full rounded" style={{ width: '78%' }} />
              </div>
            </div>
          </div>

          {/* Artifact 2: Typography & Verse Display */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase tracking-wider block font-bold">
              TYPOGRAPHY ARCHETYPE
            </span>
            <div className="space-y-1">
              <p className="font-arabic text-lg text-white leading-relaxed text-right dir-rtl">
                وَتَوَكَّلْ عَلَى الْعَزِيزِ الرَّحِيمِ
              </p>
              <p className="text-[11px] font-serif text-[var(--accent-highlight)] italic">
                "And rely upon the Exalted in Might, the Merciful." (26:217)
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>DISPLAY: Cinzel</span>
              <span>BODY: Plus Jakarta</span>
            </div>
          </div>

          {/* Artifact 3: Semantic Status Colors (Conserved Across Themes) */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase tracking-wider block font-bold">
              CONSERVED SEMANTIC SYSTEM
            </span>
            <p className="text-[10px] text-zinc-400 font-sans">
              Critical functional categories retain distinct spiritual and operational identities:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                EMERALD: SPIRITUAL
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                TEAL: QUR'AN
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                VIOLET: QIYAM
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                AMBER: WARNING
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                RUBY: ACCOUNTABILITY
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
