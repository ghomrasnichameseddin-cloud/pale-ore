import React, { useState } from 'react';
import { 
  BookOpen, Activity, Swords, Target, Briefcase, Award, Sparkles, 
  ShoppingBag, BarChart3, Network, Settings, Compass, FolderOpen, 
  Search, ChevronRight, X, HelpCircle, CheckCircle2, Cpu, Flame,
  Zap, Calendar, RefreshCw, Shield, Timer, Coins, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function SystemGuideModal({ isOpen, onClose, onNavigateTab }: SystemGuideModalProps) {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sections = [
    {
      id: 'getting-started',
      title: '1. Quick Start & Overview',
      icon: BookOpen,
      badge: 'ESSENTIAL',
      color: 'text-cyan-400',
    },
    {
      id: 'core-attributes',
      title: '2. Attributes & Math Engine',
      icon: Cpu,
      badge: 'MECHANICS',
      color: 'text-purple-400',
    },
    {
      id: 'operations',
      title: '3. Operations & Directives',
      icon: Swords,
      badge: 'DAILY',
      color: 'text-emerald-400',
    },
    {
      id: 'strategy',
      title: '4. Goals, Projects & SOPs',
      icon: Target,
      badge: 'PLANNING',
      color: 'text-amber-400',
    },
    {
      id: 'mastery',
      title: '5. Skills, Seals & Rewards',
      icon: Award,
      badge: 'PROGRESSION',
      color: 'text-pink-400',
    },
    {
      id: 'analytics-system',
      title: '6. Analytics, Graph & Override',
      icon: Settings,
      badge: 'CONTROL',
      color: 'text-blue-400',
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
        className="glass-panel border border-cyan-500/30 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-zinc-950/95"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-white flex items-center gap-2">
                PALE ORE PROGRESSION OS — SYSTEM MANUAL
              </h2>
              <p className="text-xs font-mono text-cyan-400/80">
                Complete Operational Guide, Mathematical Mechanics & Directives Manual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            title="Close Guide"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MAIN BODY GRID (SIDEBAR + CONTENT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[450px]">
          
          {/* GUIDE NAVIGATION SIDEBAR */}
          <div className="w-full md:w-64 bg-zinc-950/80 border-b md:border-b-0 md:border-r border-white/10 p-3 space-y-1 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-2 py-1">
              GUIDE SECTIONS
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

            <div className="pt-4 border-t border-white/5 mt-4 p-2 bg-zinc-900/50 rounded-xl space-y-2">
              <div className="text-[10px] font-mono text-zinc-400 font-bold flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>NEED QUICK HELP?</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                You can test daily resets or streak mechanics by changing the <span className="text-cyan-300 font-mono font-bold">SYS DATE</span> at top left.
              </p>
            </div>
          </div>

          {/* CONTENT DISPLAY AREA */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-zinc-300 font-sans leading-relaxed bg-zinc-950/50">
            
            {/* 1. QUICK START & OVERVIEW */}
            {activeSection === 'getting-started' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    1. System Architecture & Philosophy
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    PALE ORE is a personal Progression Operating System designed to turn real-world goals, habits, and knowledge acquisition into an RPG execution loop.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-cyan-400 font-bold text-[11px] block">⚡ DIRECTIVES</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Execute Quests, Boss Battles & Daily Habits to gain XP, Luminescent Coins, and Attribute points.</p>
                  </div>
                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-purple-400 font-bold text-[11px] block">🧬 ATTRIBUTES</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Your core stats (Strength, Focus, Knowledge, Discipline, Agility, Wisdom, Social, Faith) grow dynamically as you level up skills and finish directives.</p>
                  </div>
                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-bold text-[11px] block">🏆 MASTERY</span>
                    <p className="text-[11px] text-zinc-400 font-sans">Level up Skills, unseal Power Seals for passive multipliers, and spend earned Coins in the Reward Shop.</p>
                  </div>
                </div>

                <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                    <Calendar className="h-4 w-4" /> System Time & Date Simulation
                  </h4>
                  <p className="text-xs text-zinc-300">
                    The top header/sidebar features a <strong className="text-white font-mono">SYS DATE</strong> controller. You can shift system days backward or forward to review past operational logs or test habit recurrence without breaking real-world tracking. Click <strong className="text-emerald-400 font-mono">SYNC TODAY</strong> anytime to return to real system clock.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Primary Navigation Map:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <li className="flex items-center gap-2 p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                      <Activity className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span><strong>Dashboard:</strong> Daily summary, Priority target, and Attribute Matrix.</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                      <Swords className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span><strong>Quests & Habits:</strong> Manage operational tasks, recurring habits, and boss battles.</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                      <Target className="h-4 w-4 text-amber-400 shrink-0" />
                      <span><strong>Goals & Projects:</strong> Organize multi-step strategic milestones and task folders.</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                      <Compass className="h-4 w-4 text-purple-400 shrink-0" />
                      <span><strong>Planning & Frameworks:</strong> Interactive models (Eisenhower, OKRs, Pareto 80/20, SOPs).</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. ATTRIBUTES & MATH ENGINE */}
            {activeSection === 'core-attributes' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-400" />
                    2. Attributes & Mathematical Engine
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    How core attributes work, how the math sums up base baselines with earned bonuses, and how filtering works.
                  </p>
                </div>

                <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-3 font-mono">
                  <div className="text-xs font-bold text-purple-300 uppercase flex items-center justify-between">
                    <span>THE Core Attribute Formula</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">FORMULA_VERIFIED</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/10 rounded-lg text-center text-sm font-extrabold text-white">
                    <span className="text-amber-300">Total Level</span> = <span className="text-zinc-300">Base Baseline</span> + <span className="text-emerald-400">Quest & Skill Earned Bonus</span> + <span className="text-purple-400">Seal & Class Boost</span>
                  </div>
                  <p className="text-xs font-sans text-zinc-300">
                    Your character possesses 8 core attributes: <strong>Strength, Focus, Knowledge, Discipline, Agility, Wisdom, Social, and Faith</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Understanding Baseline vs Earned Bonuses:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-zinc-900 border border-amber-500/20 rounded-xl space-y-1">
                      <span className="text-amber-300 font-bold block">1. BASE BASELINE</span>
                      <p className="text-zinc-400 font-sans text-[11px]">Set manually in System Control (or default 10). Represents your starting baseline capability before quest completions.</p>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-emerald-500/20 rounded-xl space-y-1">
                      <span className="text-emerald-400 font-bold block">2. EARNED BONUS</span>
                      <p className="text-zinc-400 font-sans text-[11px]">Calculated automatically based on completed directives and skill levels associated with that attribute.</p>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-purple-500/20 rounded-xl space-y-1">
                      <span className="text-purple-300 font-bold block">3. SEAL BOOST</span>
                      <p className="text-zinc-400 font-sans text-[11px]">Passive bonuses unsealed from Power Seals and equipped Class job titles.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> Interactive Attribute Filter on Dashboard
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans">
                    On the <strong className="text-white">Dashboard</strong>, clicking any attribute card inside the <em>Core Attribute Capabilities Matrix</em> opens its detailed breakdown panel AND automatically filters your <strong>Operational Directives Board</strong> to show only quests related to that stat!
                  </p>
                </div>
              </div>
            )}

            {/* 3. OPERATIONS & DIRECTIVES */}
            {activeSection === 'operations' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                    <Swords className="h-5 w-5 text-emerald-400" />
                    3. Operations, Directives & Focus Engine
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Quests, Boss Battles, Recurring Habits, and the Pomodoro Focus Session overlay.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-cyan-400">MAIN & BOSS QUESTS</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded">HIGH XP</span>
                    </div>
                    <p className="text-zinc-400 font-sans text-[11px]">Major operational milestones and complex tasks. Completing them rewards higher XP and grants Luminescent Coins.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-emerald-400">HABITS & RECURRING DIRECTIVES</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">STREAK TRACKING</span>
                    </div>
                    <p className="text-zinc-400 font-sans text-[11px]">Daily or custom recurring routines. Completing habits daily increases your operational streak counter.</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/90 border border-cyan-500/30 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Timer className="h-4 w-4 text-cyan-400" /> Integrated Focus Session (Pomodoro Engine)
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans">
                    Click the <strong className="text-cyan-300 font-mono">FOCUS TIMER</strong> button in the left sidebar or top mobile header to launch a Pomodoro session.
                  </p>
                  <ul className="text-xs text-zinc-400 font-sans space-y-1 list-disc list-inside">
                    <li>Choose focus durations (e.g. 25m, 45m, 60m).</li>
                    <li>Link the session to an active quest to gain bonus XP upon completion.</li>
                    <li>Toggle ambient focus audio or sound indicators.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. STRATEGY, GOALS & SOPs */}
            {activeSection === 'strategy' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    4. Strategic Frameworks, Goals & SOPs
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Align daily operational quests with long-term strategic goals, project folders, and mental decision models.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-amber-300 uppercase block">1. Goals Hub</span>
                    <p className="text-zinc-400 font-sans">Define high-level strategic tracks (e.g., "Master Full-Stack Engineering", "Physical Conditioning"). Each goal contains linked projects and directives that automatically drive progress bars.</p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-blue-300 uppercase block">2. Projects Folders</span>
                    <p className="text-zinc-400 font-sans">Group operational tasks into structured project directories with deadlines, milestones, and target completion dates.</p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-purple-300 uppercase block">3. Strategic Models & SOPs</span>
                    <p className="text-zinc-400 font-sans">Access interactive mental frameworks in <strong>Strategic Models</strong> (Eisenhower Matrix, OKRs, Pareto 80/20, First Principles, SWOT) and document Standard Operating Procedures in <strong>Planning & SOPs</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MASTERY, SEALS & REWARDS */}
            {activeSection === 'mastery' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-pink-400" />
                    5. Skills Tree, Power Seals & Reward Shop
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Leveling competencies, breaking latent power seals, and redeeming earned Luminescent Coins.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-pink-400 font-bold block">SKILLS TREE</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Track skills like Programming, Writing, Fitness, or Languages. Log practice time to gain skill XP and level up.</p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-purple-400 font-bold block">POWER SEALS</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Unseal latent power thresholds as your level grows. Provides passive percentage multipliers to XP and stats.</p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-amber-400 font-bold block">REWARD SHOP</span>
                    <p className="text-zinc-400 font-sans text-[11px]">Spend earned Luminescent Coins on real-life treats, custom rewards, or operational system perks.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ANALYTICS & SYSTEM CONTROL */}
            {activeSection === 'analytics-system' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-400" />
                    6. Analytics, Spiderweb Graph & System Control
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Performance telemetries, node network graph, and system override baseline controls.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-cyan-400 uppercase block">Analytics & Telemetry</span>
                    <p className="text-zinc-400 font-sans">View sustained attribute radar charts, weekly completion velocity, XP distribution, and historical logs.</p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-purple-400 uppercase block">Spiderweb Node Graph</span>
                    <p className="text-zinc-400 font-sans">An interactive canvas that visually connects all Goals, Projects, Quests, and Skills into a dynamic node web.</p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-amber-300 uppercase block">System Control & Baseline Override</span>
                    <p className="text-zinc-400 font-sans">In <strong>System Control</strong>, you can change your Class Title, edit starting attribute baselines, backup/restore JSON state, or reset data safely.</p>
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
            <span>Click any tab above to jump directly to that module.</span>
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
