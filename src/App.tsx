import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './POSContext';
import { getLocalDateString } from './initialState';
import { getActiveJob, getActiveTitle } from './jobsAndTitles';
import { DashboardView } from './components/DashboardView';
import { StrategyCodexView } from './components/StrategyCodexView';
import { GoalsView } from './components/GoalsView';
import { ProjectsView } from './components/ProjectsView';
import { PlanningView } from './components/PlanningView';
import { FrameworksView } from './components/FrameworksView';
import { OracleSystemView, OracleSystemSubTab } from './components/OracleSystemView';
import { QuestsView } from './components/QuestsView';
import { SkillsView } from './components/SkillsView';
import { RewardShopView } from './components/RewardShopView';
import { MuhasabahView } from './components/MuhasabahView';
import { SpiritualTrackerView } from './components/SpiritualTrackerView';
import { SystemMessageBox } from './components/SystemMessageBox';
import { NotificationToastSystem } from './components/NotificationToastSystem';
import { FocusTimerOverlay } from './components/FocusTimerOverlay';
import { SpiderwebGraph } from './components/SpiderwebGraph';
import { LuminescentOreLogo } from './components/LuminescentOreLogo';
import { SystemGuideModal } from './components/SystemGuideModal';
import { RubElHizbIcon } from './components/IslamicRpgDecorations';
import { scanAllDelayedItems } from './utils/delayedTaskScanner';
import { 
  Activity, Target, Briefcase, Award, BarChart3, Settings, 
  Terminal, Shield, Flame, Clock, Menu, X, Pickaxe, Swords,
  Calendar, ChevronLeft, ChevronRight, Gem, Cloud, CloudOff, RefreshCw, FolderOpen, Compass,
  Inbox, Timer, Bell, Network, Sparkles, ShoppingBag, Coins, Gift, BatteryCharging, Battery, Zap,
  BookOpen, HelpCircle, Lock, Scale, Moon, Layers, Palette, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabId = 'dashboard' | 'quests' | 'spiritual' | 'muhasabah' | 'strategy_codex' | 'skills' | 'shop' | 'oracle_system' | 'spiderweb' | 'goals' | 'projects' | 'planning' | 'frameworks' | 'analytics' | 'system' | 'appearance';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideInitialSection, setGuideInitialSection] = useState<string>('getting-started');

  const openGuide = (section?: string) => {
    if (section) setGuideInitialSection(section);
    setIsGuideModalOpen(true);
  };

  const { 
    state, getPlayerLevelInfo, systemDate, setSystemDate, syncWithRealClock, 
    activeFocusSession, isShopLocked, visualCodex
  } = usePOS();
  
  const unreadMessagesCount = (state.messages || []).filter(m => !m.read).length;
  const delayedDirectivesCount = (state.messages || []).filter(m => m.category === 'delayed' && !m.read).length;
  const delayedScan = scanAllDelayedItems(state);
  const totalOverdueCount = delayedScan.totalDelayedCount;
  const activeQuestsCount = (state.quests || []).filter(q => q.status === 'Active').length;

  const playerInfo = getPlayerLevelInfo();
  const activeJob = getActiveJob(state.profile.jobId, state.customJobs || [], state.deletedJobIds || []);
  const activeTitle = getActiveTitle(state.profile.equippedTitleId, state.customTitles || [], state.deletedTitleIds || []);

  const realTodayDate = getLocalDateString();
  const isRealTodaySynced = systemDate === realTodayDate;

  const shiftDate = (days: number) => {
    try {
      const [y, m, d] = systemDate.split('-').map(Number);
      const current = new Date(y, m - 1, d);
      current.setDate(current.getDate() + days);
      setSystemDate(getLocalDateString(current));
    } catch (e) {
      console.error(e);
    }
  };

  // Keep system clock ticking
  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navCategories = [
    {
      title: 'DIVINE OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Sanctum Terminal', icon: Activity, desc: 'Central command & daily progress hub' },
        { id: 'quests', label: 'Directives & Rhythms', icon: Swords, desc: 'Active sacred decrees & recurring rhythms' },
        { id: 'spiritual', label: 'Sacred Protocol & Hijri', icon: Moon, desc: '5 Salaats, Adhkār, Salawāt, Qiyām & Hijri calendar' },
        { id: 'muhasabah', label: 'Muhāsabah', icon: Scale, desc: 'Self-accountability audit, reflections & weaknesses' },
      ]
    },
    {
      title: 'STRATEGY & CODEX',
      items: [
        { id: 'strategy_codex', label: 'Strategic Matrix Hub', icon: Compass, desc: 'Unified Grand Destinies, Campaigns, SOPs & Strategic Models' },
        { id: 'goals', label: 'Grand Destinies', icon: Target, desc: '30-Day, Quarterly & Long-term Visions' },
        { id: 'projects', label: 'Campaigns & Milestones', icon: Briefcase, desc: 'Execution sprints, deliverables & risk registers' },
        { id: 'planning', label: '10-Folder Codex Vault', icon: FolderOpen, desc: 'Foundational doctrine, SOPs, specs & architecture' },
        { id: 'frameworks', label: 'Strategic Thinking Lab', icon: Layers, desc: '11 Interactive Decision & Optimization Engines' },
      ]
    },
    {
      title: 'MASTERY & PROGRESSION',
      items: [
        { id: 'skills', label: 'Skills & Competencies', icon: Award, desc: 'Core mastery & competency tracks' },
        { id: 'shop', label: 'Imperial Vault', icon: ShoppingBag, desc: 'Channel gold dinars into bounties & perks' }
      ]
    },
    {
      title: 'SANCTUM OBSERVATORY',
      items: [
        { id: 'appearance', label: 'Visual Codex (Appearance)', icon: Palette, desc: 'Themes, ornamentation, glow & interface density' },
        { id: 'analytics', label: 'Resonance Analytics', icon: BarChart3, desc: 'Empirical analytics, XP trends & consistency' },
        { id: 'spiderweb', label: 'Constellation Net', icon: Network, desc: 'Interactive neural relationship map' },
        { id: 'system', label: 'Sanctum Engine & Backups', icon: Settings, desc: 'Data export, JSON restore & system maintenance' },
      ]
    }
  ];

  const allNavItems = navCategories.flatMap(c => c.items);

  return (
    <div 
      className="min-h-screen bg-[#07080c] islamic-girih-bg text-zinc-300 flex flex-col md:flex-row font-sans selection:bg-[var(--accent-primary)]/30 selection:text-[var(--accent-highlight)]" 
      id="pos-application-container"
      data-theme={visualCodex?.theme || 'imperial-gold'}
      data-ornamentation={visualCodex?.ornamentation || 'standard'}
      data-glow={visualCodex?.glow || 'standard'}
      data-density={visualCodex?.density || 'standard'}
      data-reduced-motion={visualCodex?.reducedMotion ? 'true' : 'false'}
    >
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="md:hidden glass-panel border-b border-[var(--border-subtle)] px-2.5 sm:px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 bg-[var(--bg-void)]/95 backdrop-blur-md shadow-md" id="mobile-top-bar">
        {/* BRAND LOGO (IDENTICAL TO PC SIDEBAR LOGO) */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none shrink-0"
          title="Return to Command Center"
        >
          <LuminescentOreLogo className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-base font-black tracking-widest text-[var(--accent-highlight)] truncate leading-none">PALE ORE</h1>
            <p className="text-[9px] font-mono text-[var(--accent-bright)] tracking-widest mt-1 flex items-center gap-1 leading-none">
              <RubElHizbIcon className="h-2 w-2 shrink-0" /> PROGRESS_OS v2.6
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {/* Vault Dinars counter */}
          <button
            onClick={() => setActiveTab('shop')}
            className="px-2 py-1 bg-[var(--accent-surface)]/80 border border-[var(--border-accent)] rounded-lg text-[10px] font-mono font-bold text-[var(--accent-highlight)] flex items-center gap-1 cursor-pointer active:scale-95 transition"
            title="Imperial Vault Dinars"
          >
            <span>🪙 {state.profile.coins ?? 150}</span>
          </button>

          {/* Guide */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-accent)] text-[var(--accent-bright)] rounded-lg hover:border-[var(--border-strong)] active:scale-95 transition cursor-pointer"
            title="System Manual & Guide"
          >
            <BookOpen className="h-4 w-4" />
          </button>

          {/* Focus Timer */}
          <button
            onClick={() => setIsFocusModalOpen(true)}
            className="p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center bg-[var(--bg-surface)] border border-cyan-500/30 text-cyan-400 rounded-lg relative active:scale-95 transition cursor-pointer"
            title="Focus Timer"
          >
            <Timer className="h-4 w-4" />
            {activeFocusSession && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* System Inbox */}
          <button
            onClick={() => setIsInboxModalOpen(true)}
            className="p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-accent)] text-[var(--accent-bright)] rounded-lg relative active:scale-95 transition cursor-pointer"
            title="Sacred Communiqués & Overdue Tasks"
          >
            <Inbox className="h-4 w-4" />
            {totalOverdueCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" title={`${totalOverdueCount} overdue directives!`} />
            ) : unreadMessagesCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--accent-bright)] animate-ping" />
            ) : null}
          </button>

          {/* Menu Drawer Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-300 hover:text-[var(--accent-bright)] p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg bg-[var(--bg-surface)] border border-white/10 active:scale-95 transition ml-0.5 cursor-pointer"
            id="mobile-menu-toggle"
            title="Toggle Codex Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[54px] inset-x-0 bg-[#07080c]/98 backdrop-blur-2xl border-b border-[var(--border-subtle)] z-40 p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto shadow-2xl"
            id="mobile-navigation-drawer"
          >
            {/* Operator Signature Quick Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-surface)] to-[var(--bg-void)] border border-[var(--border-accent)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent-surface)] border border-[var(--border-accent)]">
                    <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
                  </div>
                  <div>
                    <div className="text-xs font-display font-bold text-white uppercase tracking-wide">
                      {activeTitle.name ? `${activeTitle.badge} ${activeTitle.name}` : 'SOLE PROGRESSOR'}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--accent-bright)]">
                      [{activeTitle.badge}] {activeTitle.name} • {playerInfo.rank}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    🔥 {state.profile.momentum}%
                  </span>
                </div>
              </div>

              {/* Mini XP progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                  <span>LVL {playerInfo.level} ({playerInfo.totalXp} XP)</span>
                  <span className="text-[var(--accent-bright)]">{playerInfo.xpUntilNextLevel} XP to Next</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-[var(--accent-dim)] to-[var(--accent-bright)] h-full transition-all"
                    style={{ width: `${playerInfo.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* NAVIGATION MODULE CATEGORIES */}
            {navCategories.map(cat => (
              <div key={cat.title} className="space-y-1.5">
                <div className="text-[9px] font-mono font-bold text-[var(--accent-bright)] tracking-widest uppercase px-1 flex items-center gap-1.5">
                  <RubElHizbIcon className="h-2 w-2 text-[var(--accent-bright)]" />
                  {cat.title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isQuests = item.id === 'quests';
                    const hasOverdue = isQuests && totalOverdueCount > 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as TabId);
                          setMobileMenuOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[var(--accent-surface)] border-[var(--border-accent)] text-[var(--accent-highlight)] font-bold shadow-[0_0_12px_var(--glow-color)]' 
                            : 'bg-[var(--bg-surface)] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--accent-bright)]' : 'text-zinc-500'}`} />
                          <span className="text-xs font-sans font-medium truncate">{item.label}</span>
                        </div>
                        {hasOverdue ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 shrink-0 animate-pulse">
                            {totalOverdueCount}
                          </span>
                        ) : item.id === 'shop' && isShopLocked ? (
                          <Lock className="h-3 w-3 text-rose-400 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick clock & Date Picker in mobile menu */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-[var(--accent-bright)] font-bold">
                  <Clock className="h-3 w-3 text-[var(--accent-bright)]" />
                  SYS TIME
                </span>
                <span className="text-zinc-200 font-bold">{systemTime.toLocaleTimeString()}</span>
              </div>

              {/* TOUCH-OPTIMIZED MOBILE DATE CONTROLLER */}
              <div className="flex flex-col gap-2 w-full bg-[var(--bg-surface)] border border-[var(--border-accent)] rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[var(--accent-bright)] font-bold">
                    <Calendar className="h-3.5 w-3.5 text-[var(--accent-bright)] shrink-0" />
                    <span>SANCTUM DATE ENGINE</span>
                  </div>
                  <button
                    onClick={syncWithRealClock}
                    className={`text-[9px] font-mono px-2.5 py-1 rounded-lg border uppercase font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isRealTodaySynced 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                        : 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] hover:bg-[var(--accent-surface-hover)]'
                    }`}
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                    {isRealTodaySynced ? 'TODAY SYNCED' : 'SYNC TODAY'}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 bg-[var(--bg-void)] p-1.5 rounded-lg border border-white/5">
                  <button 
                    onClick={() => shiftDate(-1)} 
                    className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-[var(--accent-bright)] rounded-lg border border-white/5 transition shrink-0 active:scale-95 cursor-pointer"
                    title="Previous Day"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="date"
                    value={systemDate || ''}
                    onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-transparent text-[var(--accent-bright)] font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[var(--border-accent)] rounded px-2 py-2 cursor-pointer w-full h-[40px]"
                  />
                  <button 
                    onClick={() => shiftDate(1)} 
                    className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-[var(--accent-bright)] rounded-lg border border-white/5 transition shrink-0 active:scale-95 cursor-pointer"
                    title="Next Day"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP PERMANENT NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[var(--bg-void)]/90 border-r border-[var(--border-subtle)] p-4 shrink-0 h-screen sticky top-0 overflow-y-auto backdrop-blur-md" id="desktop-sidebar-pane">
        <div className="space-y-4">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <LuminescentOreLogo className="h-8 w-8" />
            <div>
              <h1 className="font-display text-base font-black tracking-widest text-[var(--accent-highlight)]">PALE ORE</h1>
              <p className="text-[9px] font-mono text-[var(--accent-bright)] tracking-widest mt-0.5 flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2" /> PROGRESS_OS v2.6
              </p>
            </div>
          </div>

          {/* SIMPLIFIED DESKTOP SYSTEM DATE CONTROLLER (SIDEBAR) */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-accent)] rounded-lg p-2.5 space-y-1.5 shadow-[0_0_15px_var(--glow-color)]" id="simulated-date-picker-widget">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[var(--accent-bright)] font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[var(--accent-bright)] shrink-0" />
                SYS DATE
              </span>
              <button
                onClick={syncWithRealClock}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                  isRealTodaySynced 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                    : 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] hover:bg-[var(--accent-surface-hover)]'
                }`}
                title={isRealTodaySynced ? "Synchronized with system clock" : "Click to sync with real system clock"}
                id="sys-date-sync-btn"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
              </button>
            </div>

            {/* DIRECT DATE INPUT AND NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between gap-1 bg-[var(--bg-void)] p-1 rounded border border-[var(--border-subtle)]">
              <button 
                onClick={() => shiftDate(-1)} 
                className="p-1 hover:bg-[var(--bg-card-hover)] text-zinc-400 hover:text-[var(--accent-bright)] rounded transition shrink-0"
                title="Previous Day"
                id="sys-date-shift-prev"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <input
                type="date"
                value={systemDate || ''}
                onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-transparent text-[var(--accent-bright)] font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[var(--border-accent)] rounded px-1 py-0.5 cursor-pointer w-full"
                id="sys-date-input"
                title="Click or use arrow keys to change system date"
              />

              <button 
                onClick={() => shiftDate(1)} 
                className="p-1 hover:bg-[var(--bg-card-hover)] text-zinc-400 hover:text-[var(--accent-bright)] rounded transition shrink-0"
                title="Next Day"
                id="sys-date-shift-next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ACTIVE OPERATOR STATUS MINI-WIDGET */}
          <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg space-y-2 relative overflow-hidden">
            {/* Subtle corner flourish */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-30">
              <RubElHizbIcon className="w-8 h-8 text-[var(--accent-bright)]" />
            </div>

            <div className="flex justify-between items-center relative z-10">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2" /> SYS_OPERATOR
              </span>
              <span className="text-[8px] font-mono text-[var(--accent-highlight)] font-black tracking-wider uppercase bg-[var(--accent-surface)] px-1.5 py-0.5 rounded border border-[var(--border-accent)]">
                {playerInfo.rank}
              </span>
            </div>
            
            <div className="flex justify-between items-baseline relative z-10">
              <span className="text-xs font-display font-bold text-zinc-300">Level {playerInfo.level}</span>
              <span className="text-[10px] font-mono text-[var(--accent-bright)]">{playerInfo.totalXp} XP</span>
            </div>

            <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="rpg-progress-gold h-full rounded" style={{ width: `${playerInfo.progress}%` }} />
            </div>

            {/* Active Class & Title Badge in Sidebar */}
            <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-0.5 relative z-10">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">CLASS:</span>
                <span className="text-purple-300 font-bold truncate max-w-[110px]">{activeJob.name}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">TITLE:</span>
                <span className="text-[var(--accent-bright)] font-bold truncate max-w-[110px]">[{activeTitle.badge}]</span>
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-4" id="desktop-sidebar-nav">
            {navCategories.map((cat) => (
              <div key={cat.title} className="space-y-1">
                <div className="text-[9px] font-mono font-bold text-[var(--accent-bright)] tracking-widest uppercase px-2 mb-1 flex items-center gap-1.5">
                  <RubElHizbIcon className="h-2 w-2" />
                  {cat.title}
                </div>
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabId)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 relative ${
                        isActive 
                          ? 'text-[var(--accent-highlight)] font-bold bg-gradient-to-r from-[var(--accent-surface)] via-[var(--bg-card-hover)] to-[var(--bg-surface)] border-l-2 border-[var(--accent-primary)] shadow-sm' 
                          : 'text-zinc-400 border-l-2 border-transparent hover:text-zinc-200 hover:bg-white/[0.03]'
                      }`}
                      id={`nav-${item.id}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--accent-bright)]' : 'text-zinc-500'}`} />
                        <span className="font-sans font-medium">{item.label}</span>
                      </div>
                      
                      {item.id === 'shop' && isShopLocked ? (
                        <span className="px-1.5 py-0.2 text-[8px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30 rounded font-bold flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5" /> LOCKED
                        </span>
                      ) : isActive ? (
                        <RubElHizbIcon className="h-2.5 w-2.5 text-[var(--accent-bright)] shrink-0" filled />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* QUICK TERMINAL ACTIONS (POMODORO, SYSTEM INBOX & MANUAL) */}
          <div className="pt-2 space-y-1.5 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setIsFocusModalOpen(true)}
              className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all border ${
                activeFocusSession
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Timer className={`h-4 w-4 ${activeFocusSession ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}`} />
                <span>FOCUS TIMER</span>
              </div>
              {activeFocusSession ? (
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {Math.floor(activeFocusSession.timeLeft / 60)}M
                </span>
              ) : (
                <span className="text-[9px] text-zinc-600">OFF</span>
              )}
            </button>

            <button
              onClick={() => setIsInboxModalOpen(true)}
              className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all border ${
                unreadMessagesCount > 0
                  ? 'bg-[var(--accent-surface)] border-[var(--border-accent)] text-[var(--accent-highlight)] font-bold'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Inbox className={`h-4 w-4 ${unreadMessagesCount > 0 ? 'text-[var(--accent-bright)]' : 'text-zinc-500'}`} />
                <span>SYSTEM INBOX</span>
              </div>
              {unreadMessagesCount > 0 ? (
                <span className="text-[9px] bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                  {unreadMessagesCount} NEW
                </span>
              ) : (
                <span className="text-[9px] text-zinc-600">0</span>
              )}
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all border bg-[var(--bg-card)] border-[var(--border-accent)] text-[var(--accent-highlight)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] font-bold"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--accent-bright)]" />
                <span>SYSTEM MANUAL</span>
              </div>
              <span className="text-[8px] bg-[var(--accent-surface)] text-[var(--accent-bright)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">GUIDE</span>
            </button>
          </div>

        </div>

        {/* SIDEBAR FOOTER (CLOCK & RECOVERY BADGE) */}
        <div className="border-t border-[var(--border-subtle)] pt-3 mt-3 space-y-1.5">
          {state.profile.recoveryMode && (
            <div className="bg-[var(--accent-surface)] border border-[var(--border-accent)] text-[var(--accent-bright)] text-[10px] font-mono px-2 py-0.5 rounded text-center animate-pulse uppercase font-bold">
              RECOVERY_PROTOCOL_ON
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
            <span className="flex items-center gap-1 text-[var(--accent-bright)]">
              <Clock className="h-3 w-3 text-[var(--accent-bright)]" />
              SYS TIME
            </span>
            <span className="text-zinc-300 font-bold">{systemTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP SYSTEM HEADER BAR FOR DESKTOP */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-void)]/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <RubElHizbIcon className="h-4 w-4 text-[var(--accent-bright)]" />
            <span className="text-sm font-display font-bold text-[var(--accent-highlight)] uppercase tracking-widest">
              {allNavItems.find(n => n.id === activeTab)?.label || activeTab}
            </span>
          </div>

          {/* DESKTOP TOP-RIGHT PROMINENT SYSTEM DATE & TIME CONTROLLER */}
          <div className="flex items-center gap-3">
            {/* SYSTEM GUIDE / MANUAL BUTTON */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-[10px] font-mono px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition bg-[var(--bg-card)] text-[var(--accent-highlight)] border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] shadow-[0_0_12px_var(--glow-color)]"
              title="Open System Usage Guide & Manual"
            >
              <BookOpen className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
              <span>SYSTEM GUIDE</span>
            </button>

            {/* REWARD SHOP COIN BUTTON */}
            <button
              onClick={() => setActiveTab('shop')}
              className="text-[10px] font-mono px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] hover:bg-[var(--accent-surface-hover)] shadow-[0_0_12px_var(--glow-color)]"
              title="Open Reward Shop & Vouchers"
            >
              <Coins className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
              <span>{state.profile.coins ?? 150} COINS</span>
            </button>

            <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-accent)] rounded-lg px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-[var(--accent-bright)] shrink-0" />
              <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase font-bold">SYS DATE:</span>
              
              <button 
                onClick={() => shiftDate(-1)}
                className="p-1 hover:bg-[var(--bg-card-hover)] text-zinc-400 hover:text-[var(--accent-bright)] rounded transition"
                title="Previous Day"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <input
                type="date"
                value={systemDate || ''}
                onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-transparent text-[var(--accent-bright)] font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[var(--border-accent)] rounded px-1 py-0.5 cursor-pointer"
              />

              <button 
                onClick={() => shiftDate(1)}
                className="p-1 hover:bg-[var(--bg-card-hover)] text-zinc-400 hover:text-[var(--accent-bright)] rounded transition"
                title="Next Day"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={syncWithRealClock}
                className={`ml-1 text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                  isRealTodaySynced 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-[var(--accent-surface)] text-[var(--accent-highlight)] border border-[var(--border-accent)] hover:bg-[var(--accent-surface-hover)]'
                }`}
                title={isRealTodaySynced ? "Synchronized with system clock" : "Click to sync with real system clock"}
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-[var(--accent-bright)] shrink-0" />
              <span>{systemTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full" id="pos-main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab as TabId)} />}
              {activeTab === 'quests' && <QuestsView />}
              {activeTab === 'spiritual' && <SpiritualTrackerView onNavigate={(tab) => setActiveTab(tab as TabId)} onOpenGuide={openGuide} />}
              {activeTab === 'muhasabah' && <MuhasabahView onNavigate={(tab) => setActiveTab(tab as TabId)} onOpenGuide={openGuide} />}
              {activeTab === 'strategy_codex' && (
                <StrategyCodexView onNavigate={(tab) => setActiveTab(tab as TabId)} />
              )}
              {activeTab === 'goals' && <GoalsView />}
              {activeTab === 'projects' && <ProjectsView />}
              {activeTab === 'planning' && (
                <PlanningView onNavigate={(tab) => setActiveTab(tab as TabId)} />
              )}
              {activeTab === 'frameworks' && <FrameworksView />}
              {activeTab === 'skills' && <SkillsView />}
              {activeTab === 'shop' && <RewardShopView />}
              {(activeTab === 'oracle_system' || activeTab === 'analytics' || activeTab === 'system' || activeTab === 'appearance') && (
                <OracleSystemView 
                  initialSubTab={activeTab === 'appearance' ? 'appearance' : activeTab === 'system' ? 'system' : 'analytics'}
                  onNavigate={(tab) => setActiveTab(tab as TabId)}
                />
              )}
              {activeTab === 'spiderweb' && <SpiderwebGraph />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* SYSTEM PERSISTENT FOOTER BAR (Desktop) */}
        <footer className="hidden md:flex border-t border-[var(--border-subtle)] bg-[#07080c] px-4 py-2 text-[10px] font-mono text-zinc-500 items-center justify-between gap-2 z-30 shrink-0" id="pos-system-footer">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-zinc-400 font-medium tracking-wider flex items-center gap-1.5">
              <RubElHizbIcon className="h-2.5 w-2.5 text-[var(--accent-bright)]" />
              SYSTEM OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[var(--accent-bright)] uppercase tracking-widest font-mono">PALE ORE PROGRESS_OS</span>
          </div>
        </footer>

        {/* SACRED MOBILE BOTTOM NAVIGATION BAR */}
        <nav 
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07080c]/96 backdrop-blur-2xl border-t border-[var(--border-subtle)] pb-safe px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"
          id="mobile-bottom-dock"
        >
          {/* 1. Command */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer active:scale-95 ${
              activeTab === 'dashboard'
                ? 'text-[var(--accent-highlight)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-[var(--accent-surface)] border border-[var(--border-accent)]' : ''}`}>
              <LayoutGrid className={`h-4 w-4 ${activeTab === 'dashboard' ? 'text-[var(--accent-bright)]' : ''}`} />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight">Command</span>
          </button>

          {/* 2. Directives */}
          <button
            onClick={() => {
              setActiveTab('quests');
              setMobileMenuOpen(false);
            }}
            className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer active:scale-95 relative ${
              activeTab === 'quests'
                ? 'text-[var(--accent-highlight)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${activeTab === 'quests' ? 'bg-[var(--accent-surface)] border border-[var(--border-accent)]' : ''}`}>
              <Swords className={`h-4 w-4 ${activeTab === 'quests' ? 'text-[var(--accent-bright)]' : ''}`} />
              {totalOverdueCount > 0 ? (
                <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-amber-500 text-black font-mono font-black text-[9px] flex items-center justify-center animate-pulse">
                  {totalOverdueCount}
                </span>
              ) : activeQuestsCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-bright)]" />
              ) : null}
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight">Directives</span>
          </button>

          {/* 3. Sacred Protocol */}
          <button
            onClick={() => {
              setActiveTab('spiritual');
              setMobileMenuOpen(false);
            }}
            className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer active:scale-95 ${
              activeTab === 'spiritual'
                ? 'text-[var(--accent-highlight)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'spiritual' ? 'bg-[var(--accent-surface)] border border-[var(--border-accent)]' : ''}`}>
              <Moon className={`h-4 w-4 ${activeTab === 'spiritual' ? 'text-[var(--accent-bright)]' : ''}`} />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight">Protocol</span>
          </button>

          {/* 4. Mīzān */}
          <button
            onClick={() => {
              setActiveTab('muhasabah');
              setMobileMenuOpen(false);
            }}
            className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer active:scale-95 ${
              activeTab === 'muhasabah'
                ? 'text-[var(--accent-highlight)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'muhasabah' ? 'bg-[var(--accent-surface)] border border-[var(--border-accent)]' : ''}`}>
              <Scale className={`h-4 w-4 ${activeTab === 'muhasabah' ? 'text-[var(--accent-bright)]' : ''}`} />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight">Mīzān</span>
          </button>

          {/* 5. Codex Matrix / Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer active:scale-95 relative ${
              mobileMenuOpen
                ? 'text-[var(--accent-highlight)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${mobileMenuOpen ? 'bg-[var(--accent-surface)] border border-[var(--border-accent)]' : ''}`}>
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-[var(--accent-bright)]" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              {unreadMessagesCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight">Codex</span>
          </button>
        </nav>
      </div>

      {/* FOCUS TIMER OVERLAY WIDGET / MODAL */}
      <FocusTimerOverlay 
        isOpenModal={isFocusModalOpen} 
        onCloseModal={() => setIsFocusModalOpen(false)} 
      />

      {/* GLOBAL SYSTEM INBOX MODAL OVERLAY */}
      <AnimatePresence>
        {isInboxModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="max-w-2xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl overflow-hidden"
            >
              <SystemMessageBox 
                onClose={() => setIsInboxModalOpen(false)} 
                onNavigateToQuest={() => {
                  setActiveTab('quests');
                  setIsInboxModalOpen(false);
                }}
                onNavigateToGoal={() => {
                  setActiveTab('goals');
                  setIsInboxModalOpen(false);
                }}
                onNavigateToProject={() => {
                  setActiveTab('projects');
                  setIsInboxModalOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SYSTEM MANUAL & GUIDE MODAL */}
      <SystemGuideModal 
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as TabId)}
        initialSection={guideInitialSection}
      />

      {/* FLOATING NOTIFICATION TOAST SYSTEM */}
      <NotificationToastSystem onOpenInbox={() => setIsInboxModalOpen(true)} />

    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <AppContent />
    </POSProvider>
  );
}
