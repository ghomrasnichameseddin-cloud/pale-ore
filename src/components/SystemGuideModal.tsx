import React, { useState } from 'react';
import { 
  BookOpen, Activity, Swords, Target, Briefcase, Award, Sparkles, 
  ShoppingBag, Settings, Compass, X, HelpCircle, Cpu,
  Zap, Timer, Coins, ArrowRight, GitFork,
  Shield, ShieldAlert, AlertTriangle, RotateCcw, CheckCircle2, Flame, Trophy, Scale, Heart, Lock, Scroll, Moon,
  FolderTree, FileText, Search, BarChart3, Split, Lightbulb, CheckSquare, Layers, Clock, RefreshCw, ChevronRight,
  Hourglass, FileSpreadsheet, Palette, Volume2, ArrowUpRight, Play, Database, Sliders, BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';
import { RubElHizbIcon, GeometricDivider } from './IslamicRpgDecorations';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  initialSection?: string;
}

export function SystemGuideModal({ isOpen, onClose, onNavigateTab, initialSection }: SystemGuideModalProps) {
  const [activeSection, setActiveSection] = useState<string>(initialSection || 'getting-started');

  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection, isOpen]);

  if (!isOpen) return null;

  const sections = [
    {
      id: 'getting-started',
      title: '1. Architecture & RPG Loop',
      icon: BookOpen,
      badge: 'ESSENTIAL',
      color: 'text-[#e5c875]',
    },
    {
      id: 'ranks-levels',
      title: '2. Ranks & Levels Hierarchy',
      icon: Trophy,
      badge: 'RANKS & TIERS',
      color: 'text-amber-400',
    },
    {
      id: 'core-attributes',
      title: '3. Attributes & Math Engine',
      icon: Cpu,
      badge: 'MECHANICS',
      color: 'text-purple-400',
    },
    {
      id: 'operations',
      title: '4. Quest Categories & Recovery Engine',
      icon: Swords,
      badge: 'CATEGORIES & RECOVERY',
      color: 'text-emerald-400',
    },
    {
      id: 'strategy',
      title: '5. Destinies, Campaigns & Milestones',
      icon: Target,
      badge: 'STRATEGY',
      color: 'text-[#c5a059]',
    },
    {
      id: 'strategic-models',
      title: '6. Codex & Thinking Lab',
      icon: Compass,
      badge: 'INTELLIGENCE',
      color: 'text-cyan-400',
    },
    {
      id: 'mastery',
      title: '7. Skills Tree & Class Jobs',
      icon: Award,
      badge: 'PROGRESSION',
      color: 'text-amber-300',
    },
    {
      id: 'spiritual-tracker',
      title: '8. Sacred Protocol & Hijri Calendar',
      icon: Moon,
      badge: 'SACRED RITES',
      color: 'text-[#fef08a]',
    },
    {
      id: 'muhasabah',
      title: '9. Muhāsabah: Self-Accountability & Moral Friction',
      icon: Scale,
      badge: 'ACCOUNTABILITY',
      color: 'text-amber-400',
    },
    {
      id: 'shop-rewards',
      title: '10. Dual-Currency Vault & Temporal Capital',
      icon: Hourglass,
      badge: 'TIME AS CURRENCY',
      color: 'text-emerald-400',
    },
    {
      id: 'observatories',
      title: '11. Observatories: XP & Temporal Audit Ledgers',
      icon: FileSpreadsheet,
      badge: 'AUDIT LEDGERS',
      color: 'text-indigo-400',
    },
    {
      id: 'visual-system',
      title: '12. Visual Codex, Sound FX & Sanctum Engine',
      icon: Palette,
      badge: 'CUSTOMIZATION',
      color: 'text-rose-400',
    }
  ];

  const handleNavigate = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        dir="ltr"
        className="relative border border-[#c5a059]/50 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.2)] bg-gradient-to-b from-[#0e111a] via-[#090b10] to-[#07080c]"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#c5a059]/30 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#1c160a] via-[#0b0d13] to-[#1c160a] shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3a2e12]/80 border border-[#c5a059]/50 rounded-xl text-[#fef08a] shadow-[0_0_15px_rgba(197,160,89,0.25)]">
              <BookOpen className="h-6 w-6 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-[#fef08a] flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                <span>PALE ORE PROGRESSION OS — MASTER SYSTEM MANUAL</span>
              </h2>
              <p className="text-xs font-mono text-[#c5a059]/80">
                Comprehensive Operational Manual, Mathematical Equations & Execution Frameworks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-[#fef08a] hover:bg-[#3a2e12]/40 rounded-lg transition border border-transparent hover:border-[#c5a059]/30"
              title="Close Manual"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY GRID (SIDEBAR + CONTENT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[480px]">
          
          {/* GUIDE NAVIGATION SIDEBAR */}
          <div className="w-full md:w-64 bg-[#07080c]/95 border-b md:border-b-0 md:border-r border-[#c5a059]/20 p-3 space-y-1 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-mono text-[#c5a059]/70 font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
              <span>MANUAL SECTIONS</span>
            </div>

            {sections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#3a2e12] via-[#241c09] to-[#12141f] border border-[#c5a059] text-[#fef08a] font-bold shadow-[0_0_12px_rgba(197,160,89,0.2)]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181d29]/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${sec.color}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${
                    isActive ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40' : 'bg-[#0d1017] text-zinc-500 border border-white/5'
                  }`}>
                    {sec.badge}
                  </span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#c5a059]/10 mt-4 p-3 bg-gradient-to-br from-[#1b1509] to-[#0d0f17] border border-[#c5a059]/30 rounded-xl space-y-2">
              <div className="text-[10px] font-mono text-[#fef08a] font-bold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-[#c5a059]" />
                <span>SYS DATE CONTROLLER</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                You can test daily habit resets or midnight penalties by shifting the SYS DATE at top-left. Click SYNC TODAY anytime to restore real time.
              </p>
            </div>
          </div>

          {/* CONTENT DISPLAY AREA */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 font-sans leading-relaxed bg-[#0b0d13]/80">
            
            {/* 1. ARCHITECTURE & RPG LOOP */}
            {activeSection === 'getting-started' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#c5a059]/30 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-[#fef08a] flex items-center gap-2">
                    <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                    1. System Architecture & The RPG Progression Loop
                  </h3>
                  <p className="text-xs font-mono text-[#c5a059]/80 mt-1">
                    PALE ORE is an Islamic RPG Progression Operating System turning real-world goals, habits, and skill mastery into an imperial spiritual execution loop.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-gradient-to-br from-[#1b1509] to-[#0d0f17] border border-[#c5a059]/30 rounded-xl space-y-1.5 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
                    <span className="text-[#fef08a] font-bold text-[11px] block flex items-center gap-1.5">
                      <Swords className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span>⚡ DIRECTIVES</span>
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      Execute Quests, Boss Battles & Daily Habits to earn XP, Vault Dinars, and Attribute points.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gradient-to-br from-[#181324] to-[#0d0f17] border border-purple-500/30 rounded-xl space-y-1.5 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <span className="text-purple-300 font-bold text-[11px] block flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-purple-400" />
                      <span>🧬 ATTRIBUTES</span>
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      8 core stats grow dynamically through verified quest completions and focused skill deep work.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gradient-to-br from-[#0e1f18] to-[#0d0f17] border border-emerald-500/30 rounded-xl space-y-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-emerald-300 font-bold text-[11px] block flex items-center gap-1.5">
                      <Hourglass className="h-3.5 w-3.5 text-emerald-400" />
                      <span>⏳ TIME CURRENCY</span>
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      Deep work focus cycles harvest guilt-free rest minutes into your Leisure Bank to fund restorative passes.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gradient-to-br from-[#1c121e] to-[#0d0f17] border border-amber-500/30 rounded-xl space-y-1.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <span className="text-amber-300 font-bold text-[11px] block flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      <span>🏆 MASTERY</span>
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      Ascend imperial ranks, unlock class job perks, balance the Mizan scale, and customize your Visual Codex.
                    </p>
                  </div>
                </div>

                {/* NAVIGATION MAP */}
                <div className="space-y-3 pt-2 border-t border-[#c5a059]/20">
                  <h4 className="text-xs font-mono font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-2">
                    <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                    <span>Primary Sanctum Navigation Map:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    <div onClick={() => handleNavigate('dashboard')} className="p-3 bg-[#0d1017]/80 hover:bg-[#3a2e12]/40 border border-white/5 hover:border-[#c5a059]/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Activity className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#fef08a] block">Dashboard Sanctuary</span>
                        <span className="text-[11px] text-zinc-400">Daily summary, priority target, Temporal Capital HUD & 8-stat matrix.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('quests')} className="p-3 bg-[#0d1017]/80 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Swords className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-200 block">Quests & Directives</span>
                        <span className="text-[11px] text-zinc-400">Main/Side quests, daily habits, Calamity boss fights & Pomodoro focus timer.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('strategy_codex')} className="p-3 bg-[#0d1017]/80 hover:bg-[#3a2e12]/60 border border-white/5 hover:border-[#c5a059]/60 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <RubElHizbIcon className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#fef08a] block">Strategy & Codex Hub</span>
                        <span className="text-[11px] text-zinc-400">Grand Destinies, Campaigns, 10-Vault Codex, Thinking Lab & Closed Loop.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('goals')} className="p-3 bg-[#0d1017]/80 hover:bg-[#3a2e12]/40 border border-white/5 hover:border-[#c5a059]/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Target className="h-4 w-4 text-[#e5c875] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#fef08a] block">Goals & Mini-Goals</span>
                        <span className="text-[11px] text-zinc-400">Breakdown macro strategic vision into actionable mini-goals and milestones.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('projects')} className="p-3 bg-[#0d1017]/80 hover:bg-blue-950/40 border border-white/5 hover:border-blue-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Briefcase className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-cyan-200 block">Projects & Sub-Projects</span>
                        <span className="text-[11px] text-zinc-400">Hierarchical project work breakdown with milestones and status tracking.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('planning')} className="p-3 bg-[#0d1017]/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <FileText className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-cyan-300 block">Execution Planning</span>
                        <span className="text-[11px] text-zinc-400">Operational planning documents, battle maps & strategic sprints.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('frameworks')} className="p-3 bg-[#0d1017]/80 hover:bg-purple-950/40 border border-white/5 hover:border-purple-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Layers className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 block">Deep Work Frameworks</span>
                        <span className="text-[11px] text-zinc-400">Eisenhower prioritization matrix, Pomodoro flow & sprint matrices.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('spiritual')} className="p-3 bg-[#0d1017]/80 hover:bg-[#3a2e12]/60 border border-white/5 hover:border-[#c5a059]/60 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Moon className="h-4 w-4 text-[#fef08a] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#fef08a] block">Sacred Protocol & Hijri</span>
                        <span className="text-[11px] text-zinc-400">5 Daily Salaats (Masjid/Rawātib), Adhkār, Salawāt & Qiyām al-Layl.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('muhasabah')} className="p-3 bg-[#0d1017]/80 hover:bg-[#3a2e12]/60 border border-white/5 hover:border-[#c5a059]/60 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Scale className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block">Muhāsabah Chamber</span>
                        <span className="text-[11px] text-zinc-400">Self-accountability Mizan balance scale, slip logging & penance quests.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('skills')} className="p-3 bg-[#0d1017]/80 hover:bg-purple-950/40 border border-white/5 hover:border-purple-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Award className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 block">Skills Mastery & Jobs</span>
                        <span className="text-[11px] text-zinc-400">Level skill trees, practice disciplines & equip custom career job perks.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('shop')} className="p-3 bg-[#0d1017]/80 hover:bg-[#3a2e12]/40 border border-white/5 hover:border-[#c5a059]/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <ShoppingBag className="h-4 w-4 text-[#e5c875] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#fef08a] block">Dual-Currency Vault</span>
                        <span className="text-[11px] text-zinc-400">Exchange coins & banked leisure minutes for real-world rewards & rest passes.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('time_ledger')} className="p-3 bg-[#0d1017]/80 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Hourglass className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-300 block">Temporal Ledger & Rest</span>
                        <span className="text-[11px] text-zinc-400">Audit trail of temporal capital minted, invested & expended with CSV export.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('xp_history')} className="p-3 bg-[#0d1017]/80 hover:bg-indigo-950/40 border border-white/5 hover:border-indigo-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <FileSpreadsheet className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-300 block">XP Ledger & Audit</span>
                        <span className="text-[11px] text-zinc-400">Complete historical ledger of all gains, losses, sources & level deltas.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('appearance')} className="p-3 bg-[#0d1017]/80 hover:bg-rose-950/40 border border-white/5 hover:border-rose-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Palette className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-300 block">Visual Codex & Audio</span>
                        <span className="text-[11px] text-zinc-400">6 visual themes, UI density, arabesque filigree & Web Audio synth SFX.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('spiderweb')} className="p-3 bg-[#0d1017]/80 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <GitFork className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-cyan-300 block">Constellation Net</span>
                        <span className="text-[11px] text-zinc-400">Interactive neural relationship canvas mapping all operational nodes.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('analytics')} className="p-3 bg-[#0d1017]/80 hover:bg-blue-950/40 border border-white/5 hover:border-blue-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <BarChart3 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-300 block">Resonance Analytics</span>
                        <span className="text-[11px] text-zinc-400">Attribute radar charts, weekly output velocity & performance trends.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('system')} className="p-3 bg-[#0d1017]/80 hover:bg-zinc-800/50 border border-white/5 hover:border-zinc-500/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Settings className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-200 block">Sanctum Engine & Backups</span>
                        <span className="text-[11px] text-zinc-400">JSON export/import backups, disaster recovery & manual stat overrides.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RANKS & LEVELS HIERARCHY */}
            {activeSection === 'ranks-levels' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    2. System Ranks, Levels & Progression Scale
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Definitive reference for Hunter System Ranks, 7-Tier Career Jobs & Titles, Quest Threat levels, Skill proficiencies, and Power Seals.
                  </p>
                </div>

                {/* 1. OPERATOR SYSTEM RANKS (HUNTER SCALE) */}
                <div className="p-4 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-amber-300 uppercase flex items-center gap-2 text-xs">
                      <Shield className="h-4 w-4 text-amber-400" />
                      <span>1. OPERATOR SYSTEM RANKS (HUNTER SCALE)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                      SOLO_SCALE_VERIFIED
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Your global Operator Rank is determined dynamically by your <strong>System Level</strong>, calculated from cumulative XP earned across all directives and focus sessions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 font-mono text-[11px]">
                    {/* E-Rank */}
                    <div className="p-3 bg-zinc-950 border border-zinc-700/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300 font-bold">🔘 E-RANK</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Lvl 1–9</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Beginner / Initiate</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Foundation phase. Building core rituals, discipline, and early system competence.</p>
                    </div>

                    {/* D-Rank */}
                    <div className="p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold">🔷 D-RANK</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded">Lvl 10–24</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Developing Practitioner</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Consistent execution, emerging specialty skills, and stronger reliability under pressure.</p>
                    </div>

                    {/* C-Rank */}
                    <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300 font-bold">🟢 C-RANK</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">Lvl 25–39</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Skilled Practitioner</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Autonomous output across complex tasks and repeatable momentum in multiple domains.</p>
                    </div>

                    {/* B-Rank */}
                    <div className="p-3 bg-zinc-950 border border-purple-500/30 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 font-bold">🟣 B-RANK</span>
                        <span className="text-[9px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded">Lvl 40–59</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Advanced Specialist</div>
                      <p className="text-zinc-400 text-[10px] font-sans">High-velocity delivery, advanced skill mastery, and a refined strategic operating rhythm.</p>
                    </div>

                    {/* A-Rank */}
                    <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-bold">🟡 A-RANK</span>
                        <span className="text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded">Lvl 60–99</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Expert / Elite Practitioner</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Command-level execution with elite consistency, escalation control, and system-level mastery.</p>
                    </div>

                    {/* S-Rank */}
                    <div className="p-3 bg-zinc-950 border border-rose-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-400 font-bold">👑 S-RANK</span>
                        <span className="text-[9px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-bold">Lvl 100–149</span>
                      </div>
                      <div className="text-xs text-rose-200 font-sans font-semibold">Master Practitioner</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Transcendent mastery over craft, strategic execution, and sustained long-range growth.</p>
                    </div>

                    {/* S+-Rank */}
                    <div className="p-3 bg-zinc-950 border border-fuchsia-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-fuchsia-300 font-bold">✨ S+-RANK</span>
                        <span className="text-[9px] bg-fuchsia-950 text-fuchsia-300 px-2 py-0.5 rounded font-bold">Lvl 150–199</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Exceptional Master</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Rare operational excellence with elite command, precision, and influence at scale.</p>
                    </div>

                    {/* SS-Rank */}
                    <div className="p-3 bg-zinc-950 border border-indigo-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-300 font-bold">🌀 SS-RANK</span>
                        <span className="text-[9px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-bold">Lvl 200–299</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Distinguished Master</div>
                      <p className="text-zinc-400 text-[10px] font-sans">A benchmark tier that reflects outstanding mastery and broad system leverage.</p>
                    </div>

                    {/* SS+-Rank */}
                    <div className="p-3 bg-zinc-950 border border-yellow-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-300 font-bold">🌟 SS+-RANK</span>
                        <span className="text-[9px] bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded font-bold">Lvl 300–399</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Outstanding Master</div>
                      <p className="text-zinc-400 text-[10px] font-sans">An exceptional apex tier marking elite global-class operational dominance.</p>
                    </div>

                    {/* SSS-Rank */}
                    <div className="p-3 bg-zinc-950 border border-emerald-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300 font-bold">🏆 SSS-RANK</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">Lvl 400–499</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Legendary Practitioner</div>
                      <p className="text-zinc-400 text-[10px] font-sans">Mythic-tier mastery reserved for rare, legendary operational achievement.</p>
                    </div>

                    {/* SSS+-Rank */}
                    <div className="p-3 bg-zinc-950 border border-red-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-red-300 font-bold">👑 SSS+-RANK</span>
                        <span className="text-[9px] bg-red-950 text-red-300 px-2 py-0.5 rounded font-bold">Lvl 500+</span>
                      </div>
                      <div className="text-xs text-zinc-200 font-sans font-semibold">Pinnacle Practitioner</div>
                      <p className="text-zinc-400 text-[10px] font-sans">The apex of the Hunter-scale ladder: a true pinnacle operator in the Pale Ore system.</p>
                    </div>
                  </div>

                  {/* MATHEMATICAL LEVEL XP FORMULA */}
                  <div className="p-3 bg-zinc-950/80 border border-white/5 rounded-lg space-y-1 text-xs">
                    <div className="font-mono text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" /> EXACT SYSTEM LEVEL FORMULA:
                    </div>
                    <div className="p-2 bg-black/50 border border-white/5 rounded text-cyan-300 font-mono text-center text-xs">
                      XP Required to Advance from Level L to L+1 = <code>500 × L + 500</code> XP
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      (Level 1 requires 1,000 XP; Level 2 requires 1,500 XP; Level 3 requires 2,000 XP, scaling linearly).
                    </p>
                  </div>

                  {/* MANDATORY BOSS QUEST PROGRESSION GATE (INTERMEDIATE RANKS LEVEL 10+) */}
                  <div className="p-4 bg-gradient-to-r from-amber-950/40 via-red-950/30 to-zinc-950 border-2 border-amber-500/50 rounded-xl space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                      <div className="font-mono font-bold text-amber-300 uppercase flex items-center gap-2 text-xs">
                        <Swords className="h-4 w-4 text-amber-400" />
                        <span>MANDATORY BOSS QUEST PROGRESSION GATE (LEVEL 10+ / D-RANK FORWARD)</span>
                      </div>
                      <span className="text-[9px] font-mono bg-red-950 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                        PROGRESSION_LOCK_RULE
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                      Starting from the <strong>Intermediate System Ranks (Level 10 / D-Rank and above)</strong>, simply accumulating XP is no longer sufficient to advance in rank. The system enforces an ironclad progression gate:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                      <div className="p-3 bg-zinc-950/90 border border-amber-500/30 rounded-lg space-y-1">
                        <span className="text-amber-400 font-bold block text-[11px]">1. BOSS QUEST MANDATE</span>
                        <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">
                          To advance to Level 10 and each subsequent level, you <strong>MUST complete at least one Boss Quest</strong> (Difficulty: <em>Boss</em> or Type: <em>Boss</em>).
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-950/90 border border-red-500/30 rounded-lg space-y-1">
                        <span className="text-red-400 font-bold block text-[11px]">2. STUCK LEVEL PROGRESSION</span>
                        <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">
                          If your total XP qualifies you for a higher level but you haven't defeated the required number of Boss Quests, your level becomes <strong>CAPPED & STUCK</strong> at the gate.
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-950/90 border border-emerald-500/30 rounded-lg space-y-1">
                        <span className="text-emerald-400 font-bold block text-[11px]">3. UNBROKEN XP ACCUMULATION</span>
                        <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">
                          Your hard-earned XP is never discarded. Once the required Boss Quest is slain, your pending levels will immediately unlock and surge into effect!
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-black/60 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="text-zinc-300 text-[11px]">
                        <span className="text-amber-400 font-bold">Rule Formula:</span> Max Allowed Level = <code>9 + Completed Boss Quests Count</code> (When Raw Level ≥ 10).
                      </div>
                      <button 
                        onClick={() => handleNavigate('quests')}
                        className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded font-bold transition flex items-center gap-1"
                      >
                        VIEW BOSS DIRECTIVES →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. CAREER JOB & TITLE PROGRESSION (LEVELS 1 TO 7) */}
                <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-2 text-xs">
                      <Briefcase className="h-4 w-4 text-cyan-400" />
                      <span>2. CAREER JOB & TITLE PROGRESSION (LEVELS 1 TO 7)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
                      7-TIER_MASTERY_LADDER
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Equipped Job Classes (e.g. <em>Cyber Architect, Code Alchemist, Titan Enforcer</em>) and Honorific Titles (e.g. <em>Grand Architect, Iron Will</em>) scale from Level 1 to 7 as you fulfill their milestone requirements:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300 font-bold">Lvl 1</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Novice</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">Base perk unlocked upon initial class activation.</p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold">Lvl 2</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded">Apprentice</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">Early operational application & routine practice.</p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300 font-bold">Lvl 3</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">Specialist</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">Focused discipline & milestone sprint execution.</p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-blue-500/20 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-300 font-bold">Lvl 4</span>
                        <span className="text-[9px] bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded">Senior Operator</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">Deep immersion, long streaks & high output velocity.</p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-purple-500/20 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 font-bold">Lvl 5</span>
                        <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded">Master</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">Cross-functional competency across projects & goals.</p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-amber-500/20 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-bold">Lvl 6</span>
                        <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded">Grandmaster</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">Long-term operational excellence & sustained momentum.</p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-rose-500/30 rounded-lg space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-400 font-bold">Lvl 7</span>
                        <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-bold">Apex Legend (MAX)</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] font-sans">The absolute pinnacle level cap — flawless mastery and maximum perk multipliers.</p>
                    </div>
                  </div>
                </div>

                {/* 3. DIRECTIVE / QUEST THREAT & DIFFICULTY RANKS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-2.5">
                    <div className="font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5 text-xs">
                      <Swords className="h-4 w-4" /> 3. Directive Threat & Difficulty Tiers
                    </div>
                    <ul className="text-xs space-y-1.5 font-mono">
                      <li className="flex items-center justify-between p-1.5 bg-zinc-950 rounded border border-white/5">
                        <span className="text-zinc-300">🟢 Easy</span>
                        <span className="text-emerald-400 font-bold">+25 XP (Quick tasks, habit check-ins)</span>
                      </li>
                      <li className="flex items-center justify-between p-1.5 bg-zinc-950 rounded border border-white/5">
                        <span className="text-cyan-300">🔷 Normal</span>
                        <span className="text-cyan-400 font-bold">+50 XP (Standard deliverables)</span>
                      </li>
                      <li className="flex items-center justify-between p-1.5 bg-zinc-950 rounded border border-white/5">
                        <span className="text-purple-300">🟣 Hard</span>
                        <span className="text-purple-400 font-bold">+100 XP (High-focus sprints)</span>
                      </li>
                      <li className="flex items-center justify-between p-1.5 bg-zinc-950 rounded border border-amber-500/20">
                        <span className="text-amber-300">🔥 Boss Fight</span>
                        <span className="text-amber-400 font-bold">+250 XP + Luminescent Coins</span>
                      </li>
                    </ul>
                  </div>

                  {/* 4. SKILL PROFICIENCY & MASTERY LEVELS */}
                  <div className="p-4 bg-zinc-900/90 border border-pink-500/30 rounded-xl space-y-2.5">
                    <div className="font-mono font-bold text-pink-300 uppercase flex items-center gap-1.5 text-xs">
                      <Award className="h-4 w-4" /> 4. Skill Proficiency & Mastery (1 to 50+)
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Skills accumulate XP from practice sessions and linked quest completions:
                    </p>
                    <ul className="text-xs space-y-1 font-mono text-zinc-300">
                      <li>• <strong>Primary vs Secondary:</strong> Hierarchical skill tree parent-child links.</li>
                      <li>• <strong>Level Scale:</strong> Level 1 up to Level 50+.</li>
                      <li>• <strong>Domain Mastery %:</strong> Progresses from <code>0% → 100%</code>, where reaching <strong>Level 50</strong> marks complete domain mastery.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ATTRIBUTES & MATH ENGINE */}
            {activeSection === 'core-attributes' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-400" />
                    3. Attribute Matrix & Precision Mathematical Engine
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    How core stats are dynamically computed using baseline levels, quest completion evidence, and skill practice.
                  </p>
                </div>

                {/* EXACT MATHEMATICAL FORMULA BOX */}
                <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-3 font-mono">
                  <div className="text-xs font-bold text-purple-300 uppercase flex items-center justify-between">
                    <span>EXPLICIT ATTRIBUTE FORMULA</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">FORMULA_VERIFIED</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/10 rounded-lg text-center text-sm sm:text-base font-extrabold text-white">
                    <div>
                      <span className="text-amber-300">Total Level</span> = <span className="text-zinc-300">Base Baseline</span> + <span className="text-emerald-400">Earned Bonus</span> + <span className="text-purple-400">Class Boost</span>
                    </div>
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    Each attribute has a configurable base baseline (e.g. 10), plus earned bonus levels calculated from completed quest evidence and skill practice.
                  </p>
                </div>

                {/* 8 ATTRIBUTES DETAILED BREAKDOWN */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    The 8 Core Attributes & Progression Drivers:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-red-400 block font-mono">1. Strength</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Increases by completing Fitness skills, physical workouts, and Boss Quests.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-cyan-400 block font-mono">2. Focus</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Grows through completing Main Quests and logging Pomodoro focus sessions.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-blue-400 block font-mono">3. Knowledge</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Grows via Programming, Languages, and Chess skill practice.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-400 block font-mono">4. Discipline</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Driven by maintaining daily habits routines and side directive completions.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-amber-400 block font-mono">5. Agility</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Measures speed of quest resolution and rapid daily habit response.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-purple-400 block font-mono">6. Wisdom</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Grows by completing strategic vision Goals and executing SOP planning docs.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-pink-400 block font-mono">7. Social</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Driven by Writing, Communication, Business, and Cooking skills.</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-emerald-300 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-300 block font-mono">8. Faith</span>
                      <p className="text-zinc-400 text-[11px] font-sans">Grows through Qur'an study, language mastery, and spiritual habits.</p>
                    </div>
                  </div>
                </div>

                {/* DASHBOARD FILTER FEATURE */}
                <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> Interactive Dashboard Attribute Filter
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans">
                    Clicking any attribute card in the Dashboard matrix instantly filters your Quests Board to display only tasks that actively boost that stat!
                  </p>
                </div>
              </div>
            )}

            {/* 4. QUEST CATEGORIES & RECOVERY ENGINE */}
            {activeSection === 'operations' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Swords className="h-5 w-5 text-emerald-400" />
                    4. Directives Classification & System Recovery Mechanism
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Complete architectural specification of all 7 quest categories, difficulty multipliers, failure dynamics, and the automated Recovery Protocol.
                  </p>
                </div>

                {/* 1. ALL 7 QUEST CATEGORIES & FUNCTIONAL DIFFERENCES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      Quest Categories Taxonomy & Functional Differences:
                    </h4>
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                      7 CATEGORIES
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                    {/* MAIN */}
                    <div className="p-3.5 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-cyan-300 flex items-center gap-1.5">🏆 Main Quest (`Main`)</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">MANDATORY</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Core operational goals and primary daily deliverables. Direct drivers of Focus & Discipline stats.
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div>• <strong>Shop Lock:</strong> Required to unlock today's Reward Shop.</div>
                        <div>• <strong>Failure Consequence:</strong> Unchecked past midnight triggers Midnight Penalty & Recovery Protocol.</div>
                      </div>
                    </div>

                    {/* BOSS */}
                    <div className="p-3.5 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-amber-300 flex items-center gap-1.5">🔥 Boss Fight (`Boss`)</span>
                        <span className="text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">HIGH REWARD</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        High-difficulty, intensive major challenges or milestones requiring maximum focus and output.
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div>• <strong>Shop Lock:</strong> Required to unlock today's Reward Shop.</div>
                        <div>• <strong>Rewards & Penalties:</strong> Massive XP + Luminescent Coins on success; triggers Recovery Mode if missed.</div>
                      </div>
                    </div>

                    {/* HABIT */}
                    <div className="p-3.5 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-emerald-300 flex items-center gap-1.5">⚡ Scheduled Habit (`Habit`)</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">RECURRING</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Recurring daily or scheduled routines with streak counters to build long-term personal consistency.
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div>• <strong>Shop Lock:</strong> Scheduled habits for today are required for Reward Shop unlock.</div>
                        <div>• <strong>Lapse Consequence:</strong> Lapsing incurs standard penalty XP deduction &amp; generates a <code>Recovery Quest</code> (half XP, half time) to restore momentum.</div>
                      </div>
                    </div>

                    {/* PENALTY */}
                    <div className="p-3.5 bg-zinc-900/90 border border-rose-500/40 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-rose-300 flex items-center gap-1.5">⚠️ Penalty Directive (`Penalty`)</span>
                        <span className="text-[9px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">AUTO-GENERATED</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Created automatically when a Main or Boss quest is left unchecked past midnight or marked failed.
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div>• <strong>Half-Time Rule:</strong> Estimated duration is cut to <strong>50% (half)</strong> of the original quest time.</div>
                        <div>• <strong>Impact:</strong> Keeps Recovery Protocol active and locks the Reward Shop until cleared.</div>
                      </div>
                    </div>

                    {/* RECOVERY */}
                    <div className="p-3.5 bg-zinc-900/90 border border-amber-500/40 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-amber-300 flex items-center gap-1.5">🛡️ Recovery Quest (`Recovery`)</span>
                        <span className="text-[9px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">RESTORATIVE</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Specialized restorative directives assigned during Recovery Mode to help operators rebuild momentum safely.
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div>• <strong>Shop Lock:</strong> Mandatory to complete before the Reward Shop vault unlocks.</div>
                        <div>• <strong>View Isolation:</strong> Displayed alongside Penalty quests while standard quests are filtered out.</div>
                        <div>• <strong>Deactivation:</strong> Must be completed to restore momentum and deactivate Recovery Mode.</div>
                      </div>
                    </div>

                    {/* SIDE */}
                    <div className="p-3.5 bg-zinc-900/90 border border-white/10 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-zinc-200 flex items-center gap-1.5">🎯 Side Quest (`Side`)</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">TACTICAL</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Secondary supportive tasks, quick errands, or sub-deliverables to boost discipline and minor attributes.
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/5">
                        <div>• <strong>Penalty Exemption:</strong> Excluded from penalty XP deductions and penalty quest generation on lapse/failure.</div>
                        <div>• <strong>Shop Lock:</strong> Excluded from mandatory shop lock requirements.</div>
                        <div>• <strong>Rollover:</strong> Safe to carry over without triggering Recovery Mode.</div>
                      </div>
                    </div>

                    {/* OPTIONAL */}
                    <div className="p-3.5 bg-zinc-900/90 border border-white/10 rounded-xl space-y-1.5 md:col-span-2">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-purple-300 flex items-center gap-1.5">✨ Optional Quest (`Optional`)</span>
                        <span className="text-[9px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">FLEXIBLE</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Low-pressure bonus ideas, exploratory learning, or stretch goals. Zero deadline pressure or penalty. Remains accessible even during Recovery Mode to allow low-stress execution.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. THE RECOVERY MECHANISM PIPELINE */}
                <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="font-mono font-bold text-amber-300 uppercase flex items-center gap-2 text-xs">
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      <span>THE AUTOMATED RECOVERY PROTOCOL MECHANISM</span>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-950 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded uppercase">
                      SYSTEM_FAILSAFE_PIPELINE
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The Recovery Protocol is an automated fail-safe designed to prevent burnout, eliminate cognitive overwhelm, and force swift momentum restoration when tasks slip behind schedule:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-[11px]">
                    <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
                      <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        1. MIDNIGHT AUDIT
                      </div>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        When system date advances past midnight (`SYS_DATE`), active **Main**, **Boss**, or **Habit** quests left incomplete are marked as failed/overdue.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
                      <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        2. 50% TIME & XP RECOVERY
                      </div>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        For failed/lapsed <strong>Main</strong>, <strong>Habit</strong>, and <strong>Boss</strong> directives, the system applies the XP deduction and spawns a <code>🛡️ RECOVERY</code> quest with half the time (<code>origEstTime / 2</code>) and half the positive XP (<code>origXp / 2</code>) to rapidly restore operational velocity.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
                      <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        3. DIRECTIVE ISOLATION
                      </div>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        `recoveryMode` locks ON (`RECOVERING_OPERATOR`). Standard quests are hidden to remove overwhelm and focus strictly on Recovery items.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
                      <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        4. AUTO-DEACTIVATION
                      </div>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Completing all active Penalty and Recovery quests automatically turns off `recoveryMode` and restores full operational velocity.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DIFFICULTIES & ADVANCED CONTROLS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-emerald-400 block">Difficulties & XP Multipliers</span>
                    <ul className="text-zinc-400 text-[11px] space-y-1 font-sans">
                      <li>• <strong>Easy:</strong> +25 XP</li>
                      <li>• <strong>Normal:</strong> +50 XP</li>
                      <li>• <strong>Hard:</strong> +100 XP</li>
                      <li>• <strong>Boss:</strong> +250 XP + Luminescent Coins</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-cyan-400 block">Directive Tools (Split / Merge / Move)</span>
                    <ul className="text-zinc-400 text-[11px] space-y-1 font-sans">
                      <li>• <strong>✂️ Split:</strong> Divide large tasks into 2 smaller items.</li>
                      <li>• <strong>🔗 Merge:</strong> Combine small tasks into 1 unified quest.</li>
                      <li>• <strong>📦 Move:</strong> Reassign quest to a new Goal or Project.</li>
                    </ul>
                  </div>
                </div>

                {/* POMODORO FOCUS, FOCUS SHIELDS & TIME HARVESTING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                      <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                        <Timer className="h-4 w-4" /> Pomodoro Focus & Time Minting
                      </h4>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">
                        DEEP_WORK
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Launch full-screen Pomodoro focus overlays (25m, 45m, 60m), link deep work cycles directly to active directives for bonus XP, and toggle ambient audio.
                    </p>
                    <div className="p-2.5 bg-zinc-950/90 rounded-lg border border-emerald-500/30 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono font-bold text-emerald-300">
                        <span className="flex items-center gap-1"><Hourglass className="h-3.5 w-3.5" /> Temporal Harvest</span>
                        <span>+10m / 25m Sprint</span>
                      </div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Completing a verified focus sprint mints 10 minutes of guilt-free leisure credit directly into your <strong>Leisure Bank</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                      <h4 className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-purple-400" /> Focus Shields & Momentum Protection
                      </h4>
                      <span className="text-[9px] font-mono bg-purple-950 text-purple-400 border border-purple-500/40 px-1.5 py-0.5 rounded font-bold">
                        SHIELD_DEFENSE
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Focus Shields guard your active session from penalties when urgent interruptions occur. When a session is aborted with a shield active, a shield is consumed to protect streaks and attribute stability without triggering a penalty.
                    </p>
                    <div className="p-2.5 bg-zinc-950/90 rounded-lg border border-purple-500/30 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono font-bold text-purple-300">
                        <span>Shield Replenishment</span>
                        <span>Boss Drops / Vault Perks</span>
                      </div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Acquired by conquering Calamity Bosses, achieving perfect weekly habit consistency, or purchasing Divine Shields from the Vault.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CALAMITY BOSS BATTLES */}
                <div className="p-4 bg-gradient-to-r from-red-950/50 via-zinc-900/90 to-amber-950/50 border border-red-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                    <div className="font-mono font-bold text-red-300 uppercase flex items-center gap-2 text-xs">
                      <Flame className="h-4 w-4 text-red-400" />
                      <span>CALAMITY BOSS CONQUESTS & THE LEVEL 10+ BOSS GATE</span>
                    </div>
                    <span className="text-[9px] font-mono bg-red-950 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      COLOSSAL_THREAT
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Weekly Calamity Bosses (e.g. <em>The Procrastination Leviathan, Umbra Cognitive Fog, Inertia Titan</em>) manifest on the Dashboard with dynamic HP pools and elemental phases. Completing Hard, Boss, and Main directives inflicts real-time damage against the Calamity.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 bg-zinc-950/90 rounded border border-red-500/20">
                      <span className="text-red-400 font-bold block">1. Elemental Damage</span>
                      <span className="text-[10.5px] text-zinc-400 font-sans">Matching quest attributes (e.g. Focus vs. Cognitive Fog) deals critical multiplier damage.</span>
                    </div>
                    <div className="p-2.5 bg-zinc-950/90 rounded border border-amber-500/20">
                      <span className="text-amber-400 font-bold block">2. Phase Transitions</span>
                      <span className="text-[10.5px] text-zinc-400 font-sans">At 50% and 25% HP, the Boss triggers enrage phases requiring urgent priority task strikes.</span>
                    </div>
                    <div className="p-2.5 bg-zinc-950/90 rounded border border-emerald-500/20">
                      <span className="text-emerald-400 font-bold block">3. Level 10+ Gate</span>
                      <span className="text-[10.5px] text-zinc-400 font-sans">Advancing beyond Level 10 requires at least 1 Calamity Boss conquest, testing operational mastery.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. GRAND DESTINIES, CAMPAIGNS & MILESTONES */}
            {activeSection === 'strategy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#c5a059]/30 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-[#fef08a] flex items-center gap-2">
                      <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                      5. Grand Destinies, Campaigns & Milestones
                    </h3>
                    <span className="text-[10px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 px-2.5 py-0.5 rounded uppercase font-bold">
                      STRATEGIC_EXECUTION_CASCADE
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#c5a059]/80 mt-1">
                    Pale Ore's strategic command engine connecting high-level ambition to daily operational directives with zero loss of fidelity.
                  </p>
                </div>

                {/* 1. THE STRATEGIC CASCADE FORMULA */}
                <div className="p-4 bg-gradient-to-r from-[#1c160a] via-[#0e111a] to-[#1c160a] border border-[#c5a059]/40 rounded-2xl space-y-3 shadow-[0_0_20px_rgba(197,160,89,0.15)]">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <Layers className="h-4 w-4 text-[#c5a059]" />
                      <span>THE HIERARCHICAL STRATEGIC CASCADE</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 px-2 py-0.5 rounded">
                      CORE_DOCTRINE
                    </span>
                  </div>

                  <div className="p-3 bg-[#07080c]/90 border border-[#c5a059]/30 rounded-xl text-center font-mono text-xs text-[#fef08a] overflow-x-auto">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[11px] sm:text-xs">
                      <span className="px-2 py-1 bg-[#3a2e12] border border-[#c5a059]/50 rounded text-[#fef08a] font-bold">Grand Destiny</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span className="px-2 py-1 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-300 font-bold">Campaign</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span className="px-2 py-1 bg-purple-950 border border-purple-500/40 rounded text-purple-300 font-bold">Milestone</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span className="px-2 py-1 bg-emerald-950 border border-emerald-500/40 rounded text-emerald-300 font-bold">Tactical Quest</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
                      <span className="px-2 py-1 bg-amber-950 border border-amber-500/40 rounded text-amber-300 font-bold">Skill Mastery XP</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    <strong>The Anti-Distraction Principle:</strong> Daily effort is never spent on arbitrary tasks. Every quest completed feeds progress directly up the cascade to achieve lifetime destinies, level the 8 core attributes, and build lasting capability.
                  </p>
                </div>

                {/* 2. GRAND DESTINIES (4 HORIZONS) */}
                <div className="p-4 bg-zinc-900/80 border border-[#c5a059]/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <Target className="h-4 w-4 text-[#c5a059]" />
                      <span>GRAND DESTINIES — 4 MACRO TIME HORIZONS</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 px-2 py-0.5 rounded">
                      GOALS_HORIZONS
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Grand Destinies define your North Star achievements across structured temporal horizons. Each Destiny contains a concrete outcome, target deadline, linked skills/attributes, active campaigns, and auto-calculated progress bars:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#0d1017] border border-cyan-500/30 rounded-xl space-y-1">
                      <span className="text-cyan-300 font-bold block text-[11px]">⚡ 30-DAY SPRINT</span>
                      <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                        High-velocity execution bursts, immediate habit building, and intense monthly milestone breakthroughs.
                      </p>
                      <span className="text-[9px] text-cyan-400/80 block pt-1 border-t border-white/5">Cadence: Weekly Review</span>
                    </div>

                    <div className="p-3 bg-[#0d1017] border border-emerald-500/30 rounded-xl space-y-1">
                      <span className="text-emerald-300 font-bold block text-[11px]">🌱 QUARTERLY (Q1–Q4)</span>
                      <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                        90-day major strategic arcs, substantial skill rank promotions, and extensive campaign deliveries.
                      </p>
                      <span className="text-[9px] text-emerald-400/80 block pt-1 border-t border-white/5">Cadence: End of Quarter</span>
                    </div>

                    <div className="p-3 bg-[#0d1017] border border-amber-500/30 rounded-xl space-y-1">
                      <span className="text-amber-300 font-bold block text-[11px]">🏆 ANNUAL VISION</span>
                      <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                        Yearly transformation milestones, career evolution, character forging, and major life deliverables.
                      </p>
                      <span className="text-[9px] text-amber-400/80 block pt-1 border-t border-white/5">Cadence: Annual Audit</span>
                    </div>

                    <div className="p-3 bg-[#0d1017] border border-[#c5a059]/40 rounded-xl space-y-1">
                      <span className="text-[#fef08a] font-bold block text-[11px]">👑 LIFETIME DESTINY</span>
                      <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                        Core spiritual servitude, enduring family legacy, philosophical contributions, and ultimate life purpose.
                      </p>
                      <span className="text-[9px] text-[#c5a059]/80 block pt-1 border-t border-white/5">Cadence: Biannual Muhāsabah</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#07080c]/60 border border-white/5 rounded-xl space-y-1 text-xs">
                    <span className="font-mono font-bold text-[#c5a059] block uppercase text-[11px]">
                      Mini-Goals & Micro-Milestone Mathematical Progress:
                    </span>
                    <p className="text-zinc-300 font-sans text-[11px]">
                      Every Grand Destiny can be divided into concrete <strong>Mini-Goals</strong> with distinct target completion dates. Checking off a mini-goal automatically recalculates the parent goal's progress bar in real time:
                      <span className="font-mono text-[#fef08a] ml-1.5">Progress = (Completed Mini-Goals ÷ Total Mini-Goals) × 100%</span>.
                    </p>
                  </div>
                </div>

                {/* 3. CAMPAIGNS, SUB-PROJECTS & TIME BUDGETS */}
                <div className="p-4 bg-zinc-900/80 border border-blue-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-blue-300 uppercase flex items-center gap-2 text-xs">
                      <Briefcase className="h-4 w-4 text-blue-400" />
                      <span>CAMPAIGNS & SUB-PROJECTS — OPERATIONAL EXECUTION</span>
                    </div>
                    <span className="text-[9px] font-mono bg-blue-950 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                      PROJECT_CONTAINERS
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Campaigns transform abstract Grand Destinies into time-budgeted, deadline-bound projects. Each campaign manages deliverables, sub-projects, milestones, dependencies, and operational health telemetry:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-[#0d1017] border border-emerald-500/40 rounded-xl space-y-1">
                      <span className="text-emerald-300 font-bold block text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> HEALTHY
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">
                        Task completion velocity matches or exceeds target deadline pacing. Zero critical blockers.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1017] border border-amber-500/40 rounded-xl space-y-1">
                      <span className="text-amber-300 font-bold block text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> AT RISK
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">
                        Pacing is lagging behind target milestones or deadline is within 7 days with &lt;50% completion.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1017] border border-rose-500/40 rounded-xl space-y-1">
                      <span className="text-rose-300 font-bold block text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5" /> BLOCKED
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">
                        Critical external dependency or severe technical hurdle halts forward progression.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0d1017] border border-cyan-500/40 rounded-xl space-y-1">
                      <span className="text-cyan-300 font-bold block text-[11px] flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5" /> COMPLETED
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">
                        All milestone deliverables verified, archived into the Codex, and granted victory rewards.
                      </p>
                    </div>
                  </div>

                  {/* SUB-PROJECTS & MILESTONE GATING */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-1.5">
                      <span className="font-mono font-bold text-cyan-300 text-xs block flex items-center gap-1.5">
                        <GitFork className="h-3.5 w-3.5 text-cyan-400" /> Sub-Projects & Time Budgets
                      </span>
                      <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                        Decompose large engineering or creative campaigns into distinct sub-projects with allocated focus hours, estimated Pomodoro sessions, and assigned skill categories.
                      </p>
                    </div>

                    <div className="p-3 bg-[#07080c] border border-white/10 rounded-xl space-y-1.5">
                      <span className="font-mono font-bold text-purple-300 text-xs block flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-purple-400" /> Phase Gating & Deliverables
                      </span>
                      <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
                        Structure campaign deliverables into sequential phases (e.g. <em>Specification → Prototyping → Execution → Polish</em>). Linking quests directly to a phase tracks completion percentage in real time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. STRATEGIC BOTTLENECK DIAGNOSTICS & GLOBAL SEARCH */}
                <div className="p-4 bg-gradient-to-br from-[#121624] to-[#0a0c14] border border-cyan-500/30 rounded-2xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                    <Search className="h-4 w-4 text-cyan-400" />
                    <span>STRATEGIC BOTTLENECK DIAGNOSTICS & GLOBAL INDEX SEARCH</span>
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The Strategy Overview indexes your entire knowledge base and execution queues. Filter by target horizon, locate stalled campaigns instantly, diagnose attribute imbalances across the 8-stat radar, and teleport directly to linked SOP documents or active quest lines.
                  </p>
                </div>

                {/* LIVE COMPATIBILITY CONTRACT */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/30 via-[#0b0d13] to-cyan-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      LIVE PLANNING CONTRACT
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-300 border border-emerald-500/30 rounded px-2 py-0.5">SYSTEM_ALIGNED</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Use the hub as a decision surface, not only as an archive. Choose the horizon, inspect the linked campaign, then create the next directive directly from the Destiny card with <strong className="text-cyan-300">+ DIRECTIVE</strong>. The new directive is linked to the Destiny and inherits its related skills.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-zinc-950/70 border border-white/5 rounded-lg"><strong className="text-[#fef08a] block">SHORT</strong><span className="text-zinc-400">30-Day Sprint → next directive</span></div>
                    <div className="p-2 bg-zinc-950/70 border border-white/5 rounded-lg"><strong className="text-emerald-300 block">MEDIUM</strong><span className="text-zinc-400">Quarterly → campaign and milestones</span></div>
                    <div className="p-2 bg-zinc-950/70 border border-white/5 rounded-lg"><strong className="text-cyan-300 block">LONG</strong><span className="text-zinc-400">Annual/Lifetime → doctrine and review</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. CODEX DOCTRINE & STRATEGIC THINKING LAB */}
            {activeSection === 'strategic-models' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#c5a059]/30 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-[#fef08a] flex items-center gap-2">
                      <Compass className="h-5 w-5 text-[#c5a059]" />
                      6. Codex Doctrine & Strategic Thinking Lab
                    </h3>
                    <span className="text-[10px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 px-2.5 py-0.5 rounded uppercase font-bold">
                      INTELLIGENCE_CENTER
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#c5a059]/80 mt-1">
                    Pale Ore's integrated knowledge base, Markdown SOP library, 11 mental model engines, and closed strategic feedback loop.
                  </p>
                </div>

                {/* 1. 10-FOLDER CODEX VAULT ARCHITECTURE */}
                <div className="p-4 bg-zinc-900/90 border border-[#c5a059]/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <FolderTree className="h-4 w-4 text-[#c5a059]" />
                      <span>THE 10-FOLDER STANDARDIZED CODEX ARCHITECTURE</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 px-2 py-0.5 rounded">
                      MARKDOWN_VAULT
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Every strategic insight, operational protocol, and historical debrief is codified into a structured 10-folder markdown knowledge base with full live preview and bidirectional relational linking:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-[#fef08a] font-bold block flex items-center gap-1.5">
                        <Scroll className="h-3.5 w-3.5 text-[#c5a059]" /> 00 Vision
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Core life philosophy, North Star objectives, guiding principles, and spiritual servitude charter.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-cyan-300 font-bold block flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-cyan-400" /> 01 Strategies
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Domain mastery doctrines across Engineering, Physical Health, Spiritual Purity & Wealth.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-blue-300 font-bold block flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-blue-400" /> 02 Master Plans
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">System architecture blueprints, multi-year roadmaps, and campaign master plans.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-purple-300 font-bold block flex items-center gap-1.5">
                        <Swords className="h-3.5 w-3.5 text-purple-400" /> 03 Tactical Playbooks
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Deep work execution runbooks, interview prep protocols, and examination blitz playbooks.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-emerald-500/30 rounded-xl space-y-1">
                      <span className="text-emerald-300 font-bold block flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-emerald-400" /> 04 Operations (Muhāsabah Archive)
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Daily operational logs, routines, and auto-archived <strong>Friday Weekly Muhāsabah Audits</strong>.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-amber-300 font-bold block flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-amber-400" /> 05 SOPs
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Standard Operating Procedures, checklist runbooks, morning/evening launch sequences.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-indigo-300 font-bold block flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-indigo-400" /> 06 Frameworks
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Custom mental models, analytical frameworks, and decision-tree guidelines.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-rose-300 font-bold block flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-rose-400" /> 07 Experiments
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Trial & Error laboratory logs: hypotheses, parameters, metrics, and empirical conclusions.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> 08 Lessons Learned
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Post-mortems, failure retrospectives, slip analyses, and victory debrief insights.</p>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] border border-white/10 rounded-xl space-y-1">
                      <span className="text-zinc-300 font-bold block flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-zinc-400" /> 09 Reviews & Archive
                      </span>
                      <p className="text-zinc-400 font-sans text-[10.5px]">Quarterly/annual strategic debriefs, legacy archives, and retired campaign scrolls.</p>
                    </div>
                  </div>
                </div>

                {/* 2. STRATEGIC THINKING LAB (11 ENGINES ACROSS 4 CATEGORIES) */}
                <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-2 text-xs">
                      <Cpu className="h-4 w-4 text-cyan-400" />
                      <span>STRATEGIC THINKING LAB — 11 INTERACTIVE ENGINES</span>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                      DECISION_ENGINES
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Interactive tactical modules designed to eliminate cognitive bias, resolve decision paralysis, and generate executable directives with a single click:
                  </p>

                  <div className="space-y-3">
                    {/* A. DECISION ENGINES */}
                    <div className="p-3 bg-[#0d1017] border border-cyan-500/20 rounded-xl space-y-2">
                      <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase block">
                        A. DECISION & PRIORITIZATION ENGINES
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">📊 Eisenhower Matrix</strong>
                          <span className="text-zinc-400">Classifies quests into Q1 (Urgent/Important), Q2 (Deep Work Sanctum), Q3 (Delegate/Streamline), and Q4 (Eliminate).</span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">⚡ Pareto 80/20 Analyzer</strong>
                          <span className="text-zinc-400">Isolates the vital 20% of high-leverage tasks driving 80% of total strategic outcomes.</span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">⚖️ Operational Heuristics</strong>
                          <span className="text-zinc-400">Applies battle-tested rules of thumb (Two-Minute Rule, Inversion Principle, Regret Minimization).</span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">🔄 OODA Loop Console</strong>
                          <span className="text-zinc-400">High-velocity tactical decision cycle (Observe → Orient → Decide → Act) with 1-click directive injection.</span>
                        </div>
                      </div>
                    </div>

                    {/* B. PROBLEM SOLVING ENGINES */}
                    <div className="p-3 bg-[#0d1017] border border-amber-500/20 rounded-xl space-y-2">
                      <span className="text-[11px] font-mono font-bold text-amber-300 uppercase block">
                        B. PROBLEM SOLVING & ROOT CAUSE ENGINES
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">🔍 Root Cause Analysis (5 Whys)</strong>
                          <span className="text-zinc-400">Drills through surface symptoms to expose root systemic vulnerabilities and create preventive SOPs.</span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">⏪ Work Backwards Mechanism</strong>
                          <span className="text-zinc-400">Starts at the final completed milestone/press release and reverse-engineers prerequisite phases.</span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">🛡️ SWOT Matrix Audit</strong>
                          <span className="text-zinc-400">Audits internal Strengths & Weaknesses against external Opportunities & Threats in a 4-quadrant grid.</span>
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-white/5 space-y-0.5">
                          <strong className="text-white block">🎯 SMART Goal Validator</strong>
                          <span className="text-zinc-400">Evaluates goal quality across Specific, Measurable, Achievable, Relevant, and Time-bound scoring criteria.</span>
                        </div>
                      </div>
                    </div>

                    {/* C & D. CREATIVE THINKING & EXPERIMENTATION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-[#0d1017] border border-purple-500/20 rounded-xl space-y-2">
                        <span className="text-[11px] font-mono font-bold text-purple-300 uppercase block">
                          C. CREATIVE THINKING
                        </span>
                        <div className="space-y-1.5 text-[11px]">
                          <div>• <strong>Brainstorming Sandbox:</strong> Rapid divergent ideation, tagging & prioritization.</div>
                          <div>• <strong>Lateral Thinking:</strong> Provocation & assumption-challenging to break mental ruts.</div>
                          <div>• <strong>Mind Mapping Graph:</strong> Visualizes cross-system nodes between skills, goals & projects.</div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0d1017] border border-emerald-500/20 rounded-xl space-y-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase block">
                          D. EXPERIMENTATION (TRIAL & ERROR)
                        </span>
                        <div className="space-y-1.5 text-[11px] text-zinc-400">
                          <div>• <strong>Scientific Method:</strong> State hypothesis, configure variables, track metrics.</div>
                          <div>• <strong>Empirical Validation:</strong> Measure success vs. baseline and promote winning protocols to <code>05 SOPs</code>.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-CLICK ACTIONABLE OUTPUTS */}
                  <div className="p-3 bg-[#07080c] border border-cyan-500/30 rounded-xl text-xs font-mono">
                    <span className="text-cyan-300 font-bold block mb-1">⚡ 1-CLICK ACTIONABLE SPAWNER:</span>
                    <p className="text-zinc-300 font-sans text-[11px]">
                      Every thinking tool can instantly export its conclusion as a <strong>Tactical Quest</strong>, <strong>Operational Campaign</strong>, <strong>Controlled Experiment</strong>, <strong>Standard SOP</strong>, or <strong>Codex Markdown Document</strong>.
                    </p>
                  </div>
                </div>

                {/* 3. THE CLOSED STRATEGIC LOOP */}
                <div className="p-4 bg-gradient-to-br from-[#1b1509] to-[#0a0c14] border border-[#c5a059]/40 rounded-2xl space-y-3 shadow-[0_0_20px_rgba(197,160,89,0.15)]">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <RefreshCw className="h-4 w-4 text-[#c5a059]" />
                      <span>THE CLOSED STRATEGIC LOOP & FRIDAY MUḤĀSABAH ARCHIVING</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/30 px-2 py-0.5 rounded">
                      CONTINUOUS_EVOLUTION
                    </span>
                  </div>

                  <div className="p-3 bg-[#07080c] border border-[#c5a059]/30 rounded-xl font-mono text-[11px] text-[#fef08a] text-center overflow-x-auto">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span>Goal</span> ➔ 
                      <span>Analyze</span> ➔ 
                      <span>Root Cause</span> ➔ 
                      <span>Solutions</span> ➔ 
                      <span>Strategy</span> ➔ 
                      <span className="text-emerald-400 font-bold">Execute</span> ➔ 
                      <span className="text-amber-400 font-bold">Measure</span> ➔ 
                      <span className="text-cyan-400 font-bold">Learn</span> ➔ 
                      <span className="text-purple-400 font-bold">Adapt</span> ➔ 
                      <span className="text-[#fef08a] font-bold">Repeat</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    <strong>Weekly Jumu'ah Bridge:</strong> Every Friday during the Muḥāsabah audit, the system calculates your <strong>10.0 Sacred Score</strong>, evaluates weekly campaign progress, extracts lessons learned, and permanently archives the summary markdown document under <code className="text-[#fef08a]">04 Operations/Weekly Muhasabah/Weekly Summary - YYYY-MM-DD.md</code>.
                  </p>

                  <div className="p-2.5 bg-black/40 border border-[#c5a059]/20 rounded-lg text-center font-mono text-xs text-[#c5a059]">
                    ✦ CORE OPERATING PRINCIPLE: <strong>THINK → PLAN → EXECUTE → MEASURE → LEARN → ADAPT</strong> ✦
                  </div>
                </div>
              </div>
            )}

            {/* 7. MASTERY, SEALS & ORES CLASSIFICATION */}
            {activeSection === 'mastery' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-pink-400" />
                    7. Skills Mastery & Class Titles
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Leveling skill competencies, logging practice sessions, and equipping custom class jobs and perks.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-pink-500/20 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-pink-400 uppercase block">1. Skills Tree</span>
                    <p className="text-zinc-300 font-sans">
                      Organize skills into Primary and Secondary parent-child trees. Practice logs grant skill XP and boost mastery.
                    </p>
                  </div>

                  {/* CLASS TITLES, JOBS & DYNAMIC PERK EVALUATOR ENGINE */}
                  <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-2 text-xs">
                        <Briefcase className="h-4 w-4 text-cyan-400" />
                        <span>3. CLASS TITLES, CUSTOM JOBS & DYNAMIC PERK EVALUATOR</span>
                      </div>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
                        PERK_ENGINE_PARSER
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Equip standard preset Job Classes or craft your own <strong>Custom Job Classes</strong> with custom perk text. The system features an intelligent <strong>Dynamic Perk Evaluator Engine</strong> that parses manually written perk descriptions into real operational multipliers:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                      <div className="p-2.5 bg-zinc-950 border border-cyan-500/20 rounded-lg space-y-1">
                        <span className="text-cyan-300 font-bold text-[10px] block">⚡ DIRECTIVE XP MULTIPLIERS (+X% XP)</span>
                        <p className="text-zinc-400 font-sans text-[10px]">
                          Parses targets like <code className="text-cyan-400">Main</code>, <code className="text-cyan-400">Skill</code>, <code className="text-cyan-400">Hard/Boss</code>, or <code className="text-cyan-400">Strength</code>. Converts phrases like <em>"+15% XP on Hard Directives"</em> into live quest rewards.
                        </p>
                      </div>

                      <div className="p-2.5 bg-zinc-950 border border-purple-500/20 rounded-lg space-y-1">
                        <span className="text-purple-300 font-bold text-[10px] block">🧘 FOCUS SESSION BOOSTS</span>
                        <p className="text-zinc-400 font-sans text-[10px]">
                          Detects focus keywords (e.g. <em>"+20% Focus Minutes XP Multiplier"</em>) to scale XP awarded during Pomodoro timer blocks.
                        </p>
                      </div>

                      <div className="p-2.5 bg-zinc-950 border border-amber-500/20 rounded-lg space-y-1">
                        <span className="text-amber-300 font-bold text-[10px] block">🪙 COIN & REWARD SCALING</span>
                        <p className="text-zinc-400 font-sans text-[10px]">
                          Detects coin keywords (e.g. <em>"+15% bonus coins earned"</em>) to amplify Luminescent Coin rewards upon completing directives.
                        </p>
                      </div>

                      <div className="p-2.5 bg-zinc-950 border border-rose-500/20 rounded-lg space-y-1">
                        <span className="text-rose-300 font-bold text-[10px] block">🛡️ PENALTY MITIGATION & MOMENTUM</span>
                        <p className="text-zinc-400 font-sans text-[10px]">
                          Detects penalty keywords (e.g. <em>"Reduces Fail Penalty Loss by 20%"</em>) and momentum keywords to reduce failed directive loss or boost momentum gains.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. SACRED PROTOCOL & HIJRI CALENDAR */}
            {activeSection === 'spiritual-tracker' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                      <Moon className="h-5 w-5 text-[#e5c875]" />
                      8. Sacred Protocol & Hijri Calendar Rites
                    </h3>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-bold uppercase">
                      DIVINE_FOUNDATION_OS
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    <em>"The first deed for which a servant of Allah will be held accountable on the Day of Judgment is prayer."</em> — Sunan an-Nasa'i. Deeply integrated 5 Salaats, congregation & sunnah bonuses, morning/evening remembrance, Salawāt counter, Qiyām al-Layl, and mathematical Hijri calendar synchronization.
                  </p>
                </div>

                {/* HIJRI CALENDAR BANNER */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#1b1509] via-[#0d0f17] to-[#0b0d13] border border-[#c5a059]/40 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                      <span>MATHEMATICAL HIJRI CALENDAR (UMM AL-QURA ALIGNMENT)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-bold uppercase">
                      SACRED_TIMING
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The Sacred Protocol calculates the authentic Islamic lunar date in real-time alongside the Gregorian system clock, tracking sacred months (<strong>Muharram, Rajab, Dhu al-Qi'dah, Dhu al-Hijjah</strong>) and highlighting blessed fasting rhythms such as the White Days (<strong>Ayyām al-Bīḍ</strong>, 13th–15th), Mondays, and Thursdays.
                  </p>
                </div>

                {/* THE 4 PILLARS OF SACRED PROTOCOL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* PILLAR 1: 5 SALAATS */}
                  <div className="p-4 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-amber-300 uppercase text-xs flex items-center gap-1.5">
                        🕌 1. The 5 Mandatory Salaats (الصَّلَوَاتُ الخَمْس)
                      </span>
                      <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        BEDROCK
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      The non-negotiable bedrock of daily discipline: <strong>Fajr, Dhuhr, Asr, Maghrib, and Isha</strong>.
                    </p>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 bg-zinc-950 rounded border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-200 font-bold">Base Prayer Completion</span>
                          <span className="text-emerald-400 font-bold">+50 to +100 XP / prayer</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Fulfilled on time; establishes daily divine anchoring.</p>
                      </div>

                      <div className="p-2.5 bg-zinc-950 rounded border border-cyan-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-300 font-bold">🕌 Masjid Congregation Bonus</span>
                          <span className="text-cyan-400 font-bold">+30 Bonus XP</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Prayed in congregation with the community at the masjid.</p>
                      </div>

                      <div className="p-2.5 bg-zinc-950 rounded border border-purple-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 font-bold">📿 Sunan Rawātib (الرواتب)</span>
                          <span className="text-purple-400 font-bold">+20 to +45 Bonus XP</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">
                          Completed alongside confirmed prophetic sunnah prayers (12 confirmed raka'āt daily). For <strong>Dhuhr</strong>, the system tracks <strong>Sunnah Before (السُّنَّة القَبْلِيَّة - 4 Rak'ahs 2+2, +25 XP)</strong> and <strong>Sunnah After (السُّنَّة البَعْدِيَّة - 2 Rak'ahs, +20 XP)</strong> independently.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 2: ADHKĀR SABAH & MASAH */}
                  <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-emerald-300 uppercase text-xs flex items-center gap-1.5">
                        🌅 2. Adhkār al-Sabāh wal-Masā' (أَذْكَارُ الصَّبَاحِ وَالمَسَاءِ)
                      </span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        DIVINE SHIELD
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Sacred prophetic morning and evening protective fortresses against heedlessness and spiritual decline.
                    </p>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 bg-zinc-950 rounded border border-amber-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-bold">Morning Adhkār (Sabāh)</span>
                          <span className="text-amber-400 font-bold">+60 XP</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Recited between Fajr dawn and Sunrise to guard the day's intent.</p>
                      </div>

                      <div className="p-2.5 bg-zinc-950 rounded border border-indigo-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-indigo-300 font-bold">Evening Adhkār (Masā')</span>
                          <span className="text-indigo-400 font-bold">+60 XP</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Recited between Asr and Maghrib sunset to seal the night with serenity.</p>
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 3: 70+ SALAWAT */}
                  <div className="p-4 bg-zinc-900/90 border border-[#c5a059]/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-[#fef08a] uppercase text-xs flex items-center gap-1.5">
                        ✨ 3. Daily 70+ Salawāt upon Rasoulullah ﷺ
                      </span>
                      <span className="text-[9px] bg-[#3a2e12] text-[#fef08a] px-1.5 py-0.5 rounded font-mono font-bold">
                        70_TARGET
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      <em>"Whoever sends blessings upon me once, Allah will send blessings upon him tenfold."</em> (Muslim).
                    </p>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 bg-zinc-950 rounded border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-200 font-bold">Daily 70 Target Unlocked</span>
                          <span className="text-[#fef08a] font-bold">+75 XP</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Interactive 1-tap digital rosary with +1, +10, +33, and +100 fast increments.</p>
                      </div>
                      <div className="p-2.5 bg-zinc-950 rounded border border-emerald-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-300 font-bold">Spiritual Radiance Multiplier</span>
                          <span className="text-emerald-400 font-bold">Positive Balance</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Consistently fulfilling your daily 70 Salawāt infuses positive weight into your daily balance scale.</p>
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 4: QIYAM AL-LAYL */}
                  <div className="p-4 bg-zinc-900/90 border border-purple-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-purple-300 uppercase text-xs flex items-center gap-1.5">
                        🌙 4. Qiyām al-Layl & Tahajjud (قِيَامُ اللَّيْلِ)
                      </span>
                      <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        VIGIL
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Standing in the tranquil depths of the third portion of the night.
                    </p>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 bg-zinc-950 rounded border border-purple-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 font-bold">2 Mandatory Raka'āt (Base)</span>
                          <span className="text-purple-400 font-bold">+100 XP</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">The foundational baseline vigil requirement for Qiyām.</p>
                      </div>
                      <div className="p-2.5 bg-zinc-950 rounded border border-cyan-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-300 font-bold">Scalable Pair Bonuses</span>
                          <span className="text-cyan-400 font-bold">+30 XP / pair</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Each additional pair of raka'āt (4, 6, 8, 10+) stacks +30 bonus XP and amplifies positive practice XP.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINKAGE TO DAILY BALANCE SCALE & FAITH ATTRIBUTE */}
                <div className="p-4 bg-gradient-to-r from-[#141824] to-[#0b0d13] border border-[#c5a059]/40 rounded-xl space-y-3 font-mono text-xs">
                  <div className="text-xs font-bold text-[#fef08a] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-[#e5c875]" />
                      HOW SACRED PROTOCOL LINKS TO THE REST OF THE PROGRESSION SYSTEM:
                    </span>
                    <span className="text-[9px] bg-[#3a2e12] text-[#fef08a] px-2 py-0.5 rounded border border-[#c5a059]/40">
                      CROSS_SYSTEM_SYNCHRONY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 bg-zinc-950/90 rounded border border-white/5 space-y-1">
                      <span className="text-emerald-400 font-bold block text-[11px]">1. POSITIVE BALANCE WEIGHT</span>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Every checked prayer, bonus, dhikr, salat count, and qiyam raka'ah directly registers as positive progress on the emerald scale pan.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950/90 rounded border border-white/5 space-y-1">
                      <span className="text-purple-400 font-bold block text-[11px]">2. FAITH ATTRIBUTE GROWTH</span>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Consistent daily spiritual completions directly drive the growth of your <strong>Faith (الإِيمَان)</strong> attribute stat and overall character momentum.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950/90 rounded border border-white/5 space-y-1">
                      <span className="text-cyan-400 font-bold block text-[11px]">3. MORAL FRICTION DEFENSE</span>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Robust spiritual habits safeguard your momentum against unexpected slip penalties, preventing your daily balance from tilting into severe deficit.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={() => handleNavigate('spiritual')}
                      className="px-3.5 py-1.5 bg-[#3a2e12] hover:bg-[#524017] text-[#fef08a] border border-[#c5a059]/60 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>OPEN SACRED PROTOCOL & HIJRI TERMINAL</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. MUHASABAH (SELF-ACCOUNTABILITY) */}
            {activeSection === 'muhasabah' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                      <Scale className="h-5 w-5 text-amber-400" />
                      9. Muhāsabah & Daily Balance Scale: Self-Accountability & High-Stakes Restitution
                    </h3>
                    <span className="text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      ACCOUNTABILITY_SYSTEM
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    <em>"Evaluate yourselves before you are evaluated, and weigh your deeds before they are weighed for you."</em> — Umar ibn al-Khattāb (RA). Realistic moral friction, live dynamic deed scales, coin fines, momentum loss, shop lockdowns, and Kaffārah penances.
                  </p>
                </div>

                {/* THE DAILY BALANCE SCALE EXPLANATION */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#1b1509] via-[#0d0f17] to-[#0b0d13] border border-[#c5a059]/40 rounded-xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2.5">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                      <span>DAILY BALANCE SCALE (LIVE DEED BALANCE & DYNAMIC PHYSICS ENGINE)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-bold uppercase">
                      EQUILIBRIUM_ENGINE_V2
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The <strong>Daily Balance Scale</strong> visually simulates the personal accountability balance between your completed positive habits & duties and your self-audited lapses. The crossbeam dynamically pivots in real-time on its fulcrum based on your <strong>Daily Net XP</strong> (Earned XP &minus; Lost XP).
                  </p>

                  {/* TWO PANS BREAKDOWN: WHAT AFFECTS EACH SIDE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    {/* LEFT PAN */}
                    <div className="p-3.5 bg-zinc-950/90 border border-emerald-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-mono font-bold border-b border-emerald-500/20 pb-1.5">
                        <span className="text-emerald-300 flex items-center gap-1.5">
                          ✨ LEFT PAN: POSITIVE DEEDS (+XP)
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">POSITIVE HABITS</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        Positive XP earned under today's system date adds physical downward weight to the emerald pan:
                      </p>
                      <ul className="text-[10.5px] space-y-1 font-mono text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">✦</span>
                          <span><strong>Sacred Protocol Rites:</strong> 5 Salaats (+50–100 XP), Masjid (+30 XP), Sunan Rawātib (+20 XP), Morning/Evening Adhkār (+60 XP), 70 Salawāt (+75 XP), and Qiyām (+100 XP + bonuses).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">✦</span>
                          <span><strong>Directive Completions:</strong> Main Quests (+100–200 XP), Habits (+50–100 XP), Side Quests & Boss Battles (+250–500 XP).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">✦</span>
                          <span><strong>Deep Work & Focus Sessions:</strong> Each completed 25-min Pomodoro block awards +15 to +25 XP directly to today's ledger.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">✦</span>
                          <span><strong>Kaffārah Restitution:</strong> Fulfilling a corrective penance returns +10% to +30% recovered XP.</span>
                        </li>
                      </ul>
                    </div>

                    {/* RIGHT PAN */}
                    <div className="p-3.5 bg-zinc-950/90 border border-rose-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-mono font-bold border-b border-rose-500/20 pb-1.5">
                        <span className="text-rose-300 flex items-center gap-1.5">
                          🛑 RIGHT PAN: AUDITED SLIPS (−XP)
                        </span>
                        <span className="text-[9px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded">FRICTION & LAPSES</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        Any audited moral slip or behavioral relapse recorded in Muhāsabah adds weight to the ruby pan:
                      </p>
                      <ul className="text-[10.5px] space-y-1 font-mono text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Minor Slips (اللَّمَم):</strong> −150 XP (fleeting distractions, brief procrastination, idle chatter).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Moderate Lapses (الغَفْلَة):</strong> −300 XP (doomscrolling feeds, broken promises, skipping workouts).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Major Breaches (الكَبَائِر):</strong> −500 XP (delayed/missed Fajr or prayers, giving in to desires/triggers).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Critical Failures (الجُرْم):</strong> −1000 XP (severe relapse, complete breakdown of daily discipline).</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl space-y-2">
                    <div className="font-mono font-bold text-rose-300 uppercase flex items-center gap-2 text-xs">
                      <Heart className="h-4 w-4 text-rose-400" /> SOUL VITALITY / HP RECOVERY LOOP
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      HP is an in-app recovery signal, not a measure of faith or divine judgment. Every level raises maximum Soul Vitality by <strong className="text-rose-300">+5 HP</strong>: <code>Max HP = 100 + 5 × (Level − 1)</code>. A level-up also restores the new capacity increment.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="p-2 bg-black/30 rounded border border-rose-500/20"><strong className="text-rose-300 block">LOSS</strong><span className="text-zinc-400">Muhāsabah severity and recurrence deduct HP.</span></div>
                      <div className="p-2 bg-black/30 rounded border border-emerald-500/20"><strong className="text-emerald-300 block">RESTORE</strong><span className="text-zinc-400">Complete the linked Kaffārah quest for +35 HP.</span></div>
                      <div className="p-2 bg-black/30 rounded border border-cyan-500/20"><strong className="text-cyan-300 block">PROGRESS</strong><span className="text-zinc-400">Ordinary completed directives restore +2 HP; level-ups add capacity.</span></div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">At 0 HP, recovery mode activates. The practical route back is restitution, then consistent completion.</p>
                  </div>

                  {/* 5 EQUILIBRIUM TIERS & TILT ANGLES */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-white uppercase">
                      <span>THE 5 DYNAMIC EQUILIBRIUM TIERS & TILT PHYSICS:</span>
                      <span className="text-[10px] text-[#c5a059]">RANGE: −18° TO +18°</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
                      <div className="p-3 bg-zinc-950/80 border border-emerald-500/30 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-300 font-bold">🌟 Radiant Balance</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Net ≥ +250 XP</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px]">Left pan drops to maximum +18° tilt. Peak spiritual radiance & active momentum multiplier.</p>
                      </div>

                      <div className="p-3 bg-zinc-950/80 border border-amber-500/30 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-bold">🛡️ Blessed Equilibrium</span>
                          <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-bold">Net &gt; 0 XP</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px]">Gentle positive tilt. Righteous deeds lead the day; spiritual momentum protected.</p>
                      </div>

                      <div className="p-3 bg-zinc-950/80 border border-zinc-700/50 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300 font-bold">⚖️ Neutral Ground</span>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">Net = 0 XP</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px]">Beam rests perfectly level at 0°. Awaiting today's first directives and actions.</p>
                      </div>

                      <div className="p-3 bg-zinc-950/80 border border-rose-500/30 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-rose-300 font-bold">⚠️ Spiritual Deficit</span>
                          <span className="text-[9px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded font-bold">0 to −200 XP</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px]">Right pan sinks down. Deficit warning badge active; Kaffārah penances recommended.</p>
                      </div>

                      <div className="p-3 bg-zinc-950/80 border border-rose-600/50 rounded-lg space-y-1 sm:col-span-2 lg:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-red-400 font-bold">🔥 Severe Nafs Warning</span>
                          <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded font-bold">Net &lt; −200 XP</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px]">Heavy −18° right tilt. High spiritual deficit detected; immediate sincere repentance, Tawbah, and disciplined recovery required.</p>
                      </div>
                    </div>
                  </div>

                  {/* RECALIBRATE & SYNC UTILITY */}
                  <div className="p-3 bg-zinc-950/80 border border-[#c5a059]/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[#fef08a] font-bold flex items-center gap-1.5 text-[11px]">
                        ⚖️ RECALIBRATE & SYSTEM SYNC FEATURE
                      </span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        Clicking <strong>RECALIBRATE</strong> on the scale or Sacred Ledger re-synchronizes scale weights, verifies date alignment, audits Kaffārah restitution quests, and logs an equilibrium audit message in your System Inbox.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3-TAP ZEN TRIAGE WORKFLOW */}
                <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-2 text-xs">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <span>THE 3-TAP ZEN TRIAGE AUDIT FLOW</span>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
                      FRICTIONLESS_ACCOUNTABILITY
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Recording a slip should be an act of quiet clarity, not tedious typing. The 3-Tap Zen Triage flow allows you to complete an honest self-audit in less than 5 seconds:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-lg space-y-1.5">
                      <span className="text-amber-400 font-bold block text-[11px]">TAP 1: SELECT SLIP PRESET</span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        Choose from 1-tap quick presets (e.g. <em>Fajr Delay</em>, <em>Feed Doomscrolling</em>, <em>Harsh Tongue</em>, <em>Gaze Slip</em>, <em>Arrogance</em>, <em>Neglected Promise</em>) or input custom details.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-rose-500/30 rounded-lg space-y-1.5">
                      <span className="text-rose-400 font-bold block text-[11px]">TAP 2: WEIGH SEVERITY (WAZN)</span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        Select severity (Minor, Moderate, Major, Severe, Critical). View live consequence preview: XP deduction, Coin fine, and Momentum reset.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-lg space-y-1.5">
                      <span className="text-emerald-400 font-bold block text-[11px]">TAP 3: COMMIT KAFFĀRAH</span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        System auto-calibrates a tangible sacred penance deed (Tawbah prayer, Quran recitation, charity, or deep focus) that pins to your active quests.
                      </p>
                    </div>
                  </div>
                </div>

                {/* THE 6 SELF-ACCOUNTABILITY CATEGORIES (REALMS) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-400" />
                      The 6 Self-Examination Categories (Realms):
                    </h4>
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                      6 SPHERES OF ACCOUNTABILITY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {/* Obligations */}
                    <div className="p-3.5 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-emerald-300 flex items-center gap-1.5">🕌 Obligations</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">CORE DUTIES</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Fard acts, missed or delayed prayers (Fajr on time), neglected core duties, breaking foundational promises or spiritual covenants.
                      </p>
                    </div>

                    {/* Desires */}
                    <div className="p-3.5 bg-zinc-900/90 border border-rose-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-rose-300 flex items-center gap-1.5">🔥 Desires</span>
                        <span className="text-[9px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded">APPETITES</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Giving into unchecked impulses, impulse shopping, unshielded gaze, sensory overindulgence, junk consumption, or breaking personal fasting standards.
                      </p>
                    </div>

                    {/* Speech */}
                    <div className="p-3.5 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-cyan-300 flex items-center gap-1.5">🗣️ Speech</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded">TONGUE</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Idle talk, backbiting (gheebah), sarcasm, arguing for ego, harsh tone with family, complaining, or conversational exaggeration.
                      </p>
                    </div>

                    {/* Heart */}
                    <div className="p-3.5 bg-zinc-900/90 border border-purple-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-purple-300 flex items-center gap-1.5">🖤 Heart</span>
                        <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded">INTERNAL</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Envy (hasad), arrogance (kibr), ostentation/seeking human praise (riya'), ingratitude, despair, or harboring hidden malice.
                      </p>
                    </div>

                    {/* Rights */}
                    <div className="p-3.5 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-amber-300 flex items-center gap-1.5">🤝 Rights</span>
                        <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded">JUSTICE</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Neglecting rights of parents, spouse, children, neighbors, or team members; unpaid debts, broken trust, or unfulfilled promises.
                      </p>
                    </div>

                    {/* Wasted Potential */}
                    <div className="p-3.5 bg-zinc-900/90 border border-yellow-500/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-yellow-300 flex items-center gap-1.5">⏳ Wasted Potential</span>
                        <span className="text-[9px] bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded">TIME LOSS</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Mindless algorithmic feed scrolling, doomscrolling, procrastination, aimless drift, delaying high-leverage work for cheap dopamine.
                      </p>
                    </div>
                  </div>
                </div>

                {/* HIGH-STAKES CONSEQUENCE MATRIX */}
                <div className="p-4 bg-zinc-900/90 border border-rose-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-rose-300 uppercase flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>THE HIGH-STAKES CONSEQUENCE MATRIX</span>
                    </div>
                    <span className="text-[9px] font-mono bg-rose-950 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                      XP_FINES_LOCKS
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    To prevent accountability from feeling like abstract roleplay, slips carry multi-dimensional tangible consequences that demand active correction:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-400 text-[11px]">
                          <th className="py-2 pr-3">Severity</th>
                          <th className="py-2 pr-3">XP Penalty</th>
                          <th className="py-2 pr-3">Coin Fine (Sadaqah)</th>
                          <th className="py-2 pr-3">Momentum Impact</th>
                          <th className="py-2 pr-3">Shop Lockdown</th>
                          <th className="py-2">Restitution XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="py-2 pr-3 text-blue-300 font-bold">Minor Slip</td>
                          <td className="py-2 pr-3 text-rose-400">−100 XP</td>
                          <td className="py-2 pr-3 text-amber-400">−10 Coins</td>
                          <td className="py-2 pr-3 text-zinc-300">−15%</td>
                          <td className="py-2 pr-3 text-zinc-500">No</td>
                          <td className="py-2 text-emerald-400">+25–35 XP</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 text-amber-300 font-bold">Moderate Lapse</td>
                          <td className="py-2 pr-3 text-rose-400">−200 XP</td>
                          <td className="py-2 pr-3 text-amber-400">−25 Coins</td>
                          <td className="py-2 pr-3 text-zinc-300">−35%</td>
                          <td className="py-2 pr-3 text-zinc-500">No</td>
                          <td className="py-2 text-emerald-400">+40–50 XP</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 text-orange-300 font-bold">Major Breach</td>
                          <td className="py-2 pr-3 text-rose-400 font-bold">−300 XP</td>
                          <td className="py-2 pr-3 text-amber-400 font-bold">−50 Coins</td>
                          <td className="py-2 pr-3 text-rose-400 font-bold">Reset to 0%</td>
                          <td className="py-2 pr-3 text-rose-300 font-bold">🔒 LOCKED</td>
                          <td className="py-2 text-emerald-400">+50–60 XP</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 text-purple-300 font-bold">Severe Violation</td>
                          <td className="py-2 pr-3 text-rose-400 font-bold">−400 XP</td>
                          <td className="py-2 pr-3 text-amber-400 font-bold">−100 Coins</td>
                          <td className="py-2 pr-3 text-rose-400 font-bold">Reset to 0%</td>
                          <td className="py-2 pr-3 text-rose-300 font-bold">🔒 LOCKED</td>
                          <td className="py-2 text-emerald-400">+60 XP</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 text-red-400 font-black">Critical Failure</td>
                          <td className="py-2 pr-3 text-red-400 font-black">−500 XP</td>
                          <td className="py-2 pr-3 text-amber-400 font-black">−200 Coins</td>
                          <td className="py-2 pr-3 text-rose-400 font-bold">Reset to 0%</td>
                          <td className="py-2 pr-3 text-rose-300 font-bold">🔒 LOCKED</td>
                          <td className="py-2 text-emerald-400">+75 XP</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SACRED KAFFĀRAH RESTITUTION & SPIRITUAL SHOP LOCK */}
                <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5 text-xs">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      <span>KAFFĀRAH RESTITUTION & SPIRITUAL REWARD LOCK</span>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                      PENANCE_LIFT_ENGINE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-zinc-300">
                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <strong className="text-amber-300 font-mono block text-[11px]">🔒 Reward Shop Lockdown Mechanism</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Whenever an active Kaffārah penance quest exists in your log, the <strong>Luminescent Reward Shop</strong> automatically engages a spiritual safety lock. You cannot purchase luxury rewards or leisure privileges while moral restitution remains pending.
                      </p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <strong className="text-emerald-300 font-mono block text-[11px]">🌿 1-Click Kaffārah Fulfillment & Shop Unlocking</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Once you perform your penance (e.g. 2 Rak'ahs of Tawbah, 100x Istighfar, deep focus sprint, or charity donation), fulfill the directive in your active queue to restore spiritual equilibrium, regain restitution XP, boost momentum by +15%, and immediately lift all shop locks.
                      </p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <strong className="text-cyan-300 font-mono block text-[11px]">🛡️ Full Audit Accounting & 0 XP Balance Floor</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Every non-exempt Muhāsabah audit is logged in full severity (e.g. Critical slips deduct −500 XP and −200 Coins each). Total player XP is safeguarded with a strict <code>0 XP</code> floor to prevent negative balances.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DASHBOARD AUDIT WIDGET QUICK ACCESS */}
                <div className="p-4 bg-[#141824] border border-[#c5a059]/40 rounded-xl space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-[#e5c875]" />
                      <span>DASHBOARD INTEGRATION & DAILY BALANCE ACCESS</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      Access the Daily Balance Scale, rapid 1-tap realm triage, active Kaffārah restitution queue, and the chronological slip ledger anytime in the Muhāsabah chamber.
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigate('muhasabah')}
                    className="px-3.5 py-1.5 bg-[#3a2e12] hover:bg-[#524017] text-[#fef08a] border border-[#c5a059]/60 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>OPEN MUHĀSABAH CHAMBER</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 10. DUAL-CURRENCY VAULT & TEMPORAL CAPITAL */}
            {activeSection === 'shop-rewards' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#c5a059]/30 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-[#fef08a] flex items-center gap-2">
                      <Hourglass className="h-5 w-5 text-emerald-400" />
                      10. Dual-Currency Vault & Temporal Capital Engine
                    </h3>
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      TIME_AS_CURRENCY_V2
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    <em>"Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before you are preoccupied, and your life before your death."</em> — Al-Hakim. Converting deep work focus into guilt-free restorative passes, managing daily waking capital, and unlocking the dual-currency imperial treasury.
                  </p>
                </div>

                {/* THE CORE PHILOSOPHY OF TEMPORAL CAPITAL */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#0c1a14] via-[#0d1017] to-[#0a140f] border border-emerald-500/40 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="font-mono font-bold text-emerald-300 uppercase flex items-center gap-2 text-xs">
                      <RubElHizbIcon className="h-4 w-4 text-emerald-400" />
                      <span>THE PHILOSOPHY OF TEMPORAL CAPITAL (TIME AS AMĀNAH)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      SACRED_TRUST
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Time is an unrecoverable divine trust (<em>Amānah</em>). In Pale Ore, leisure is never treated as accidental escapism, mindless procrastination, or a guilty indulgence. Instead, leisure is elevated to an <strong>earned, mathematically budgeted currency</strong>. By anchoring rest to verified deep work output, the system eliminates cognitive guilt and replaces burnout cycles with deliberate restoration.
                  </p>
                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <span>👑 CORE OPERATIONAL CREED:</span>
                    <span className="text-zinc-300 font-sans italic">"Earn your leisure through deep focus; redeem your rest without moral friction."</span>
                  </div>
                </div>

                {/* DUAL-CURRENCY IMPERIAL TREASURY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-amber-300 uppercase text-xs flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-amber-400" /> 1. Vault Dinars (Gold Coins)
                      </span>
                      <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        TREASURY
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Tangible reward credits earned by completing directives, maintaining daily habit streaks, and triumphing in Calamity Boss battles.
                    </p>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Quest Completions:</span>
                        <span className="text-amber-400 font-bold">+10 to +100 Coins</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Calamity Boss Slaying:</span>
                        <span className="text-amber-400 font-bold">+250 to +500 Coins</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Used For:</span>
                        <span className="text-amber-300 font-bold">Custom Treats & Perks</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-emerald-300 uppercase text-xs flex items-center gap-1.5">
                        <Hourglass className="h-4 w-4 text-emerald-400" /> 2. Leisure Bank (Temporal Capital)
                      </span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        MINUTES_BANK
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Restorative minutes minted exclusively through verified focus cycles and operational dividends.
                    </p>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Pomodoro 25m Focus Sprint:</span>
                        <span className="text-emerald-400 font-bold">+10m Leisure</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Hard Directive Completion:</span>
                        <span className="text-emerald-400 font-bold">+15m Rest Dividend</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Used For:</span>
                        <span className="text-emerald-300 font-bold">Active Rest Passes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DAILY WAKING CAPITAL HUD & OVERDRAFT ALARM */}
                <div className="p-4 bg-zinc-900/90 border border-[#c5a059]/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-1.5 text-xs">
                      <Clock className="h-4 w-4 text-[#c5a059]" />
                      <span>DAILY WAKING CAPITAL & 3-WAY TIME PARTITIONING</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-bold uppercase">
                      960_MIN_BUDGET
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The <strong>Temporal Capital HUD</strong> on the Dashboard monitors your daily waking capital (default 16 hours = 960 minutes) divided into three distinct operational partitions. The HUD is a planning estimate, while the Temporal Ledger is the audit record.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-cyan-500/30 space-y-1">
                      <div className="text-cyan-400 font-bold flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> 1. INVESTED TIME
                      </div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Minutes spent in active, completed Pomodoro sprints and verified deep work today.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/30 space-y-1">
                      <div className="text-amber-400 font-bold flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" /> 2. COMMITTED TIME
                      </div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Estimated duration of scheduled remaining quests, routines, and prayer obligations today.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-emerald-500/30 space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <Hourglass className="h-3.5 w-3.5" /> 3. UNCOMMITTED SLACK
                      </div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Free reserve buffer remaining for unplanned demands, cognitive recovery, and flexibility.
                      </p>
                    </div>
                  </div>

                  {/* OVERDRAFT ALARM PROTOCOL */}
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg space-y-1.5 text-xs">
                    <div className="font-mono font-bold text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span>THE OVERDRAFT ALARM STATE (BURNOUT MITIGATION)</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      If your <strong>Committed Time</strong> exceeds your total remaining waking hours, the HUD triggers the <strong className="text-red-300">OVERDRAFT WARNING</strong>. When this occurs, you are overbooked. The system advises an immediate workload restructuring: downgrade secondary tasks to Optional, move deadlines to tomorrow, or liquidate backlogged items to preserve mental stamina.
                    </p>
                  </div>
                </div>

                {/* TEMPORAL LEISURE WARES & ACTIVE REST OVERLAY */}
                <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>TEMPORAL REST WARES & THE ACTIVE REST OVERLAY CHAMBER</span>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      ACTIVE_RECOVERY
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Under the <strong>"Temporal Rest"</strong> tab in the Reward Shop, operators can redeem dual-cost leisure passes. Each pass consumes both Vault Dinars and banked Leisure Minutes:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 bg-zinc-950 rounded border border-emerald-500/20 space-y-1">
                      <div className="text-[#fef08a] font-bold">😴 Deep Qaylulah Nap</div>
                      <div className="text-[10px] text-zinc-400 font-sans">25 min power nap to restore cognitive acuity before Asr.</div>
                      <div className="text-emerald-400 text-[10.5px] font-bold">25m Rest • 15 Coins</div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-emerald-500/20 space-y-1">
                      <div className="text-[#fef08a] font-bold">📖 Guilt-Free Fiction Reading</div>
                      <div className="text-[10px] text-zinc-400 font-sans">45 min dedicated immersion in literature or contemplative reading.</div>
                      <div className="text-emerald-400 text-[10.5px] font-bold">45m Rest • 25 Coins</div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-emerald-500/20 space-y-1">
                      <div className="text-[#fef08a] font-bold">🎮 Leisure Gaming Sprint</div>
                      <div className="text-[10px] text-zinc-400 font-sans">60 min immersive gaming session earned through hard output.</div>
                      <div className="text-emerald-400 text-[10.5px] font-bold">60m Rest • 40 Coins</div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-emerald-500/20 space-y-1">
                      <div className="text-[#fef08a] font-bold">🌿 Contemplative Walk</div>
                      <div className="text-[10px] text-zinc-400 font-sans">30 min nature walk in outdoor air to reset dopamine baselines.</div>
                      <div className="text-emerald-400 text-[10.5px] font-bold">30m Rest • 20 Coins</div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-emerald-500/20 space-y-1">
                      <div className="text-[#fef08a] font-bold">🎬 Evening Cinema / Media</div>
                      <div className="text-[10px] text-zinc-400 font-sans">90 min documentary or cinematic entertainment pass.</div>
                      <div className="text-emerald-400 text-[10.5px] font-bold">90m Rest • 60 Coins</div>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-cyan-500/20 space-y-1">
                      <div className="text-cyan-300 font-bold">🛡️ Active Rest Overlay</div>
                      <div className="text-[10px] text-zinc-400 font-sans">Launches a restorative countdown with contemplation, pause/resume, and early-finish refund.</div>
                      <div className="text-cyan-400 text-[10.5px] font-bold">Intentional Rest Block</div>
                    </div>
                  </div>
                </div>

                {/* REWARD SHOP UNLOCK POLICY & GATING */}
                <div className="p-4 bg-zinc-900/90 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                  <div className="font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-amber-400" /> Reward Shop Unlock Policy & Daily Obligation Gating
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    To guarantee that recreation is always earned, the Reward Shop automatically restricts purchases until today's mandatory directives are completed. The gating lock is tied to quests classified as <strong className="text-amber-300">Main</strong>, <strong className="text-amber-300">Boss</strong>, <strong className="text-amber-300">Penalty</strong>, and <strong className="text-amber-300">Habit</strong>. Side and Optional tasks do not block access. In addition, an active <strong>Kaffārah penance quest</strong> will engage an absolute moral lockdown until fulfilled.
                  </p>
                </div>

                {/* TELEPORT BUTTONS */}
                <div className="p-4 bg-[#141824] border border-[#c5a059]/40 rounded-xl space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-[#e5c875]" />
                      <span>ACCESS THE IMPERIAL REWARD VAULT</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      Browse physical rewards, redeem guilt-free rest passes, or audit your temporal accounting.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigate('shop')}
                      className="px-3.5 py-1.5 bg-[#3a2e12] hover:bg-[#524017] text-[#fef08a] border border-[#c5a059]/60 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>OPEN VAULT SHOP</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleNavigate('time_ledger')}
                      className="px-3.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>TIME LEDGER</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 11. OBSERVATORIES: XP & TEMPORAL AUDIT LEDGERS */}
            {activeSection === 'observatories' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-indigo-500/30 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                      11. Observatories: XP & Temporal Audit Ledgers
                    </h3>
                    <span className="text-[9px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      EMPIRICAL_AUDITABILITY
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    <em>"Read your record. Sufficient is yourself against you this Day as accountant."</em> — Surah Al-Isra 17:14. Complete forensic transparency: chronological and auditable transaction logs for XP and Temporal Capital, multi-attribute radar analytics, and the interactive spiderweb constellation net.
                  </p>
                </div>

                {/* THE NEED FOR FORENSIC TRANSPARENCY */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#101426] via-[#0d1017] to-[#0b0e1b] border border-indigo-500/40 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                    <div className="font-mono font-bold text-indigo-300 uppercase flex items-center gap-2 text-xs">
                      <RubElHizbIcon className="h-4 w-4 text-indigo-400" />
                      <span>FORENSIC ACCOUNTABILITY & ANTI-ARBITRARY PROGRESSION</span>
                    </div>
                    <span className="text-[9px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      ZERO_BLACK_BOX
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    In a rigorous life-operating system, numbers must never be arbitrary, mystical, or opaque. Every XP point earned, every attribute fraction accrued, and every minute of temporal capital deposited or spent originates from a verified operational event. The <strong>Observatories</strong> provide historical transparency with dedicated forensic ledgers; manual calibration remains available for correcting offline activity.
                  </p>
                </div>

                {/* THE 2 MASTER FORENSIC LEDGERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* XP AUDIT LEDGER */}
                  <div className="p-4 bg-zinc-900/90 border border-indigo-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-indigo-300 uppercase text-xs flex items-center gap-1.5">
                        <FileSpreadsheet className="h-4 w-4 text-indigo-400" /> 1. Divine XP Audit Ledger
                      </span>
                      <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        XP_HISTORY
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      An immutable, chronological record of every XP gain and loss across all system facets.
                    </p>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 space-y-0.5">
                        <div className="text-indigo-300 font-bold">Tracked Fields:</div>
                        <div className="text-[11px] text-zinc-400 font-sans">Timestamp, Source Type, Note/Title, Delta XP (+/-), Level at time, and Running Balance.</div>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 space-y-0.5">
                        <div className="text-indigo-300 font-bold">Source Classifications:</div>
                        <div className="text-[11px] text-zinc-400 font-sans">Directives, Habit Streaks, Focus Sprints, Sacred Protocol, Muhāsabah, Boss Fights, Recovery Deductions.</div>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Data Export:</span>
                        <span className="text-indigo-400 font-bold">Instant CSV Download</span>
                      </div>
                    </div>
                  </div>

                  {/* TEMPORAL CAPITAL LEDGER */}
                  <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-emerald-300 uppercase text-xs flex items-center gap-1.5">
                        <Hourglass className="h-4 w-4 text-emerald-400" /> 2. Temporal Capital Ledger
                      </span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        TIME_LEDGER
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Dedicated balance accounting tracking every minute minted, invested, or redeemed from your Leisure Bank, with daily net and seven-day recovery rhythm summaries.
                    </p>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 space-y-0.5">
                        <div className="text-emerald-300 font-bold">Tracked Transactions:</div>
                        <div className="text-[11px] text-zinc-400 font-sans">Focus Harvests (+10m), Quest Dividends, Rest Vouchers (-25m to -90m), Active Rest sessions, and Debt Restructuring.</div>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 space-y-0.5">
                        <div className="text-emerald-300 font-bold">Audit Controls:</div>
                        <div className="text-[11px] text-zinc-400 font-sans">Filter by transaction category, search by event note, and synchronize with the Dashboard HUD.</div>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-300">Data Export:</span>
                        <span className="text-emerald-400 font-bold">Instant CSV Download</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESONANCE ANALYTICS & CONSTELLATION SPIDERWEB NET */}
                <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5 text-xs">
                      <GitFork className="h-4 w-4 text-cyan-400" />
                      <span>RESONANCE ANALYTICS & THE SPIDERWEB CONSTELLATION NET</span>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      NEURAL_TOPOLOGY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 space-y-1.5">
                      <span className="text-cyan-400 font-bold block flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" /> Resonance Analytics Chamber
                      </span>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        Visualizes your 8-attribute capability profile via an interactive radar chart, calculates weekly XP velocity, assesses task completion efficiency, and detects domain imbalances before they cause burnout.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 space-y-1.5">
                      <span className="text-purple-400 font-bold block flex items-center gap-1">
                        <GitFork className="h-3.5 w-3.5" /> Spiderweb Constellation Net
                      </span>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        An interactive canvas mapping the neural topology of your life: Grand Destinies connect to Campaigns, Campaigns fan out into Projects, Projects spawn Quests, and Quests feed the Skills Tree.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TELEPORT ACTIONS */}
                <div className="p-4 bg-[#141824] border border-[#c5a059]/40 rounded-xl space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-[#e5c875]" />
                      <span>ACCESS AUDIT OBSERVATORIES</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      Inspect the XP historical ledger, track temporal flow, or view neural constellation relationships.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleNavigate('xp_history')}
                      className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-500/40 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>XP LEDGER</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleNavigate('time_ledger')}
                      className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>TIME LEDGER</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleNavigate('spiderweb')}
                      className="px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>SPIDERWEB</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 12. VISUAL CODEX, SOUND FX & SANCTUM ENGINE */}
            {activeSection === 'visual-system' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-rose-500/30 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                      <Palette className="h-5 w-5 text-rose-400" />
                      12. Visual Codex, Sound FX & Sanctum Engine
                    </h3>
                    <span className="text-[9px] font-mono bg-rose-950 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      CUSTOMIZATION_CORE
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Sensory aesthetics and system preservation: 6 imperial visual themes, ergonomic interface density, procedural Web Audio soundscapes, JSON disaster recovery, and developer overrides.
                  </p>
                </div>

                {/* 6 IMPERIAL THEMES */}
                <div className="p-4 bg-zinc-900/90 border border-rose-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-rose-300 uppercase flex items-center gap-1.5 text-xs">
                      <Palette className="h-4 w-4 text-rose-400" />
                      <span>THE 6 IMPERIAL VISUAL THEME ARCHETYPES</span>
                    </div>
                    <span className="text-[9px] font-mono bg-rose-950 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      IMMERSIVE_THEMES
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-[#c5a059]/40 space-y-1">
                      <span className="text-[#fef08a] font-bold block">1. Imperial Gold & Obsidian</span>
                      <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                        Regal gold filigree against deep midnight slate. The flagship Pale Ore aesthetic designed for contemplative focus.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-emerald-500/40 space-y-1">
                      <span className="text-emerald-300 font-bold block">2. Emerald Damascene</span>
                      <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                        Lush Islamic emerald hues with gilded borders, evoking tranquil Andalusian courtyard gardens.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-cyan-500/40 space-y-1">
                      <span className="text-cyan-300 font-bold block">3. Royal Lapis Lazuli</span>
                      <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                        Deep oceanic ultramarine and sapphire with cyan radiance, inspired by historical Persian mosque tilework.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-red-500/40 space-y-1">
                      <span className="text-red-300 font-bold block">4. Crimson Velvet</span>
                      <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                        Rich Andalusian garnet with warm ruby illumination, reminiscent of Alhambra's royal chambers.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-rose-500/40 space-y-1">
                      <span className="text-rose-300 font-bold block">5. Rose Quartz</span>
                      <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                        Refined, gentle rose gold paired with clean high-contrast charcoal for a softer, modern aesthetic.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-500/40 space-y-1">
                      <span className="text-zinc-200 font-bold block">6. Onyx Void</span>
                      <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                        Tactical stealth monochrome with stark white border accents, built for high-speed distraction-free deep work.
                      </p>
                    </div>
                  </div>
                </div>

                {/* INTERFACE ERGONOMICS & WEB AUDIO SYNTH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* ERGONOMICS & DENSITY */}
                  <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-cyan-400" /> UI Density & Ornamentation
                      </span>
                      <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono font-bold">
                        DISPLAY
                      </span>
                    </div>
                    <ul className="space-y-1.5 font-sans text-zinc-300 text-[11px]">
                      <li>• <strong>Comfortable Density:</strong> Generous whitespace and padding for relaxed tablet/desktop browsing.</li>
                      <li>• <strong>Compact Density:</strong> Balanced proportions ideal for standard desktop monitors.</li>
                      <li>• <strong>High Density / Tactical:</strong> Condensed spacing maximizing data visibility on screen for power users.</li>
                      <li>• <strong>Arabesque Filigree:</strong> Toggle Islamic 8-point geometric corner runes and star dividers.</li>
                    </ul>
                  </div>

                  {/* WEB AUDIO SYNTHESIZER */}
                  <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                        <Volume2 className="h-4 w-4 text-amber-400" /> Procedural Web Audio Sound FX
                      </span>
                      <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        ZERO_ASSET_SFX
                      </span>
                    </div>
                    <ul className="space-y-1.5 font-sans text-zinc-300 text-[11px]">
                      <li>• <strong>Tactile UI Click:</strong> Crisp 800Hz transient pulse providing subtle micro-haptic feedback.</li>
                      <li>• <strong>Golden Bell Chime:</strong> Resonant 528Hz solfeggio sine wave upon completing directives.</li>
                      <li>• <strong>Heroic Brass Triad:</strong> Major chord cascade (C-E-G-C) celebrating imperial level ascensions.</li>
                      <li>• <strong>Solemn Low Thud:</strong> 110Hz damped sawtooth resonance signaling Muhāsabah slips and penalties.</li>
                    </ul>
                  </div>
                </div>

                {/* SANCTUM ENGINE, BACKUPS & SYSTEM OVERRIDE */}
                <div className="p-4 bg-zinc-900/90 border border-[#c5a059]/30 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-1.5">
                      <Database className="h-4 w-4 text-[#c5a059]" />
                      <span>SANCTUM ENGINE: DISASTER RECOVERY & SYSTEM OVERRIDES</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-bold uppercase">
                      SYSTEM_PRESERVATION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                    <div className="p-2.5 bg-zinc-950 rounded border border-white/5 space-y-1">
                      <div className="text-emerald-400 font-bold">1. 1-Click JSON Backup</div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Export your full state (profile, quests, habits, ledger histories, inventory, and spiritual logs) into a single portable <code>.json</code> file.
                      </p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-white/5 space-y-1">
                      <div className="text-cyan-400 font-bold">2. Safe State Restore</div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Import past backups with instant schema validation and atomic state hydration, safeguarding years of progress.
                      </p>
                    </div>

                    <div className="p-2.5 bg-zinc-950 rounded border border-white/5 space-y-1">
                      <div className="text-amber-400 font-bold">3. System Overrides</div>
                      <p className="text-[10.5px] text-zinc-400 font-sans">
                        Manually calibrate starting base attributes or simulate system dates (<code>SYS_DATE</code>) for operational testing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TELEPORT ACTIONS */}
                <div className="p-4 bg-[#141824] border border-[#c5a059]/40 rounded-xl space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-[#e5c875]" />
                      <span>CUSTOMIZE APPEARANCE OR MANAGE SYSTEM BACKUPS</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      Switch themes, adjust sound synthesis, or export your complete life operating state.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigate('appearance')}
                      className="px-3.5 py-1.5 bg-[#3a2e12] hover:bg-[#524017] text-[#fef08a] border border-[#c5a059]/60 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>VISUAL CODEX</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleNavigate('system')}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>SYSTEM CONTROL</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-[#c5a059]/30 bg-gradient-to-r from-[#07080c] via-[#0e111a] to-[#07080c] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-[#c5a059]/80">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
            <span>Select any domain directive to teleport directly to that sanctuary chamber.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="px-3.5 py-1.5 bg-[#3a2e12] hover:bg-[#524017] text-[#fef08a] border border-[#c5a059]/60 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(197,160,89,0.2)]"
            >
              <span>SANCTUM DASHBOARD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#141824] hover:bg-[#1e2333] text-zinc-300 border border-white/10 hover:border-zinc-500 rounded-lg font-mono text-xs font-bold transition"
            >
              CLOSE MANUAL
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
