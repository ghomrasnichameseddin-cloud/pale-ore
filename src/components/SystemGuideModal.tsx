import React, { useState } from 'react';
import { 
  BookOpen, Activity, Swords, Target, Briefcase, Award, Sparkles, 
  ShoppingBag, Settings, Compass, X, HelpCircle, Cpu,
  Zap, Timer, Coins, ArrowRight, GitFork,
  Shield, ShieldAlert, AlertTriangle, RotateCcw, CheckCircle2, Flame, Trophy, Scale, Heart, Lock, Scroll, Moon
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
      color: 'text-cyan-400',
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
      title: '5. Goals, Projects & Mini-Breakdowns',
      icon: Target,
      badge: 'PLANNING',
      color: 'text-amber-400',
    },
    {
      id: 'strategic-models',
      title: '6. Decision Models & SOP Docs',
      icon: Compass,
      badge: 'MODELS',
      color: 'text-blue-400',
    },
    {
      id: 'mastery',
      title: '7. Skills, Seals & Ores Classification',
      icon: Award,
      badge: 'PROGRESSION',
      color: 'text-pink-400',
    },
    {
      id: 'spiritual-tracker',
      title: '8. Sacred Protocol & Hijri Calendar',
      icon: Moon,
      badge: 'SACRED RITES',
      color: 'text-[#e5c875]',
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
      title: '10. Luminescent Ore Shop',
      icon: ShoppingBag,
      badge: 'REWARDS',
      color: 'text-amber-400',
    },
    {
      id: 'analytics-system',
      title: '11. Analytics, Node Canvas & Override',
      icon: Settings,
      badge: 'CONTROL',
      color: 'text-indigo-400',
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
        className="glass-panel border border-cyan-500/30 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.18)] bg-zinc-950/95"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-white flex items-center gap-2">
                PALE ORE PROGRESSION OS — MASTER SYSTEM MANUAL
              </h2>
              <p className="text-xs font-mono text-cyan-400/80">
                Comprehensive Operational Manual, Mathematical Equations & Execution Frameworks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Close Manual"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY GRID (SIDEBAR + CONTENT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[480px]">
          
          {/* GUIDE NAVIGATION SIDEBAR */}
          <div className="w-full md:w-64 bg-zinc-950/80 border-b md:border-b-0 md:border-r border-white/10 p-3 space-y-1 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-2 py-1">
              MANUAL SECTIONS
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
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${sec.color}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {sec.badge}
                  </span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-white/5 mt-4 p-3 bg-zinc-900/50 rounded-xl space-y-2">
              <div className="text-[10px] font-mono text-zinc-400 font-bold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>SYS DATE CONTROLLER</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                You can test daily habit resets or midnight penalties by shifting the SYS DATE at top-left. Click SYNC TODAY anytime to restore real time.
              </p>
            </div>
          </div>

          {/* CONTENT DISPLAY AREA */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 font-sans leading-relaxed bg-zinc-950/50">
            
            {/* 1. ARCHITECTURE & RPG LOOP */}
            {activeSection === 'getting-started' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    1. System Architecture & The RPG Progression Loop
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    PALE ORE is a personal Progression Operating System turning real-world goals, habits, and skill mastery into an RPG execution loop.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-cyan-500/20 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold text-[11px] block flex items-center gap-1">
                      ⚡ DIRECTIVES
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      Execute Quests, Boss Battles & Daily Habits to earn XP, Luminescent Coins, and Attribute points.
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-purple-500/20 rounded-xl space-y-1.5">
                    <span className="text-purple-400 font-bold text-[11px] block flex items-center gap-1">
                      🧬 ATTRIBUTES
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      8 core stats (Strength, Focus, Knowledge, Discipline, Agility, Wisdom, Social, Faith) grow dynamically through proven quest completions.
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-emerald-500/20 rounded-xl space-y-1.5">
                    <span className="text-emerald-400 font-bold text-[11px] block flex items-center gap-1">
                      🏆 MASTERY
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      Level up skills, unseal latent Power Seals for passive multipliers, and spend earned coins in the Reward Shop.
                    </p>
                  </div>
                </div>

                {/* NAVIGATION MAP */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Primary System Navigation Map:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div onClick={() => handleNavigate('dashboard')} className="p-3 bg-zinc-900/60 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Activity className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Dashboard</span>
                        <span className="text-[11px] text-zinc-400">Daily summary, priority target, and 8-stat attribute capability matrix.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('quests')} className="p-3 bg-zinc-900/60 hover:bg-emerald-950/30 border border-white/5 hover:border-emerald-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Swords className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Quests & Directives</span>
                        <span className="text-[11px] text-zinc-400">Manage main/side quests, daily habits, boss fights, split/merge/move tools.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('goals')} className="p-3 bg-zinc-900/60 hover:bg-amber-950/30 border border-white/5 hover:border-amber-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Target className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Goals & Mini-Goals</span>
                        <span className="text-[11px] text-zinc-400">Breakdown macro strategic vision into actionable mini-goals and milestones.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('projects')} className="p-3 bg-zinc-900/60 hover:bg-blue-950/30 border border-white/5 hover:border-blue-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Briefcase className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Projects & Sub-Projects</span>
                        <span className="text-[11px] text-zinc-400">Group tasks into project directories with sub-project components & deadlines.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('spiritual')} className="p-3 bg-zinc-900/60 hover:bg-[#3a2e12]/40 border border-white/5 hover:border-[#c5a059]/40 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Moon className="h-4 w-4 text-[#e5c875] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Sacred Protocol & Hijri</span>
                        <span className="text-[11px] text-zinc-400">Track 5 Daily Salaats (Masjid/Rawātib), Morning/Evening Adhkār, 70+ Salawāt & Qiyām al-Layl.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('muhasabah')} className="p-3 bg-zinc-900/60 hover:bg-amber-950/30 border border-white/5 hover:border-amber-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Scale className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Muhāsabah Chamber</span>
                        <span className="text-[11px] text-zinc-400">Self-accountability ledger, bounded XP friction (−500 cap), restitution quests & weakness seals.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('seals')} className="p-3 bg-zinc-900/60 hover:bg-purple-950/30 border border-white/5 hover:border-purple-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Award className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Skills, Seals & Ores</span>
                        <span className="text-[11px] text-zinc-400">Level skill trees, shatter ancient Pale Ore chains, equip custom career job perks.</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('shop')} className="p-3 bg-zinc-900/60 hover:bg-amber-950/30 border border-white/5 hover:border-amber-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <ShoppingBag className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Luminescent Shop</span>
                        <span className="text-[11px] text-zinc-400">Exchange quest coins for real-world rewards and custom productivity vouchers.</span>
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
                      <p className="text-zinc-400 text-[10px] font-sans">High-velocity delivery, multiple seal advancements, and a refined strategic operating rhythm.</p>
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

                {/* 5. POWER SEAL 10 EVOLUTIONARY TIERS */}
                <div className="p-4 bg-zinc-900/90 border border-purple-500/30 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-purple-300 uppercase flex items-center gap-2 text-xs">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>5. POWER SEAL 10-TIER PROGRESSION</span>
                    </div>
                    <span className="text-[9px] font-mono bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded uppercase">
                      LEVEL_GATED_UNSEALING
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Shatter internal seals as your System Level rises to unlock passive permanent multipliers and attribute boosts:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-0.5">
                      <span className="text-zinc-300 font-bold block text-[10px]">SEALS 1 – 3 (Lvl 1 – 5)</span>
                      <p className="text-zinc-400 font-sans text-[10px]">Restless Mind, Fragmented Focus, Sluggish Starter.</p>
                    </div>
                    <div className="p-2.5 bg-zinc-950 border border-cyan-500/20 rounded-lg space-y-0.5">
                      <span className="text-cyan-300 font-bold block text-[10px]">SEALS 4 – 6 (Lvl 8 – 18)</span>
                      <p className="text-zinc-400 font-sans text-[10px]">Hesitation, Lone Wolf, Shallow Roots.</p>
                    </div>
                    <div className="p-2.5 bg-zinc-950 border border-amber-500/20 rounded-lg space-y-0.5">
                      <span className="text-amber-300 font-bold block text-[10px]">SEALS 7 – 9 (Lvl 22 – 35)</span>
                      <p className="text-zinc-400 font-sans text-[10px]">Diminishing Returns, Imposter Shadow, Burnout Horizon.</p>
                    </div>
                    <div className="p-2.5 bg-zinc-950 border border-rose-500/30 rounded-lg space-y-0.5">
                      <span className="text-rose-400 font-bold block text-[10px]">SEAL 10 (Lvl 50)</span>
                      <p className="text-rose-200 font-sans text-[10px]">Crown of the Apex Architect (Ultimate Transcendence).</p>
                    </div>
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
                    How core stats are dynamically computed using baseline levels, quest completion evidence, and seal multipliers.
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
                      <span className="text-amber-300">Total Level</span> = <span className="text-zinc-300">Base Baseline</span> + <span className="text-emerald-400">Earned Bonus</span> + <span className="text-purple-400">Seal & Class Boost</span>
                    </div>
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    Each attribute has a configurable base baseline (e.g. 10), plus earned bonus levels calculated from completed quest evidence and skill practice, plus passive seal boosts.
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
                        <div>• <strong>Failure Consequence:</strong> Missing scheduled days resets streak & triggers Midnight Penalty.</div>
                      </div>
                    </div>

                    {/* PENALTY */}
                    <div className="p-3.5 bg-zinc-900/90 border border-rose-500/40 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-rose-300 flex items-center gap-1.5">⚠️ Penalty Directive (`Penalty`)</span>
                        <span className="text-[9px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">AUTO-GENERATED</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-relaxed">
                        Created automatically when a Main, Boss, or Habit quest is left unchecked past midnight or marked failed.
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
                        <div>• <strong>View Isolation:</strong> Displayed alongside Penalty quests while standard quests are filtered out.</div>
                        <div>• <strong>Deactivation:</strong> Must be completed to deactivate Recovery Mode.</div>
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
                        2. 50% HALF-TIME QUESTS
                      </div>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        The system spawns a `⚠️ RECOVERY` penalty directive with its estimated duration halved (`origEstTime / 2`) for rapid catch-up.
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

                {/* POMODORO FOCUS OVERLAY */}
                <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Timer className="h-4 w-4" /> Integrated Pomodoro Focus Timer Overlay
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans">
                    Launch Pomodoro timer overlays (25m, 45m, 60m), link focus cycles directly to active quests for extra XP, and toggle ambient focus audio. Focus session cycles auto-calculate to ensure accurate session completion before marking associated quests complete.
                  </p>
                </div>
              </div>
            )}

            {/* 5. GOALS, PROJECTS & MINI-BREAKDOWNS */}
            {activeSection === 'strategy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    5. Strategic Goals, Projects & Mini-Breakdowns
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Deconstructing macro vision into actionable micro-milestones with automated progress calculation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MINI GOALS EXPLANATION */}
                  <div className="p-4 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <GitFork className="h-4 w-4" />
                      Mini-Goals & Sub-Goals Structure
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Inside GoalsView, you can break down any main goal into specific Mini-Goals with target dates. Toggling mini-goals automatically re-calculates the goal progress bar!
                    </p>
                    <ul className="text-[11px] text-zinc-400 font-mono space-y-1">
                      <li>• Assign target completion dates per mini-goal.</li>
                      <li>• Visually track micro-milestone status.</li>
                    </ul>
                  </div>

                  {/* MINI PROJECTS EXPLANATION */}
                  <div className="p-4 bg-zinc-900/90 border border-blue-500/30 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      Mini-Projects & Sub-Tasks Structure
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Inside ProjectsView, you can break deliverables into mini-project sub-components. Completing sub-components advances overall project readiness.
                    </p>
                    <ul className="text-[11px] text-zinc-400 font-mono space-y-1">
                      <li>• Divide complex software or physical deliverables.</li>
                      <li>• Link milestones and quests directly.</li>
                    </ul>
                  </div>

                  {/* MILESTONES EXPLANATION */}
                  <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      Milestones & Phase Gating
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Milestones are sequential checkpoints that organize related quests into distinct phases within a Goal or Project. Each milestone tracks completion percentage in real-time.
                    </p>
                    <ul className="text-[11px] text-zinc-400 font-mono space-y-1">
                      <li>• Create phases (e.g., "Design", "Build", "Deploy").</li>
                      <li>• Link quests directly to a milestone.</li>
                      <li>• Auto-calculate progress from quest completions.</li>
                      <li>• Toggle milestone status (Active/Completed).</li>
                    </ul>
                  </div>

                  {/* MILESTONE MECHANICS */}
                  <div className="p-4 bg-zinc-900/90 border border-purple-500/30 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Milestone Mechanics
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Each milestone automatically calculates its progress percentage based on the quests linked to it.
                    </p>
                    <div className="text-[10px] text-zinc-400 font-mono space-y-1 bg-black/40 p-2 rounded border border-white/5">
                      <div>Progress = (Completed Quests / Total Quests) × 100%</div>
                      <div className="text-zinc-500 text-[9px] mt-1">Example: 3/5 quests done = 60% milestone progress</div>
                    </div>
                    <p className="text-[11px] text-zinc-400">Deleting a milestone unlinks all its quests (they remain active but lose the milestone association).</p>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1 text-xs">
                  <span className="font-mono font-bold text-cyan-400 block uppercase">
                    Goal Horizon Tiers:
                  </span>
                  <p className="text-zinc-400 font-sans">
                    30-Day Sprint | Quarterly (Q1-Q4) | Annual Vision | Life Vision.
                  </p>
                </div>
              </div>
            )}

            {/* 6. STRATEGIC MODELS & SOP DOCS */}
            {activeSection === 'strategic-models' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Compass className="h-5 w-5 text-blue-400" />
                    6. Strategic Decision Models & SOP Planning Logs
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Interactive decision frameworks and connected Standard Operating Procedure documents.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-cyan-400 block">📊 Eisenhower Matrix</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Categorize tasks into Do Now, Schedule, Delegate, and Eliminate quadrants.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-purple-400 block">🎯 OKRs (Objectives & Key Results)</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Align qualitative objectives with quantitative key result progress bars.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-amber-400 block">⚡ Pareto 80/20 Rule</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Identify the top 20% high-leverage activities driving 80% of actual outcomes.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-emerald-400 block">📑 Planning Documents & SOPs</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Create Markdown SOP planning logs and link them to Goals, Projects, or Skills.</p>
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
                    7. Skills Mastery, Power Seals & Ores Classification
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Leveling skill competencies, unsealing ancient Ore cores for permanent stat multipliers, and equipping class titles.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-pink-500/20 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-pink-400 uppercase block">1. Skills Tree</span>
                    <p className="text-zinc-300 font-sans">
                      Organize skills into Primary and Secondary parent-child trees. Practice logs grant skill XP and boost mastery.
                    </p>
                  </div>

                  {/* ORES CLASSIFICATION MATRIX */}
                  <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-2 text-xs">
                        <span>💎 PALE ORE CLASSIFICATION & POWER SEALS MATRIX</span>
                      </div>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
                        SEAL_TIERS_CLASSIFIED
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans">
                      Power Seals bind ancient Pale Ore cores wrapped in heavy chains. As your operator level grows, shatter the chains to unlock permanent passive multipliers and stat boosts:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-[11px] pt-1">
                      {/* Common / Iron */}
                      <div className="p-3 bg-zinc-950 border border-zinc-500/30 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300 font-bold">⚙️ Slothful Iron Ore</span>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Lvl 1 • Common</span>
                        </div>
                        <p className="text-zinc-400 text-[10px] font-sans">Unrefined magnetic iron core bound in rusted chains.</p>
                        <div className="text-cyan-400 text-[10px] pt-1 border-t border-white/5">
                          ✦ +10% XP Multiplier<br />
                          ✦ +5 Base Momentum Floor<br />
                          ✦ +1 Discipline Boost
                        </div>
                      </div>

                      {/* Rare / Cobalt */}
                      <div className="p-3 bg-zinc-950 border border-purple-500/30 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 font-bold">🪨 Cobalt Focus Ore</span>
                          <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded">Lvl 3 • Rare</span>
                        </div>
                        <p className="text-zinc-400 text-[10px] font-sans">Heavy luminescent cobalt core encased in steel chains.</p>
                        <div className="text-purple-400 text-[10px] pt-1 border-t border-white/5">
                          ✦ +15% XP on Main Directives<br />
                          ✦ +2 Focus Stat Level Boost
                        </div>
                      </div>

                      {/* Epic / Mithril */}
                      <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-300 font-bold">💎 Mithril Surge Ore</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">Lvl 5 • Epic</span>
                        </div>
                        <p className="text-zinc-400 text-[10px] font-sans">Luminous silver-etched mithril ore chunk.</p>
                        <div className="text-emerald-400 text-[10px] pt-1 border-t border-white/5">
                          ✦ +20% Total XP Multiplier<br />
                          ✦ +3 Agility Stat Boost<br />
                          ✦ -25% Penalty Impact Reduction
                        </div>
                      </div>

                      {/* Legendary / Auric */}
                      <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-bold">🪙 Auric Sovereign Ore</span>
                          <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded">Lvl 8 • Legendary</span>
                        </div>
                        <p className="text-zinc-400 text-[10px] font-sans">Radiant golden adamantine ore vein in forged gold chains.</p>
                        <div className="text-amber-400 text-[10px] pt-1 border-t border-white/5">
                          ✦ +30% Total XP Multiplier<br />
                          ✦ +4 Wisdom & +4 Strength Boost
                        </div>
                      </div>

                      {/* Divine / Obsidian Void */}
                      <div className="p-3 bg-zinc-950 border border-rose-500/30 rounded-xl space-y-1 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="text-rose-300 font-bold">🌌 Obsidian Void Ore</span>
                          <span className="text-[9px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded">Lvl 12 • Divine</span>
                        </div>
                        <p className="text-zinc-400 text-[10px] font-sans">Primordial obsidian void ore pulsing with cosmic energy.</p>
                        <div className="text-rose-400 text-[10px] pt-1 border-t border-white/5">
                          ✦ +50% Total XP Multiplier<br />
                          ✦ +5 Boost to ALL 8 Attributes<br />
                          ✦ Debuff Immunity
                        </div>
                      </div>
                    </div>
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
                          <span className="text-emerald-400 font-bold">Tilts Mīzān</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 font-sans">Consistently fulfilling your daily 70 Salawāt infuses positive weight into the Mīzān scale.</p>
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
                        <p className="text-[10.5px] text-zinc-400 font-sans">Each additional pair of raka'āt (4, 6, 8, 10+) stacks +30 bonus XP and amplifies Hasanāt.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINKAGE TO SACRED MĪZĀN & FAITH ATTRIBUTE */}
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
                      <span className="text-emerald-400 font-bold block text-[11px]">1. MĪZĀN WEIGHT (HASANĀT)</span>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Every checked prayer, bonus, dhikr, salat count, and qiyam raka'ah directly registers as positive <strong>Al-Hasanāt</strong> on the emerald scale pan.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950/90 rounded border border-white/5 space-y-1">
                      <span className="text-purple-400 font-bold block text-[11px]">2. FAITH ATTRIBUTE GROWTH</span>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Consistent daily spiritual completions directly drive the growth of your <strong>Faith (الإِيمَان)</strong> attribute stat and unlock spiritual seal milestones.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950/90 rounded border border-white/5 space-y-1">
                      <span className="text-cyan-400 font-bold block text-[11px]">3. MORAL FRICTION DEFENSE</span>
                      <p className="text-zinc-300 font-sans text-[11px]">
                        Robust spiritual habits safeguard your momentum against unexpected slip penalties, preventing the Sacred Mīzān from tilting into severe deficit.
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
                      9. Muhāsabah & The Sacred Mīzān: Self-Accountability & High-Stakes Restitution
                    </h3>
                    <span className="text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      SPIRITUAL_OPERATING_SYSTEM
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    <em>"Evaluate yourselves before you are evaluated, and weigh your deeds before they are weighed for you."</em> — Umar ibn al-Khattāb (RA). Realistic moral friction, live dynamic deed scales, coin fines, momentum loss, shop lockdowns, and sacred Kaffārah penances.
                  </p>
                </div>

                {/* THE SACRED MĪZĀN SCALE EXPLANATION */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-[#1b1509] via-[#0d0f17] to-[#0b0d13] border border-[#c5a059]/40 rounded-xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2.5">
                    <div className="font-mono font-bold text-[#fef08a] uppercase flex items-center gap-2 text-xs">
                      <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                      <span>THE SACRED MĪZĀN (LIVE DEED BALANCE & DYNAMIC PHYSICS ENGINE)</span>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/40 px-2 py-0.5 rounded font-bold uppercase">
                      EQUILIBRIUM_ENGINE_V2
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The <strong>Sacred Mīzān</strong> visually simulates the cosmic balance between your completed virtuous deeds & sacred duties (<strong>Al-Hasanāt</strong>) and your self-audited moral lapses (<strong>As-Sayyi'āt</strong>). The crossbeam dynamically pivots in real-time on its fulcrum based on your <strong>Daily Net XP</strong> (Hasanāt XP &minus; Sayyi'āt XP).
                  </p>

                  {/* TWO PANS BREAKDOWN: WHAT AFFECTS EACH SIDE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    {/* LEFT PAN */}
                    <div className="p-3.5 bg-zinc-950/90 border border-emerald-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-mono font-bold border-b border-emerald-500/20 pb-1.5">
                        <span className="text-emerald-300 flex items-center gap-1.5">
                          ✨ LEFT PAN: AL-HASANĀT (+XP)
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">LIGHT OF OBEDIENCE</span>
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
                          🛑 RIGHT PAN: AS-SAYYI'ĀT (−XP)
                        </span>
                        <span className="text-[9px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded">DARKNESS OF NEGLECT</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans">
                        Any audited moral slip or behavioral relapse recorded in Muhāsabah adds weight to the ruby pan:
                      </p>
                      <ul className="text-[10.5px] space-y-1 font-mono text-zinc-300">
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Minor Slips (اللَّمَم):</strong> −50 to −100 XP (fleeting distractions, brief procrastination, idle chatter).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Moderate Lapses (الغَفْلَة):</strong> −150 to −200 XP (doomscrolling feeds, broken promises, skipping workouts).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Major Breaches (الكَبَائِر):</strong> −300 XP (delayed/missed Fajr or prayers, giving in to desires/triggers).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">✦</span>
                          <span><strong>Critical Failures (الجُرْم):</strong> −400 to −500 XP (severe relapse, complete breakdown of daily discipline).</span>
                        </li>
                      </ul>
                    </div>
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
                      <strong className="text-cyan-300 font-mono block text-[11px]">🛡️ Maximum −500 XP Daily Penalty Cap & 0 XP Floor</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Total Muhāsabah penalties are strictly capped at <strong>−500 XP per calendar day</strong> to protect against death-spiral demoralization. Player XP can never drop below <code>0 XP</code>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CHAINS OF THE NAFS & POWER SEALS */}
                <div className="p-4 bg-zinc-900/90 border border-purple-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="font-mono font-bold text-purple-300 uppercase flex items-center gap-2 text-xs">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>CHAINS OF THE NAFS (BEHAVIORAL WEAKNESSES) & POWER SEALS</span>
                    </div>
                    <span className="text-[9px] font-mono bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded uppercase">
                      5_LINK_FORGE_ENGINE
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Instead of treating repeated slips as isolated failures, the system tracks <strong>Chains of the Nafs</strong> through an iron 5-link progression meter:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg space-y-1">
                      <span className="text-amber-400 font-bold block text-[11px]">1. 5-LINK ACCUMULATION</span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        Every recurrence of a linked slip fills 1 link of the 5-part iron chain meter.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-purple-500/30 rounded-lg space-y-1">
                      <span className="text-purple-300 font-bold block text-[11px]">2. IMPERIAL SEAL FORGING</span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        At 5/5 slips, click <strong>"FORGE INTO POWER SEAL"</strong> to bind the behavioral pattern into a heavy chained Power Seal in the Seals tab.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-lg space-y-1">
                      <span className="text-emerald-400 font-bold block text-[11px]">3. SHATTER & CONQUER</span>
                      <p className="text-zinc-400 font-sans text-[11px]">
                        Shatter the sealed chains through sustained discipline to unlock permanent passive attribute bonuses and XP multipliers!
                      </p>
                    </div>
                  </div>
                </div>

                {/* DASHBOARD AUDIT WIDGET QUICK ACCESS */}
                <div className="p-4 bg-[#141824] border border-[#c5a059]/40 rounded-xl space-y-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-[#e5c875]" />
                      <span>DASHBOARD INTEGRATION & SACRED MĪZĀN ACCESS</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      Access the Sacred Mīzān, rapid 1-tap realm triage, active Kaffārah restitution queue, and the chronological slip ledger anytime in the Muhāsabah chamber.
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

            {/* 10. LUMINESCENT SHOP */}
            {activeSection === 'shop-rewards' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-amber-400" />
                    10. Luminescent Ore Reward Shop & Vouchers
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Redeem Luminescent Coins earned through quest completions for custom real-life treats or system perks.
                  </p>
                </div>

                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-amber-300">
                    <span className="flex items-center gap-1.5"><Coins className="h-4 w-4" /> How Coins Are Earned</span>
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">CURRENCY_ENGINE</span>
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    Coins generate automatically upon completing directives (especially Boss Fights) and finishing focus sessions. Add custom rewards to incentivize real-life execution!
                  </p>
                </div>

                <div className="p-4 bg-zinc-900/90 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                  <div className="font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-amber-400" /> Reward Shop Unlock Policy
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    The Reward Shop is restricted by default until today's mandatory directives are completed. The lock is tied directly to quests categorized under <strong className="text-amber-300">Main</strong>, <strong className="text-amber-300">Boss</strong>, <strong className="text-amber-300">Penalty</strong>, and <strong className="text-amber-300">Habit</strong>. Side and Optional tasks do not prevent shop unlocking.
                  </p>
                </div>
              </div>
            )}

            {/* 11. ANALYTICS, NODE CANVAS & OVERRIDE */}
            {activeSection === 'analytics-system' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    11. Analytics, Spiderweb Node Canvas & System Override
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Performance telemetries, visual node connection canvas, and manual baseline stat overrides.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-cyan-400 font-bold block">1. ANALYTICS</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Sustained attribute radar chart, weekly velocity, and performance metrics.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-purple-400 font-bold block">2. SPIDERWEB CANVAS</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Interactive visual canvas connecting all Goals, Projects, Quests, and Skills.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-amber-300 font-bold block">3. SYSTEM OVERRIDE</span>
                    <p className="text-zinc-400 font-sans text-[11px]">In System Control, manually adjust starting attribute baselines or backup JSON.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Click any action button below to navigate directly to that section.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>GO TO DASHBOARD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-mono text-xs font-bold transition"
            >
              CLOSE MANUAL
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
