import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './POSContext';
import { DashboardView } from './components/DashboardView';
import { QuestsView } from './components/QuestsView';
import { GoalsView } from './components/GoalsView';
import { ProjectsView } from './components/ProjectsView';
import { SkillsView } from './components/SkillsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemView } from './components/SystemView';
import { LuminescentOreLogo } from './components/LuminescentOreLogo';
import { 
  Activity, Target, Briefcase, Award, BarChart3, Settings, 
  Terminal, Shield, Flame, Clock, Menu, X, Pickaxe, Swords,
  Calendar, ChevronLeft, ChevronRight, Gem, Cloud, CloudOff, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabId = 'dashboard' | 'quests' | 'goals' | 'projects' | 'skills' | 'analytics' | 'system';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  const { state, getPlayerLevelInfo, systemDate, setSystemDate, cloudSyncStatus } = usePOS();
  const playerInfo = getPlayerLevelInfo();

  const shiftDate = (days: number) => {
    try {
      const current = new Date(systemDate);
      current.setDate(current.getDate() + days);
      setSystemDate(current.toISOString().split('T')[0]);
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
    { id: 'quests', label: 'QUESTS', icon: Swords, desc: 'All active and recurring quests' },
    { id: 'goals', label: 'GOALS', icon: Target, desc: 'Long-term strategic tracks' },
    { id: 'projects', label: 'PROJECTS', icon: Briefcase, desc: 'Operational blocks' },
    { id: 'skills', label: 'SKILLS', icon: Award, desc: 'Competency tracks' },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3, desc: 'Performance logs' },
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
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-white p-1"
          id="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
            <div className="pt-2.5 border-t border-white/5 flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  SYS TIME
                </span>
                <span>{systemTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-1.5 mt-1">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>DATE:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => shiftDate(-1)} 
                    className="p-1 hover:bg-white/5 text-zinc-400 hover:text-white rounded transition"
                    title="Previous Day"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="date"
                    value={systemDate}
                    onChange={(e) => setSystemDate(e.target.value)}
                    className="bg-zinc-950 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button 
                    onClick={() => shiftDate(1)} 
                    className="p-1 hover:bg-white/5 text-zinc-400 hover:text-white rounded transition"
                    title="Next Day"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP PERMANENT NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-zinc-950/60 border-r border-white/5 p-5 shrink-0 h-screen sticky top-0" id="desktop-sidebar-pane">
        <div className="space-y-6">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 border-b border-white/5 pb-5">
            <LuminescentOreLogo className="h-9 w-9" />
            <div>
              <h1 className="font-display text-lg font-black tracking-wider text-white">PALE ORE</h1>
              <p className="text-[9px] font-mono text-cyan-400 tracking-widest mt-0.5">PROGRESS_OS v2.6</p>
            </div>
          </div>

          {/* ACTIVE OPERATOR STATUS MINI-WIDGET */}
          <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg space-y-2">
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

            <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-[8px] font-mono">
              <span className="text-zinc-500 uppercase">CLOUD_BACKUP</span>
              {cloudSyncStatus === 'synced' ? (
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  ONLINE
                </span>
              ) : cloudSyncStatus === 'syncing' ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-amber-400" />
                  SYNCING
                </span>
              ) : cloudSyncStatus === 'loading' ? (
                <span className="text-zinc-400 font-bold flex items-center gap-1">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-zinc-500" />
                  LOADING
                </span>
              ) : cloudSyncStatus === 'error' ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <CloudOff className="h-2.5 w-2.5" />
                  DISRUPTED
                </span>
              ) : (
                <span className="text-zinc-500">OFFLINE</span>
              )}
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1.5" id="desktop-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabId)}
                  className={`w-full flex items-center justify-between p-2.5 rounded text-xs font-mono transition-all duration-150 relative ${
                    isActive 
                      ? 'text-white font-bold bg-white/[0.03] border-l-2 border-cyan-400' 
                      : 'text-zinc-500 border-l-2 border-transparent hover:text-zinc-300 hover:bg-white/[0.01]'
                  }`}
                  id={`nav-${item.id}`}
                >
                  <div className="flex items-center gap-3">
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

        </div>

        {/* SIDEBAR FOOTER (CLOCK & RECOVERY BADGE) */}
        <div className="border-t border-white/5 pt-4 space-y-2">
          {state.profile.recoveryMode && (
            <div className="bg-amber-950/30 border border-amber-500/20 text-amber-400 text-[10px] font-mono px-2.5 py-1 rounded text-center animate-pulse uppercase">
              RECOVERY_PROTOCOL_ON
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              SYS TIME
            </span>
            <span>{systemTime.toLocaleTimeString()}</span>
          </div>

          {/* SIMULATED SYSTEM DATE CONTROLLER */}
          <div className="bg-zinc-900 border border-white/5 rounded-lg p-2.5 mt-2 space-y-1.5" id="simulated-date-picker-widget">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-cyan-400 shrink-0" />
                SYS_DATE
              </span>
              <span className="text-[9px] font-mono text-cyan-500 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10 uppercase tracking-widest font-black">
                OPERATIONAL
              </span>
            </div>

            <div className="flex items-center justify-between gap-1">
              <button 
                onClick={() => shiftDate(-1)} 
                className="p-1.5 bg-zinc-950/80 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded border border-white/5 transition shrink-0"
                title="Previous Day"
                id="sys-date-shift-prev"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              
              <div className="relative flex-1 group">
                <input
                  type="date"
                  value={systemDate}
                  onChange={(e) => setSystemDate(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-300 text-center focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-zinc-950"
                  id="sys-date-input"
                />
              </div>

              <button 
                onClick={() => shiftDate(1)} 
                className="p-1.5 bg-zinc-950/80 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded border border-white/5 transition shrink-0"
                title="Next Day"
                id="sys-date-shift-next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
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
            {activeTab === 'quests' && <QuestsView />}
            {activeTab === 'goals' && <GoalsView />}
            {activeTab === 'projects' && <ProjectsView />}
            {activeTab === 'skills' && <SkillsView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'system' && <SystemView />}
          </motion.div>
        </AnimatePresence>
      </main>

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
