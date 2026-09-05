import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { SystemMessageBox } from './SystemMessageBox';
import { VisualCodexSettingsView } from './VisualCodexSettingsView';
import { XPHistoryLedger } from './XPHistoryLedger';
import { TemporalLedgerView } from './TemporalLedgerView';
import { 
  BarChart3, Settings, Target, Award, Calendar, Flame, Activity, 
  TrendingUp, Clock, ShieldCheck, Zap, Network, Download, Upload, 
  RotateCcw, AlertTriangle, Check, ShieldAlert, Cpu, CheckCircle2,
  Inbox, Percent, Sparkles, RefreshCw, ChevronRight, Layers, Palette,
  FileSpreadsheet, Hourglass
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

export type OracleSystemSubTab = 'appearance' | 'analytics' | 'xp_history' | 'time_ledger' | 'system' | 'messages';

interface OracleSystemViewProps {
  initialSubTab?: OracleSystemSubTab;
  onNavigate?: (tab: string) => void;
}

export const OracleSystemView: React.FC<OracleSystemViewProps> = ({
  initialSubTab = 'analytics',
  onNavigate
}) => {
  const { 
    state, getAnalytics, getAttributes, exportData, importData, 
    resetAllData, resetLevelAndXp, clearAllQuests, resetBaselineAttributes, 
    updateAttributeBase, restartAttribute
  } = usePOS();

  const [activeSubTab, setActiveSubTab] = useState<OracleSystemSubTab>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (newTab: OracleSystemSubTab) => {
    setActiveSubTab(newTab);
    if (onNavigate) {
      onNavigate(newTab === 'messages' ? 'oracle_system' : newTab);
    }
  };

  // System Overrides State
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [showLevelResetConfirm, setShowLevelResetConfirm] = useState(false);
  const [showQuestsResetConfirm, setShowQuestsResetConfirm] = useState(false);
  const [showAttrResetConfirm, setShowAttrResetConfirm] = useState(false);

  const analytics = getAnalytics();
  const attributes = getAttributes();

  // Find max value in daily trend to scale chart height
  const maxTrendXp = Math.max(...analytics.dailyXpTrend.map((t: any) => t.xp), 100);

  // Consistency calculation: Percentage of active days in the last 7 days with earned XP
  const activeDaysCount = analytics.dailyXpTrend.filter((t: any) => t.xp > 0).length;
  const consistencyScore = Math.round((activeDaysCount / 7) * 100);

  const currentAttributes = getAttributes();
  const unreadMessagesCount = (state.messages || []).filter(m => !m.read).length;

  // Handle export click
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pale_ore_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle JSON Import
  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const success = importData(importJson);
    if (success) {
      setImportStatus('success');
      setImportJson('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  // Factory reset
  const handleReset = () => {
    resetAllData();
    setShowResetWarning(false);
  };

  return (
    <div className="space-y-6" id="oracle-system-unified-root">
      
      {/* UNIFIED HEADER */}
      <div className="border-b border-[#c5a059]/20 pb-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2.5">
              <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
              <span>ORACLE ANALYTICS & SYSTEM CONTROL</span>
            </h2>
            <p className="text-xs text-zinc-300 font-mono mt-1">
              SANCTUM_OBSERVATORY_CORE • Empirical resonance logs, core overrides & sanctum archive maintenance
            </p>
          </div>

          {/* QUICK STATUS CHIPS */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0b0d13] border border-[#c5a059]/30 text-[#e5c875] flex items-center gap-1.5 font-bold">
              <Activity className="h-3 w-3 text-[#c5a059]" />
              {analytics.overallCompletionRate}% COMPLETION
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0b0d13] border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              SYSTEM HEALTHY
            </span>
          </div>
        </div>

        {/* SUB-NAVIGATION BAR */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5 overflow-x-auto pb-1">
          <button
            onClick={() => handleTabChange('appearance')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border cursor-pointer shrink-0 ${
              activeSubTab === 'appearance'
                ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#141824] to-[#0b0d13] text-[#fef08a] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            id="oracle-subtab-appearance"
          >
            <Palette className={`h-4 w-4 ${activeSubTab === 'appearance' ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
            <span>VISUAL CODEX (APPEARANCE)</span>
          </button>

          <button
            onClick={() => handleTabChange('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border cursor-pointer shrink-0 ${
              activeSubTab === 'analytics'
                ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#141824] to-[#0b0d13] text-[#fef08a] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            id="oracle-subtab-analytics"
          >
            <BarChart3 className={`h-4 w-4 ${activeSubTab === 'analytics' ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
            <span>ORACLE METRICS & TRENDS</span>
          </button>

          <button
            onClick={() => handleTabChange('xp_history')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border cursor-pointer shrink-0 ${
              activeSubTab === 'xp_history'
                ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#141824] to-[#0b0d13] text-[#fef08a] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            id="oracle-subtab-xp-history"
          >
            <FileSpreadsheet className={`h-4 w-4 ${activeSubTab === 'xp_history' ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
            <span>XP LEDGER & AUDIT</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              {(state.xpHistory || []).length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('time_ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border cursor-pointer shrink-0 ${
              activeSubTab === 'time_ledger'
                ? 'bg-gradient-to-r from-emerald-500/25 via-[#141824] to-[#0b0d13] text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            id="oracle-subtab-time-ledger"
          >
            <Clock className={`h-4 w-4 ${activeSubTab === 'time_ledger' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>TEMPORAL LEDGER</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              {(state.timeHistory || []).length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('system')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border cursor-pointer shrink-0 ${
              activeSubTab === 'system'
                ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#141824] to-[#0b0d13] text-[#fef08a] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            id="oracle-subtab-system"
          >
            <Settings className={`h-4 w-4 ${activeSubTab === 'system' ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
            <span>SANCTUM CORE & OVERRIDES</span>
          </button>

          <button
            onClick={() => handleTabChange('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all border cursor-pointer shrink-0 ${
              activeSubTab === 'messages'
                ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#141824] to-[#0b0d13] text-[#fef08a] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                : 'bg-[#0b0d13]/80 hover:bg-[#141824] text-zinc-400 hover:text-zinc-200 border-white/5'
            }`}
            id="oracle-subtab-messages"
          >
            <Inbox className={`h-4 w-4 ${activeSubTab === 'messages' ? 'text-[#e5c875]' : 'text-zinc-500'}`} />
            <span>DISPATCH LOGS</span>
            {unreadMessagesCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#c5a059]/30 text-[#fef08a] font-mono font-bold animate-pulse">
                {unreadMessagesCount} NEW
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 0. VISUAL CODEX APPEARANCE SUBTAB */}
      {activeSubTab === 'appearance' && (
        <VisualCodexSettingsView />
      )}

      {/* 1. ORACLE ANALYTICS SUBTAB */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6" id="oracle-analytics-content">
          
          {/* TOP STAT COUNT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'OVERALL COMPLETION', value: `${analytics.overallCompletionRate}%`, icon: ShieldCheck, desc: 'Directive conquest ratio' },
              { label: 'DESTINIES FULFILLED', value: analytics.goalsCompleted, icon: Target, desc: '100% completed goal tracks' },
              { label: 'PROJECTS CONCLUDED', value: analytics.projectsCompleted, icon: Award, desc: 'Fully delivered campaign blocks' },
              { label: 'MILESTONES UNLOCKED', value: analytics.milestonesCompleted, icon: Zap, desc: 'Sacred milestone feats' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-panel rounded-xl p-5 flex items-center justify-between gap-4 border border-[#c5a059]/25 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg">
                  <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#c5a059] uppercase block font-bold">{stat.label}</span>
                    <span className="text-3xl font-display font-extrabold text-white block mt-1">{stat.value}</span>
                    <span className="text-[9px] font-mono text-zinc-400 block">{stat.desc}</span>
                  </div>
                  <Icon className="h-8 w-8 text-[#c5a059]/20 shrink-0" />
                </div>
              );
            })}
          </div>

          {/* MID ROW SUMMARY DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CHART BAR CARD (DAILY XP TREND) */}
            <div className="lg:col-span-2 glass-panel rounded-xl p-6 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  DAILY RESONANCE HARVEST CYCLE
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Empirical measurement of spiritual essence over the past 7 days</p>
              </div>

              {/* Bar Chart Svg/CSS */}
              <div className="pt-6 h-[240px] flex items-end justify-between gap-4 border-b border-[#c5a059]/20">
                {analytics.dailyXpTrend.map((day: any, idx: number) => {
                  const percentHeight = Math.max(5, Math.round((day.xp / maxTrendXp) * 100));
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group">
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#07080c] border border-[#c5a059] text-[9px] font-mono text-[#fef08a] px-2 py-0.5 rounded transition-opacity pointer-events-none z-10 shadow-lg font-bold">
                        +{day.xp} XP
                      </div>

                      {/* Bar */}
                      <div 
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                          day.xp > 0 
                            ? 'bg-gradient-to-t from-[#8a6d2b] to-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)] group-hover:brightness-125' 
                            : 'bg-[#07080c] border border-white/5'
                        }`}
                        style={{ height: `${percentHeight}%` }}
                      />

                      {/* Axis Label */}
                      <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase rotate-12 md:rotate-0">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart footer metrics */}
              <div className="grid grid-cols-3 text-center pt-2">
                <div className="border-r border-[#c5a059]/20">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase block">WEEKLY TOTAL</span>
                  <span className="text-lg font-mono font-bold text-white block mt-1">+{analytics.weeklyXp} XP</span>
                </div>
                <div className="border-r border-[#c5a059]/20">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase block">MONTHLY TOTAL</span>
                  <span className="text-lg font-mono font-bold text-white block mt-1">+{analytics.monthlyXp} XP</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-[#c5a059] uppercase block font-bold">DAILY AVERAGE</span>
                  <span className="text-lg font-mono font-bold text-[#fef08a] block mt-1">+{analytics.averageXp} XP</span>
                </div>
              </div>
            </div>

            {/* COMPREHENSIVE ATTRIBUTES RADAR LIST */}
            <div className="glass-panel rounded-xl p-6 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  SUSTAINED ATTRIBUTES
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Attributes mastery based on empirical trial data</p>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {attributes.map((attr) => (
                  <div key={attr.id} className="space-y-1.5 text-xs bg-[#07080c]/60 p-2.5 rounded-lg border border-[#c5a059]/15">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-200 font-bold uppercase">{attr.name}</span>
                      <span className="text-[#e5c875] font-bold">LVL {attr.level}</span>
                    </div>
                    
                    <div className="w-full bg-[#07080c] rounded-full h-1.5 overflow-hidden relative border border-white/5">
                      <div 
                        className="rpg-progress-gold h-full rounded-full" 
                        style={{ width: `${attr.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* LOWER GRID: REVELATIONS & CONSISTENCY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* CATEGORICAL ORACLE REVELATION */}
            <div className="glass-panel rounded-xl p-6 space-y-4 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider border-b border-[#c5a059]/20 pb-2 flex items-center gap-2">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                CATEGORICAL ORACLE REVELATION
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                  <span className="text-zinc-400 font-mono">MOST_IMPROVED_DISCIPLINE:</span>
                  <span className="text-[#fef08a] font-sans font-bold uppercase">{analytics.mostImprovedSkill}</span>
                </div>

                <div className="flex justify-between items-start text-xs py-1.5 border-b border-white/5 gap-4">
                  <span className="text-zinc-400 font-mono shrink-0">PRIMARY_DESTINY_PATH:</span>
                  <span className="text-white font-sans font-bold text-right uppercase line-clamp-1 truncate max-w-[250px]" title={analytics.mostActiveGoal}>
                    {analytics.mostActiveGoal}
                  </span>
                </div>

                <div className="flex justify-between items-start text-xs py-1.5 border-b border-white/5 gap-4">
                  <span className="text-zinc-400 font-mono shrink-0">DORMANT_DESTINY_PATH:</span>
                  <span className="text-zinc-400 font-sans text-right uppercase line-clamp-1 truncate max-w-[250px]" title={analytics.leastActiveGoal}>
                    {analytics.leastActiveGoal}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                  <span className="text-zinc-400 font-mono">DOMINANT_ATTRIBUTE_CORE:</span>
                  <span className="text-emerald-400 font-sans font-bold uppercase">{analytics.strongestAttr}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                  <span className="text-zinc-400 font-mono">DEVELOPING_ATTRIBUTE_CORE:</span>
                  <span className="text-rose-400 font-sans font-bold uppercase">{analytics.weakestAttr}</span>
                </div>
              </div>
            </div>

            {/* CONSISTENCY ANALYSIS & WORKLOAD */}
            <div className="glass-panel rounded-xl p-6 space-y-5 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider border-b border-[#c5a059]/20 pb-2 flex items-center gap-2">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" />
                CONSISTENCY METRIC REPORT
              </h3>

              <div className="space-y-4">
                
                {/* Consistency Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#c5a059] font-bold">ACTIVE REPETITION RATIO</span>
                    <span className="text-white font-bold">{consistencyScore}%</span>
                  </div>
                  <div className="w-full bg-[#07080c] rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        consistencyScore > 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : consistencyScore > 40 ? 'rpg-progress-gold' : 'bg-rose-500'
                      }`}
                      style={{ width: `${consistencyScore}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 block mt-1 uppercase">
                    Calculated from resolved directives during the last 7 sun cycles.
                  </span>
                </div>

                {/* Workload Status breakdown */}
                <div className="p-4 bg-[#07080c] rounded-xl border border-[#c5a059]/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">LOAD BALANCE INDEX</span>
                    <span className={`text-xs font-mono font-bold uppercase ${
                      analytics.workloadStatus === 'Heavy Workload' ? 'text-rose-400' :
                      analytics.workloadStatus === 'Moderate Workload' ? 'text-[#fef08a]' :
                      analytics.workloadStatus === 'No Workload' ? 'text-zinc-500' : 'text-emerald-400'
                    }`}>
                      {analytics.workloadStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                    {analytics.workloadStatus === 'Heavy Workload' 
                      ? 'Your estimated daily duration exceeds sustainable benchmarks. Highly recommend toggling RECOVERY MODE to rebuild spiritual composure.' 
                      : analytics.workloadStatus === 'Moderate Workload'
                      ? 'Your current workloads are at peak harmonic equilibrium. Directives are mapped and scaled smoothly.'
                      : 'Your workloads are light. Inscribe new strategic destinies or dispatch trials to accelerate elevation.'}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. SYSTEM XP HISTORY & LEDGER SUBTAB */}
      {activeSubTab === 'xp_history' && (
        <XPHistoryLedger onNavigate={onNavigate} />
      )}

      {/* 2.5 TEMPORAL LEDGER & REST AUDIT SUBTAB */}
      {activeSubTab === 'time_ledger' && (
        <TemporalLedgerView onNavigate={onNavigate} />
      )}

      {/* 3. SANCTUM CORE & SACRED OVERRIDES SUBTAB */}
      {activeSubTab === 'system' && (
        <div className="space-y-6" id="sanctum-system-control-content">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT PANEL: EXPORT & IMPORT BACKUPS */}
            <div className="glass-panel rounded-xl p-6 space-y-6 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  SANCTUM ARCHIVE & EXPORT
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Your progression logs are preserved locally in your browser storage.</p>
              </div>

              <div className="space-y-4">
                {/* Export block */}
                <div className="p-4 bg-[#07080c] border border-[#c5a059]/20 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-sans font-bold text-white block">Download Raw Sacred Scroll (JSON)</span>
                    <span className="text-[10px] font-mono text-zinc-400 block">Preserves a complete archive of your destinies, quests, and levels.</span>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="bg-[#3a2e12] hover:bg-[#4a3b18] border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer font-bold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    EXPORT
                  </button>
                </div>

                {/* Import block */}
                <form onSubmit={handleImport} className="space-y-3">
                  <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider block font-bold">IMPORT_SANCTUM_STATE_DUMP</span>
                  <textarea 
                    rows={4}
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder="Paste backup JSON archive dump here..."
                    className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059]"
                    required
                  />

                  <div className="flex justify-between items-center">
                    {importStatus === 'success' && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="h-4 w-4 animate-bounce" /> ARCHIVE RESTORED SUCCESSFULLY
                      </span>
                    )}
                    {importStatus === 'error' && (
                      <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="h-4 w-4" /> PARSING ERROR: INVALID SCHEMA
                      </span>
                    )}
                    {importStatus === 'idle' && <span />}

                    <button 
                      type="submit"
                      className="bg-[#3a2e12] hover:bg-[#4a3b18] border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      IMPORT
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT PANEL: OVERRIDE BASELINE ATTRIBUTES & RESET */}
            <div className="glass-panel rounded-xl p-6 space-y-6 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
              
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                  CALIBRATE BASE ATTRIBUTES
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Directly calibrate baseline values. Completed trials layer atop automatically.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
                {state.attributes.map((attr) => {
                  const fullyCalculated = currentAttributes.find(a => a.id === attr.id);
                  return (
                    <div key={attr.id} className="p-3 bg-[#07080c] border border-[#c5a059]/20 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-200 font-bold uppercase">{attr.name}</span>
                        <span className="text-[#fef08a] font-bold">LVL {fullyCalculated?.level || 1}</span>
                      </div>

                      {/* Progress & Points Scaling */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                          <span>PROGRESS</span>
                          <span>{fullyCalculated?.pointsIntoLevel ?? 0} / {fullyCalculated?.pointsRequiredForNextLevel ?? 14} PTS ({fullyCalculated?.progress ?? 0}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-[#c5a059] to-[#fef08a] rounded-full transition-all duration-300"
                            style={{ width: `${fullyCalculated?.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[9px] font-mono text-zinc-400 uppercase shrink-0">BASE:</label>
                          <input 
                            type="number"
                            min="1"
                            max="100"
                            value={attr.level}
                            onChange={(e) => updateAttributeBase(attr.id, Number(e.target.value))}
                            className="w-14 bg-[#0b0d13] border border-[#c5a059]/30 rounded px-1.5 py-0.5 text-xs text-center text-white focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => restartAttribute(attr.id)}
                          className="px-2 py-0.5 text-[9px] font-mono bg-rose-950/40 hover:bg-rose-950 border border-rose-500/30 text-rose-300 rounded transition-colors cursor-pointer"
                          title="Restart this specific attribute to Level 1"
                        >
                          RESTART
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUICK OVERRIDE CONTROLS */}
              <div className="pt-4 border-t border-[#c5a059]/20 space-y-3">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase block tracking-wider font-bold">SANCTUM_MAINTENANCE_OVERRIDE</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Reset Level & XP */}
                  <div className="bg-[#07080c] border border-[#c5a059]/20 p-3.5 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">RESET DISCIPLE LEVEL</span>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Wipe completion history to reset Level to 1 and XP to 0.</p>
                    
                    {showLevelResetConfirm ? (
                      <div className="space-y-2 pt-1 border-t border-rose-500/10">
                        <p className="text-[9px] font-mono text-rose-400">CONFIRM RESET?</p>
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setShowLevelResetConfirm(false)}
                            className="text-[9px] font-mono text-zinc-500 cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="button"
                            onClick={() => { resetLevelAndXp(); setShowLevelResetConfirm(false); }}
                            className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            CONFIRM
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setShowLevelResetConfirm(true)}
                        className="w-full bg-[#0b0d13] hover:bg-[#141824] border border-[#c5a059]/25 text-[#fef08a] text-[10px] font-mono py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                      >
                        RESET LEVEL & XP
                      </button>
                    )}
                  </div>

                  {/* Empty Daily Tasks / Quests */}
                  <div className="bg-[#07080c] border border-[#c5a059]/20 p-3.5 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">EMPTY DAILY TRIALS</span>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Immediately empty all active and completed daily directives.</p>
                    
                    {showQuestsResetConfirm ? (
                      <div className="space-y-2 pt-1 border-t border-rose-500/10">
                        <p className="text-[9px] font-mono text-rose-400">CONFIRM PURGE?</p>
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setShowQuestsResetConfirm(false)}
                            className="text-[9px] font-mono text-zinc-500 cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="button"
                            onClick={() => { clearAllQuests(); setShowQuestsResetConfirm(false); }}
                            className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            CONFIRM
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setShowQuestsResetConfirm(true)}
                        className="w-full bg-[#0b0d13] hover:bg-[#141824] border border-[#c5a059]/25 text-[#fef08a] text-[10px] font-mono py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                      >
                        EMPTY DIRECTIVES
                      </button>
                    )}
                  </div>

                  {/* Reset Baseline Attributes */}
                  <div className="bg-[#07080c] border border-[#c5a059]/20 p-3.5 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">RESTART ALL ATTRIBUTES</span>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                      Resets Strength, Endurance, Agility, Focus, and all attributes to Level 1 with 0% progress and recalibrates their progressive curve.
                    </p>
                    
                    {showAttrResetConfirm ? (
                      <div className="space-y-2 pt-1 border-t border-rose-500/10">
                        <p className="text-[9px] font-mono text-rose-400">CONFIRM RESTART TO LEVEL 1?</p>
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setShowAttrResetConfirm(false)}
                            className="text-[9px] font-mono text-zinc-500 cursor-pointer hover:text-zinc-300"
                          >
                            CANCEL
                          </button>
                          <button 
                            type="button"
                            onClick={() => { resetBaselineAttributes(); setShowAttrResetConfirm(false); }}
                            className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer font-bold"
                          >
                            CONFIRM RESTART
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setShowAttrResetConfirm(true)}
                        className="w-full bg-[#0b0d13] hover:bg-[#141824] border border-[#c5a059]/25 text-[#fef08a] text-[10px] font-mono py-1.5 rounded-lg transition-all cursor-pointer font-bold"
                      >
                        RESTART ALL ATTRIBUTES
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DANGER AREA: FACTORY WIPE */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">SANCTUM_PURGE_ZONE</span>
                
                {showResetWarning ? (
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
                    <p className="text-xs text-rose-300 font-sans leading-relaxed">
                      <AlertTriangle className="h-4 w-4 inline mr-1 text-rose-400 shrink-0" />
                      CRITICAL PROMPT: This operation immediately wipes all local quest statistics, levels, custom destinies, and restores initial parameters.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setShowResetWarning(false)}
                        className="text-[10px] font-mono text-zinc-400 cursor-pointer"
                      >
                        ABORT
                      </button>
                      <button 
                        onClick={handleReset}
                        className="bg-rose-950 border border-rose-500/40 text-rose-300 text-[10px] font-mono px-3 py-1 rounded-lg cursor-pointer"
                      >
                        EXECUTE_WIPE
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowResetWarning(true)}
                    className="w-full bg-rose-950/10 hover:bg-rose-950/30 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-mono py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    RESTORE FACTORY SANCTUM ARCHIVE
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 3. SYSTEM DISPATCH LOGS */}
      {activeSubTab === 'messages' && (
        <div className="space-y-4" id="system-messages-panel">
          <SystemMessageBox />
        </div>
      )}

    </div>
  );
};
