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
import { SystemMessageBox } from './components/SystemMessageBox';
import { FocusTimerOverlay } from './components/FocusTimerOverlay';
import { SpiderwebGraph } from './components/SpiderwebGraph';
import { LuminescentOreLogo } from './components/LuminescentOreLogo';
import { 
  Activity, Target, Briefcase, Award, BarChart3, Settings, 
  Terminal, Shield, Flame, Clock, Menu, X, Pickaxe, Swords,
  Calendar, ChevronLeft, ChevronRight, Gem, Cloud, CloudOff, RefreshCw, FolderOpen, Compass,
  Inbox, Timer, Bell, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabId = 'dashboard' | 'quests' | 'goals' | 'projects' | 'skills' | 'analytics' | 'spiderweb' | 'system' | 'planning' | 'frameworks';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);

  const { state, getPlayerLevelInfo, systemDate, setSystemDate, syncWithRealClock, activeFocusSession } = usePOS();
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

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: Activity, desc: 'Daily operations hub' },
    { id: 'planning', label: 'PLANNING', icon: FolderOpen, desc: 'Vision, strategies, & SOPs' },
    { id: 'frameworks', label: 'FRAMEWORKS', icon: Compass, desc: 'Interactive strategic models' },
    { id: 'quests', label: 'QUESTS', icon: Swords, desc: 'All active and recurring quests' },
    { id: 'goals', label: 'GOALS', icon: Target, desc: 'Long-term strategic tracks' },
    { id: 'projects', label: 'PROJECTS', icon: Briefcase, desc: 'Operational blocks' },
    { id: 'skills', label: 'SKILLS', icon: Award, desc: 'Competency tracks' },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3, desc: 'Performance logs' },
    { id: 'spiderweb', label: 'SPIDERWEB GRAPH', icon: Network, desc: 'Interactive component relationship map' },
    { id: 'system', label: 'SYSTEM', icon: Settings, desc: 'Direct manual override' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col md:flex-row font-sans selection:bg-cyan-500/30 selection:text-white" id="pos-application-container">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="md:hidden glass-panel border-b border-white/5 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <LuminescentOreLogo className="h-7 w-7" />
          <h1 className="font-display text-base font-bold tracking-wider text-white">PALE ORE</h1>
          <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
            LVL {playerInfo.level}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFocusModalOpen(true)}
            className="p-1.5 bg-zinc-900 border border-white/10 text-cyan-400 rounded relative"
            title="Focus Timer"
          >
            <Timer className="h-4 w-4" />
            {activeFocusSession && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setIsInboxModalOpen(true)}
            className="p-1.5 bg-zinc-900 border border-white/10 text-amber-400 rounded relative"
            title="System Inbox"
          >
            <Inbox className="h-4 w-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-400 hover:text-white p-1"
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
            className="md:hidden fixed top-[53px] inset-x-0 bg-zinc-950 border-b border-white/10 z-30 p-4 space-y-3"
            id="mobile-navigation-drawer"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabId);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-colors ${
                      isActive 
                        ? 'bg-zinc-900 border-cyan-500/30 text-white' 
                        : 'bg-zinc-950/50 border-white/5 text-zinc-400'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span className="text-xs font-mono font-bold tracking-wider">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick clock & Date Picker in mobile menu */}
            <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="h-3 w-3 text-cyan-400" />
                  SYS TIME
                </span>
                <span className="text-zinc-200 font-bold">{systemTime.toLocaleTimeString()}</span>
              </div>

              {/* SIMPLIFIED MOBILE DATE CONTROLLER */}
              <div className="flex flex-col gap-1.5 w-full bg-zinc-900 border border-white/10 rounded-lg p-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>SYS DATE</span>
                  </div>
                  <button
                    onClick={syncWithRealClock}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                      isRealTodaySynced 
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                    }`}
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                    {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1 bg-zinc-950 p-1 rounded border border-white/5">
                  <button 
                    onClick={() => shiftDate(-1)} 
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition shrink-0"
                    title="Previous Day"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="date"
                    value={systemDate || ''}
                    onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-transparent text-cyan-300 font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded px-1 py-0.5 cursor-pointer w-full"
                  />
                  <button 
                    onClick={() => shiftDate(1)} 
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition shrink-0"
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
      <aside className="hidden md:flex flex-col justify-between w-64 bg-zinc-950/60 border-r border-white/5 p-4 shrink-0 h-screen sticky top-0 overflow-y-auto" id="desktop-sidebar-pane">
        <div className="space-y-4">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <LuminescentOreLogo className="h-8 w-8" />
            <div>
              <h1 className="font-display text-base font-black tracking-wider text-white">PALE ORE</h1>
              <p className="text-[9px] font-mono text-cyan-400 tracking-widest mt-0.5">PROGRESS_OS v2.6</p>
            </div>
          </div>

          {/* SIMPLIFIED DESKTOP SYSTEM DATE CONTROLLER (SIDEBAR) */}
          <div className="bg-zinc-900/90 border border-cyan-500/30 rounded-lg p-2 space-y-1.5 shadow-[0_0_15px_rgba(6,182,212,0.08)]" id="simulated-date-picker-widget">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                SYS DATE
              </span>
              <button
                onClick={syncWithRealClock}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                  isRealTodaySynced 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/50 hover:bg-amber-900'
                }`}
                title={isRealTodaySynced ? "Synchronized with system clock" : "Click to sync with real system clock"}
                id="sys-date-sync-btn"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
              </button>
            </div>

            {/* DIRECT DATE INPUT AND NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between gap-1 bg-zinc-950 p-1 rounded border border-white/10">
              <button 
                onClick={() => shiftDate(-1)} 
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition shrink-0"
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
                className="bg-transparent text-cyan-300 font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded px-1 py-0.5 cursor-pointer w-full"
                id="sys-date-input"
                title="Click or use arrow keys to change system date"
              />

              <button 
                onClick={() => shiftDate(1)} 
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition shrink-0"
                title="Next Day"
                id="sys-date-shift-next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ACTIVE OPERATOR STATUS MINI-WIDGET */}
          <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">SYS_OPERATOR</span>
              <span className="text-[8px] font-mono text-cyan-400 font-black">{playerInfo.rank}</span>
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono text-zinc-400">Level {playerInfo.level}</span>
              <span className="text-[10px] font-mono text-zinc-500">{playerInfo.totalXp} XP</span>
            </div>

            <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded" style={{ width: `${playerInfo.progress}%` }} />
            </div>

            {/* Active Class & Title Badge in Sidebar */}
            <div className="pt-1 border-t border-white/5 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">CLASS:</span>
                <span className="text-purple-300 font-bold truncate max-w-[110px]">{activeJob.name}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">TITLE:</span>
                <span className="text-cyan-400 font-bold truncate max-w-[110px]">[{activeTitle.badge}]</span>
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1" id="desktop-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabId)}
                  className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all duration-150 relative ${
                    isActive 
                      ? 'text-white font-bold bg-white/[0.04] border-l-2 border-cyan-400' 
                      : 'text-zinc-500 border-l-2 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]'
                  }`}
                  id={`nav-${item.id}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  
                  {/* Active glowing cursor */}
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 glow-cyan shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* QUICK TERMINAL ACTIONS (POMODORO & SYSTEM INBOX) */}
          <div className="pt-2 space-y-1.5 border-t border-white/5">
            <button
              onClick={() => setIsFocusModalOpen(true)}
              className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-all border ${
                activeFocusSession
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-zinc-900/60 hover:bg-zinc-850 border-white/5 text-zinc-400 hover:text-white'
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
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 font-bold'
                  : 'bg-zinc-900/60 hover:bg-zinc-850 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Inbox className={`h-4 w-4 ${unreadMessagesCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>SYSTEM INBOX</span>
              </div>
              {unreadMessagesCount > 0 ? (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                  {unreadMessagesCount} NEW
                </span>
              ) : (
                <span className="text-[9px] text-zinc-600">0</span>
              )}
            </button>
          </div>

        </div>

        {/* SIDEBAR FOOTER (CLOCK & RECOVERY BADGE) */}
        <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5">
          {state.profile.recoveryMode && (
            <div className="bg-amber-950/30 border border-amber-500/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded text-center animate-pulse uppercase">
              RECOVERY_PROTOCOL_ON
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-cyan-400" />
              SYS TIME
            </span>
            <span className="text-zinc-300 font-bold">{systemTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP SYSTEM HEADER BAR FOR DESKTOP */}
        <header className="hidden md:flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              {navItems.find(n => n.id === activeTab)?.label || activeTab}
            </span>
          </div>

          {/* DESKTOP TOP-RIGHT PROMINENT SYSTEM DATE & TIME CONTROLLER */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-cyan-500/30 rounded-lg px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">SYS DATE:</span>
              
              <button 
                onClick={() => shiftDate(-1)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition"
                title="Previous Day"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <input
                type="date"
                value={systemDate || ''}
                onChange={(e) => e.target.value && setSystemDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-transparent text-cyan-300 font-mono font-bold text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded px-1 py-0.5 cursor-pointer"
              />

              <button 
                onClick={() => shiftDate(1)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition"
                title="Next Day"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={syncWithRealClock}
                className={`ml-1 text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 transition ${
                  isRealTodaySynced 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                }`}
                title={isRealTodaySynced ? "Synchronized with system clock" : "Click to sync with real system clock"}
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isRealTodaySynced ? '' : 'animate-spin'}`} />
                {isRealTodaySynced ? 'TODAY' : 'SYNC TODAY'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
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
              {activeTab === 'goals' && <GoalsView />}
              {activeTab === 'projects' && <ProjectsView />}
              {activeTab === 'skills' && <SkillsView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'spiderweb' && <SpiderwebGraph />}
              {activeTab === 'system' && <SystemView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* SYSTEM PERSISTENT FOOTER BAR */}
        <footer className="border-t border-white/5 bg-zinc-950 px-4 py-2 text-[10px] font-mono text-zinc-500 flex items-center justify-between gap-2 z-30 shrink-0" id="pos-system-footer">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-zinc-400 font-medium tracking-wider">SYSTEM OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono">PALE ORE POS v2.6</span>
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
