import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './POSContext';
import { getLocalDateString } from './initialState';
import { getActiveJob, getActiveTitle } from './jobsAndTitles';
import { DashboardView } from './components/DashboardView';
import { QuestsView } from './components/QuestsView';
import { GoalsView } from './components/GoalsView';
import { ProjectsView } from './components/ProjectsView';
import { SkillsView } from './components/SkillsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemView } from './components/SystemView';
import { PlanningView } from './components/PlanningView';
import { FrameworksView } from './components/FrameworksView';
import { SealingPowerView } from './components/SealingPowerView';
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
import { 
  Activity, Target, Briefcase, Award, BarChart3, Settings, 
  Terminal, Shield, Flame, Clock, Menu, X, Pickaxe, Swords,
  Calendar, ChevronLeft, ChevronRight, Gem, Cloud, CloudOff, RefreshCw, FolderOpen, Compass,
  Inbox, Timer, Bell, Network, Sparkles, ShoppingBag, Coins, Gift, BatteryCharging, Battery, Zap,
  BookOpen, HelpCircle, Lock, Scale, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabId = 'dashboard' | 'quests' | 'spiritual' | 'muhasabah' | 'goals' | 'projects' | 'skills' | 'seals' | 'shop' | 'analytics' | 'spiderweb' | 'system' | 'planning' | 'frameworks';

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
    activeFocusSession, isShopLocked
  } = usePOS();
  
  const unreadMessagesCount = (state.messages || []).filter(m => !m.read).length;

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
        { id: 'goals', label: 'Grand Destinies', icon: Target, desc: 'Long-term strategic horizons' },
        { id: 'projects', label: 'Campaigns', icon: Briefcase, desc: 'Operational execution blocks' },
        { id: 'planning', label: 'Codex & SOPs', icon: FolderOpen, desc: 'Vision, protocols, & doctrine' },
        { id: 'frameworks', label: 'Strategic Models', icon: Compass, desc: 'Interactive decision frameworks' },
      ]
    },
    {
      title: 'MASTERY & POWER',
      items: [
        { id: 'skills', label: 'Skills', icon: Award, desc: 'Core mastery & competency tracks' },
        { id: 'seals', label: 'Ores & Chains', icon: Pickaxe, desc: 'Shatter chains on luminescent ores for passive multipliers' },
        { id: 'shop', label: 'Imperial Vault', icon: ShoppingBag, desc: 'Channel gold dinars into bounties & perks' }
      ]
    },
    {
      title: 'SANCTUM INSIGHTS',
      items: [
        { id: 'analytics', label: 'Oracle Analytics', icon: BarChart3, desc: 'Resonance & empirical logs' },
        { id: 'spiderweb', label: 'Constellation Net', icon: Network, desc: 'Interactive neural relationship map' },
        { id: 'system', label: 'System Control', icon: Settings, desc: 'Direct core overrides & architecture' }
      ]
    }
  ];

  const allNavItems = navCategories.flatMap(c => c.items);

  return (
    <div className="min-h-screen bg-[#07080c] islamic-girih-bg text-zinc-300 flex flex-col md:flex-row font-sans selection:bg-[#c5a059]/30 selection:text-[#fef08a]" id="pos-application-container">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="md:hidden glass-panel border-b border-[#c5a059]/20 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 bg-[#07080c]/90">
        <div className="flex items-center gap-2">
          <LuminescentOreLogo className="h-7 w-7" />
          <h1 className="font-display text-sm font-bold tracking-widest text-[#fef08a]">PALE ORE</h1>
          <span className="text-[9px] font-mono bg-[#3a2e12]/60 text-[#e5c875] border border-[#c5a059]/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
            <RubElHizbIcon className="h-2.5 w-2.5" color="#e5c875" />
            LVL {playerInfo.level}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="p-1.5 bg-[#0b0d13] border border-[#c5a059]/30 text-[#e5c875] rounded hover:border-[#c5a059]"
            title="System Manual & Guide"
          >
            <BookOpen className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsFocusModalOpen(true)}
            className="p-1.5 bg-[#0b0d13] border border-cyan-500/30 text-cyan-400 rounded relative"
            title="Focus Timer"
          >
            <Timer className="h-4 w-4" />
            {activeFocusSession && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setIsInboxModalOpen(true)}
            className="p-1.5 bg-[#0b0d13] border border-[#c5a059]/30 text-[#e5c875] rounded relative"
            title="System Inbox"
          >
            <Inbox className="h-4 w-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#e5c875] animate-ping" />
            )}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-400 hover:text-[#e5c875] p-1 ml-1"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="md:hidden fixed top-[53px] inset-x-0 bg-[#07080c]/98 backdrop-blur-xl border-b border-[#c5a059]/20 z-30 p-4 space-y-4 max-h-[85vh] overflow-y-auto"
            id="mobile-navigation-drawer"
          >
            {navCategories.map(cat => (
              <div key={cat.title} className="space-y-1.5">
                <div className="text-[9px] font-mono font-bold text-[#c5a059] tracking-widest uppercase px-1 flex items-center gap-1.5">
                  <RubElHizbIcon className="h-2.5 w-2.5" />
                  {cat.title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as TabId);
                          setMobileMenuOpen(false);
                        }}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                          isActive 
                            ? 'bg-[#141824] border-[#c5a059]/60 text-[#fef08a] font-bold shadow-[0_0_12px_rgba(197,160,89,0.15)]' 
                            : 'bg-[#0b0d13] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
                          <span className="text-xs font-sans font-medium truncate">{item.label}</span>
                        </div>
                        {item.id === 'shop' && isShopLocked && (
                          <Lock className="h-3 w-3 text-rose-400 shrink-0 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick clock & Date Picker in mobile menu */}
            <div className="pt-2 border-t border-[#c5a059]/15 flex flex-col gap-2">
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-[#c5a059]">
                  <Clock className="h-3 w-3 text-[#e5c875]" />
                  SYS TIME
                </span>
                <span className="text-zinc-200 font-bold">{systemTime.toLocaleTimeString()}</span>
              </div>

              {/* SIMPLIFIED MOBILE DATE CONTROLLER */}
              <div className="flex flex-col gap-1.5 w-full bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg p-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#e5c875] font-bold">
                    <Calendar className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                    <span>SYS DATE</span>
                  </div>
                  <button
                    onClick={syncWithRealClock}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                      isRealTodaySynced 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                        : 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/60 hover:bg-[#524017]'
                    }`}
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                    {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1 bg-[#07080c] p-1 rounded border border-white/5">
                  <button 
                    onClick={() => shiftDate(-1)} 
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-[#e5c875] rounded transition shrink-0"
                    title="Previous Day"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="date"
                    value={systemDate || ''}
                    onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-transparent text-[#e5c875] font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#c5a059]/50 rounded px-1 py-0.5 cursor-pointer w-full"
                  />
                  <button 
                    onClick={() => shiftDate(1)} 
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-[#e5c875] rounded transition shrink-0"
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
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#07080c]/90 border-r border-[#c5a059]/20 p-4 shrink-0 h-screen sticky top-0 overflow-y-auto backdrop-blur-md" id="desktop-sidebar-pane">
        <div className="space-y-4">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 border-b border-[#c5a059]/20 pb-4">
            <LuminescentOreLogo className="h-8 w-8" />
            <div>
              <h1 className="font-display text-base font-black tracking-widest text-[#fef08a]">PALE ORE</h1>
              <p className="text-[9px] font-mono text-[#c5a059] tracking-widest mt-0.5 flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2" /> PROGRESS_OS v2.6
              </p>
            </div>
          </div>

          {/* SIMPLIFIED DESKTOP SYSTEM DATE CONTROLLER (SIDEBAR) */}
          <div className="bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg p-2.5 space-y-1.5 shadow-[0_0_15px_rgba(197,160,89,0.08)]" id="simulated-date-picker-widget">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#e5c875] font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
                SYS DATE
              </span>
              <button
                onClick={syncWithRealClock}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                  isRealTodaySynced 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                    : 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/60 hover:bg-[#524017]'
                }`}
                title={isRealTodaySynced ? "Synchronized with system clock" : "Click to sync with real system clock"}
                id="sys-date-sync-btn"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
              </button>
            </div>

            {/* DIRECT DATE INPUT AND NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between gap-1 bg-[#07080c] p-1 rounded border border-[#c5a059]/15">
              <button 
                onClick={() => shiftDate(-1)} 
                className="p-1 hover:bg-[#141824] text-zinc-400 hover:text-[#e5c875] rounded transition shrink-0"
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
                className="bg-transparent text-[#e5c875] font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#c5a059]/50 rounded px-1 py-0.5 cursor-pointer w-full"
                id="sys-date-input"
                title="Click or use arrow keys to change system date"
              />

              <button 
                onClick={() => shiftDate(1)} 
                className="p-1 hover:bg-[#141824] text-zinc-400 hover:text-[#e5c875] rounded transition shrink-0"
                title="Next Day"
                id="sys-date-shift-next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ACTIVE OPERATOR STATUS MINI-WIDGET */}
          <div className="p-3 bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg space-y-2 relative overflow-hidden">
            {/* Subtle corner flourish */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-30">
              <RubElHizbIcon className="w-8 h-8 text-[#c5a059]" />
            </div>

            <div className="flex justify-between items-center relative z-10">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2" /> SYS_OPERATOR
              </span>
              <span className="text-[8px] font-mono text-[#fef08a] font-black tracking-wider uppercase bg-[#3a2e12]/60 px-1.5 py-0.5 rounded border border-[#c5a059]/30">
                {playerInfo.rank}
              </span>
            </div>
            
            <div className="flex justify-between items-baseline relative z-10">
              <span className="text-xs font-display font-bold text-zinc-300">Level {playerInfo.level}</span>
              <span className="text-[10px] font-mono text-[#c5a059]">{playerInfo.totalXp} XP</span>
            </div>

            <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="rpg-progress-gold h-full rounded" style={{ width: `${playerInfo.progress}%` }} />
            </div>

            {/* Active Class & Title Badge in Sidebar */}
            <div className="pt-1.5 border-t border-[#c5a059]/15 space-y-0.5 relative z-10">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">CLASS:</span>
                <span className="text-purple-300 font-bold truncate max-w-[110px]">{activeJob.name}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">TITLE:</span>
                <span className="text-[#e5c875] font-bold truncate max-w-[110px]">[{activeTitle.badge}]</span>
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-4" id="desktop-sidebar-nav">
            {navCategories.map((cat) => (
              <div key={cat.title} className="space-y-1">
                <div className="text-[9px] font-mono font-bold text-[#c5a059] tracking-widest uppercase px-2 mb-1 flex items-center gap-1.5">
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
                          ? 'text-[#fef08a] font-bold bg-gradient-to-r from-[#c5a059]/20 via-[#141824] to-[#0b0d13] border-l-2 border-[#c5a059] shadow-sm' 
                          : 'text-zinc-400 border-l-2 border-transparent hover:text-zinc-200 hover:bg-white/[0.03]'
                      }`}
                      id={`nav-${item.id}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
                        <span className="font-sans font-medium">{item.label}</span>
                      </div>
                      
                      {item.id === 'shop' && isShopLocked ? (
                        <span className="px-1.5 py-0.2 text-[8px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30 rounded font-bold flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5" /> LOCKED
                        </span>
                      ) : isActive ? (
                        <RubElHizbIcon className="h-2.5 w-2.5 text-[#e5c875] shrink-0" filled />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* QUICK TERMINAL ACTIONS (POMODORO, SYSTEM INBOX & MANUAL) */}
          <div className="pt-2 space-y-1.5 border-t border-[#c5a059]/20">
            <button
              onClick={() => setIsFocusModalOpen(true)}
              className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all border ${
                activeFocusSession
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-[#0b0d13] hover:bg-[#141824] border-white/5 text-zinc-400 hover:text-white'
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
                  ? 'bg-[#3a2e12] border-[#c5a059]/60 text-[#fef08a] font-bold'
                  : 'bg-[#0b0d13] hover:bg-[#141824] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Inbox className={`h-4 w-4 ${unreadMessagesCount > 0 ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
                <span>SYSTEM INBOX</span>
              </div>
              {unreadMessagesCount > 0 ? (
                <span className="text-[9px] bg-[#c5a059]/20 text-[#fef08a] border border-[#c5a059]/50 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                  {unreadMessagesCount} NEW
                </span>
              ) : (
                <span className="text-[9px] text-zinc-600">0</span>
              )}
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all border bg-[#141824] border-[#c5a059]/40 text-[#fef08a] hover:bg-[#1c2233] hover:border-[#c5a059] font-bold"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#e5c875]" />
                <span>SYSTEM MANUAL</span>
              </div>
              <span className="text-[8px] bg-[#c5a059]/20 text-[#e5c875] px-1.5 py-0.5 rounded border border-[#c5a059]/30">GUIDE</span>
            </button>
          </div>

        </div>

        {/* SIDEBAR FOOTER (CLOCK & RECOVERY BADGE) */}
        <div className="border-t border-[#c5a059]/20 pt-3 mt-3 space-y-1.5">
          {state.profile.recoveryMode && (
            <div className="bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded text-center animate-pulse uppercase font-bold">
              RECOVERY_PROTOCOL_ON
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
            <span className="flex items-center gap-1 text-[#c5a059]">
              <Clock className="h-3 w-3 text-[#e5c875]" />
              SYS TIME
            </span>
            <span className="text-zinc-300 font-bold">{systemTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP SYSTEM HEADER BAR FOR DESKTOP */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[#c5a059]/20 bg-[#07080c]/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
            <span className="text-sm font-display font-bold text-[#fef08a] uppercase tracking-widest">
              {allNavItems.find(n => n.id === activeTab)?.label || activeTab}
            </span>
          </div>

          {/* DESKTOP TOP-RIGHT PROMINENT SYSTEM DATE & TIME CONTROLLER */}
          <div className="flex items-center gap-3">
            {/* SYSTEM GUIDE / MANUAL BUTTON */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-[10px] font-mono px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition bg-[#141824] text-[#fef08a] border-[#c5a059]/40 hover:bg-[#1c2233] hover:border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.1)]"
              title="Open System Usage Guide & Manual"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#e5c875]" />
              <span>SYSTEM GUIDE</span>
            </button>

            {/* REWARD SHOP COIN BUTTON */}
            <button
              onClick={() => setActiveTab('shop')}
              className="text-[10px] font-mono px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/60 hover:bg-[#524017] shadow-[0_0_12px_rgba(197,160,89,0.2)]"
              title="Open Reward Shop & Vouchers"
            >
              <Coins className="h-3.5 w-3.5 text-[#e5c875]" />
              <span>{state.profile.coins ?? 150} COINS</span>
            </button>

            <div className="flex items-center gap-2 bg-[#0b0d13] border border-[#c5a059]/30 rounded-lg px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
              <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">SYS DATE:</span>
              
              <button 
                onClick={() => shiftDate(-1)}
                className="p-1 hover:bg-[#141824] text-zinc-400 hover:text-[#e5c875] rounded transition"
                title="Previous Day"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <input
                type="date"
                value={systemDate || ''}
                onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-transparent text-[#e5c875] font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#c5a059]/50 rounded px-1 py-0.5 cursor-pointer"
              />

              <button 
                onClick={() => shiftDate(1)}
                className="p-1 hover:bg-[#141824] text-zinc-400 hover:text-[#e5c875] rounded transition"
                title="Next Day"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={syncWithRealClock}
                className={`ml-1 text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                  isRealTodaySynced 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-[#3a2e12] text-[#fef08a] border-[#c5a059]/60 hover:bg-[#524017]'
                }`}
                title={isRealTodaySynced ? "Synchronized with system clock" : "Click to sync with real system clock"}
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b0d13] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-[#c5a059] shrink-0" />
              <span>{systemTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full" id="pos-main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
              {activeTab === 'planning' && <PlanningView onNavigate={(tab) => setActiveTab(tab)} />}
              {activeTab === 'frameworks' && <FrameworksView />}
              {activeTab === 'quests' && <QuestsView />}
              {activeTab === 'spiritual' && <SpiritualTrackerView onNavigate={(tab) => setActiveTab(tab as TabId)} onOpenGuide={openGuide} />}
              {activeTab === 'muhasabah' && <MuhasabahView onNavigate={(tab) => setActiveTab(tab)} onOpenGuide={openGuide} />}
              {activeTab === 'goals' && <GoalsView />}
              {activeTab === 'projects' && <ProjectsView />}
              {activeTab === 'skills' && <SkillsView />}
              {activeTab === 'seals' && <SealingPowerView />}
              {activeTab === 'shop' && <RewardShopView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'spiderweb' && <SpiderwebGraph />}
              {activeTab === 'system' && <SystemView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* SYSTEM PERSISTENT FOOTER BAR */}
        <footer className="border-t border-[#c5a059]/15 bg-[#07080c] px-4 py-2 text-[10px] font-mono text-zinc-500 flex items-center justify-between gap-2 z-30 shrink-0" id="pos-system-footer">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-zinc-400 font-medium tracking-wider flex items-center gap-1.5">
              <RubElHizbIcon className="h-2.5 w-2.5 text-[#c5a059]" />
              SYSTEM OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[#c5a059] uppercase tracking-widest font-mono">PALE ORE PROGRESS_OS</span>
          </div>
        </footer>
      </div>

      {/* FOCUS TIMER OVERLAY WIDGET / MODAL */}
      <FocusTimerOverlay 
        isOpenModal={isFocusModalOpen} 
        onCloseModal={() => setIsFocusModalOpen(false)} 
      />

      {/* GLOBAL SYSTEM INBOX MODAL OVERLAY */}
      <AnimatePresence>
        {isInboxModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full"
            >
              <SystemMessageBox onClose={() => setIsInboxModalOpen(false)} />
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
