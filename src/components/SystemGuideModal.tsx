import React, { useState } from 'react';
import { 
  BookOpen, Activity, Swords, Target, Briefcase, Award, Sparkles, 
  ShoppingBag, Settings, Compass, X, HelpCircle, Cpu,
  Zap, Timer, Coins, ArrowRight, GitFork,
  Shield, ShieldAlert, AlertTriangle, RotateCcw, CheckCircle2, Flame, Trophy
} from 'lucide-react';
import { motion } from 'motion/react';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function SystemGuideModal({ isOpen, onClose, onNavigateTab }: SystemGuideModalProps) {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

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
      id: 'core-attributes',
      title: '2. Attributes & Math Engine',
      icon: Cpu,
      badge: 'MECHANICS',
      color: 'text-purple-400',
    },
    {
      id: 'operations',
      title: '3. Quest Categories & Recovery Engine',
      icon: Swords,
      badge: 'CATEGORIES & RECOVERY',
      color: 'text-emerald-400',
    },
    {
      id: 'strategy',
      title: '4. Goals, Projects & Mini-Breakdowns',
      icon: Target,
      badge: 'PLANNING',
      color: 'text-amber-400',
    },
    {
      id: 'strategic-models',
      title: '5. Decision Models & SOP Docs',
      icon: Compass,
      badge: 'MODELS',
      color: 'text-blue-400',
    },
    {
      id: 'mastery',
      title: '6. Skills, Seals & Ores Classification',
      icon: Award,
      badge: 'PROGRESSION',
      color: 'text-pink-400',
    },
    {
      id: 'shop-rewards',
      title: '7. Luminescent Ore Shop',
      icon: ShoppingBag,
      badge: 'REWARDS',
      color: 'text-amber-400',
    },
    {
      id: 'analytics-system',
      title: '8. Analytics, Node Canvas & Override',
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
                  </div>
                </div>
              </div>
            )}

            {/* 2. ATTRIBUTES & MATH ENGINE */}
            {activeSection === 'core-attributes' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-400" />
                    2. Attribute Matrix & Precision Mathematical Engine
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

            {/* 3. QUEST CATEGORIES & RECOVERY ENGINE */}
            {activeSection === 'operations' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Swords className="h-5 w-5 text-emerald-400" />
                    3. Directives Classification & System Recovery Mechanism
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

            {/* 4. GOALS, PROJECTS & MINI-BREAKDOWNS */}
            {activeSection === 'strategy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    4. Strategic Goals, Projects & Mini-Breakdowns
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

            {/* 5. STRATEGIC MODELS & SOP DOCS */}
            {activeSection === 'strategic-models' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Compass className="h-5 w-5 text-blue-400" />
                    5. Strategic Decision Models & SOP Planning Logs
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

            {/* 6. MASTERY, SEALS & ORES CLASSIFICATION */}
            {activeSection === 'mastery' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-pink-400" />
                    6. Skills Mastery, Power Seals & Ores Classification
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

                  <div className="p-3.5 bg-zinc-900/80 border border-cyan-500/20 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-cyan-300 uppercase block">3. Class Titles & Jobs</span>
                    <p className="text-zinc-300 font-sans">
                      Equip custom class titles and jobs to display unique badges and stat affinities across the operating system.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. LUMINESCENT SHOP */}
            {activeSection === 'shop-rewards' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-amber-400" />
                    7. Luminescent Ore Reward Shop & Vouchers
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

            {/* 8. ANALYTICS, NODE CANVAS & OVERRIDE */}
            {activeSection === 'analytics-system' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    8. Analytics, Spiderweb Node Canvas & System Override
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
