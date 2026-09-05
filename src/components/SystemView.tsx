import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { SystemMessageBox } from './SystemMessageBox';
import { 
  Settings, Download, Upload, RotateCcw, AlertTriangle, 
  Check, ShieldAlert, Award, BatteryCharging, Battery, Zap,
  ShieldCheck, Cpu, Sun, Gauge, Monitor, Sparkles, Thermometer,
  Activity, HardDrive, Flame, Shield, Info, Percent
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

export const SystemView: React.FC = () => {
  const { 
    state, exportData, importData, resetAllData, resetLevelAndXp, 
    clearAllQuests, resetBaselineAttributes, updateAttributeBase, restartAttribute,
    getAttributes, updateBatterySettings, toggleBatterySaverMode
  } = usePOS();

  const batterySettings = state.batterySettings || {
    batterySaverMode: false,
    autoEcoLowBattery: true,
    animationThrottle: 'Full',
    oledMode: false,
    maxFpsCap: 60
  };

  // Real Web Battery API State
  const [realBattery, setRealBattery] = useState<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    isSupported: boolean;
  }>({
    level: 0.85,
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
    isSupported: false
  });

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        const update = () => {
          setRealBattery({
            level: bat.level,
            charging: bat.charging,
            chargingTime: bat.chargingTime,
            dischargingTime: bat.dischargingTime,
            isSupported: true
          });
        };
        update();
        bat.addEventListener('levelchange', update);
        bat.addEventListener('chargingchange', update);
        bat.addEventListener('dischargingtimechange', update);
        return () => {
          bat.removeEventListener('levelchange', update);
          bat.removeEventListener('chargingchange', update);
          bat.removeEventListener('dischargingtimechange', update);
        };
      }).catch(() => {});
    }
  }, []);

  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [showLevelResetConfirm, setShowLevelResetConfirm] = useState(false);
  const [showQuestsResetConfirm, setShowQuestsResetConfirm] = useState(false);
  const [showAttrResetConfirm, setShowAttrResetConfirm] = useState(false);

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

  const currentAttributes = getAttributes();

  const thermalLoad = batterySettings.batterySaverMode ? 12 : 34;
  const powerDrain = batterySettings.batterySaverMode ? 18 : 42;
  const longevityIndex = Math.max(0, Math.min(100, 100 - (thermalLoad + powerDrain) + (batterySettings.oledMode ? 8 : 0) + (batterySettings.autoEcoLowBattery ? 10 : 0)));
  const performanceBudget = batterySettings.batterySaverMode ? 'Low-draw / stable' : 'Performance-first / elevated heat';

  return (
    <div className="space-y-6" id="system-view-root">
      
      {/* SECTION HEADER */}
      <div className="border-b border-[#c5a059]/20 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
          SANCTUM CORE & SACRED OVERRIDES
        </h2>
        <p className="text-xs text-zinc-300 font-mono mt-1">
          CORE_OPERATIONS • Divine calibration & progression archives maintenance
        </p>
      </div>

      {/* SYSTEM MESSAGE BOX PANEL */}
      <SystemMessageBox />

      {/* PC BATTERY & HARDWARE THERMAL HEALTH PROTECTION SHIELD */}
      <div className="p-6 bg-gradient-to-r from-[#0d2218] via-[#07080c] to-[#0a1b18] border border-emerald-500/40 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-6">
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#10b981" />
        
        {/* BACKGROUND GLOW ACCENT */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#051f15] border border-emerald-500/60 rounded-xl text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <span>⚡</span> PC BATTERY & THERMAL DEFENSE SHIELD <span>⚡</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono border font-bold uppercase bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                    SACRED WARD ACTIVE
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-wider">
                  HARDWARE THERMAL & ESSENCE LONGEVITY WARD
                </h3>
              </div>
            </div>
          </div>

          {/* Interactive Hardware Profile Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBatterySaverMode}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border flex items-center gap-2 shadow-lg transition ${batterySettings.batterySaverMode ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900 shadow-[0_0_18px_rgba(16,185,129,0.3)]' : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'} cursor-pointer`}
            >
              <Zap className={`h-4 w-4 ${batterySettings.batterySaverMode ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
              <span>{batterySettings.batterySaverMode ? 'ECO WARD ENGAGED' : 'ECO WARD STANDBY'}</span>
            </button>
          </div>
        </div>

        {/* THREE HARDWARE HEALTH SCORES (0-100) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              SYSTEM HARMONY SCORES (0–100 SCALE)
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Harmonic Status: <span className="text-emerald-400 font-bold">90–100 Optimal</span> | <span className="text-[#fef08a] font-bold">75–89 Stable</span> | <span className="text-amber-300 font-bold">60–74 Moderate</span> | <span className="text-rose-400 font-bold">0–39 Critical</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Thermal Health Score */}
            <div className="p-4 bg-[#07080c]/90 border border-emerald-500/30 rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-emerald-400" />
                  Thermal Health
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-white/10 uppercase">
                  N/A
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-black text-emerald-400">{Math.round(100 - thermalLoad)}</span>
                <span className="text-[10px] font-mono text-zinc-400">Safe Domain: 90–100</span>
              </div>
              <p className="text-[10px] font-sans text-zinc-400">
                {batterySettings.batterySaverMode ? 'Eco Ward is reducing thermal stress and preserving the system core.' : 'Thermal load is elevated; enabling Eco Ward will stabilize heat output.'}
              </p>
            </div>

            {/* Power Health Score */}
            <div className="p-4 bg-[#07080c]/90 border border-emerald-500/30 rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#c5a059]" />
                  Power Health
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-white/10 uppercase">
                  N/A
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-black text-emerald-400">{Math.round(100 - powerDrain)}</span>
                <span className="text-[10px] font-mono text-zinc-400">Safe Domain: 90–100</span>
              </div>
              <p className="text-[10px] font-sans text-zinc-400">
                {batterySettings.batterySaverMode ? 'Power draw is being regulated to protect battery health and reduce stress.' : 'Background load is higher; Eco Ward keeps electrical consumption in check.'}
              </p>
            </div>

            {/* Longevity Index */}
            <div className="p-4 bg-[#07080c]/90 border border-emerald-500/30 rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-amber-400" />
                  Longevity Index
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-white/10 uppercase">
                  N/A
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-black text-emerald-400">{Math.round(longevityIndex)}</span>
                <span className="text-[10px] font-mono text-zinc-400">Safe Domain: 90–100</span>
              </div>
              <p className="text-[10px] font-sans text-emerald-400/90 font-medium">
                {performanceBudget} • Ward is actively reducing thermal and electrical wear.
              </p>
            </div>

          </div>
        </div>

        {/* SENSOR THRESHOLDS MATRIX (SHOWING N/A WHEN DATA IS UNAVAILABLE) */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              HARDWARE THERMAL & POWER THRESHOLDS
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Note: Web Browser sandbox restricts direct die temperature sensor access (`N/A`)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* CPU Temp */}
            <div className="bg-[#07080c]/90 border border-white/10 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-[#c5a059]" />
                  CPU Temperature
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  N/A
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between text-zinc-300 border-b border-white/5 pb-1">
                  <span>Thresholds:</span>
                  <span className="text-emerald-400">&lt;70°C Excellent</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 pt-0.5">
                  <div>70–80°C Good</div>
                  <div>80–90°C Warning</div>
                  <div className="col-span-2 text-rose-400 font-bold">&gt;90°C Critical</div>
                </div>
              </div>
            </div>

            {/* GPU Temp */}
            <div className="bg-[#07080c]/90 border border-white/10 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-[#e5c875]" />
                  GPU Temperature
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  N/A
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between text-zinc-300 border-b border-white/5 pb-1">
                  <span>Thresholds:</span>
                  <span className="text-emerald-400">&lt;70°C Excellent</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 pt-0.5">
                  <div>70–80°C Good</div>
                  <div>80–85°C Warning</div>
                  <div className="col-span-2 text-rose-400 font-bold">&gt;85°C Critical</div>
                </div>
              </div>
            </div>

            {/* GPU Hotspot */}
            <div className="bg-[#07080c]/90 border border-white/10 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-400" />
                  GPU Hotspot
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  N/A
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between text-zinc-300 border-b border-white/5 pb-1">
                  <span>Thresholds:</span>
                  <span className="text-emerald-400">&lt;80°C Excellent</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 pt-0.5">
                  <div>80–90°C Good</div>
                  <div>90–100°C Warning</div>
                  <div className="col-span-2 text-rose-400 font-bold">&gt;100°C Critical</div>
                </div>
              </div>
            </div>

            {/* SSD Temp */}
            <div className="bg-[#07080c]/90 border border-white/10 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-emerald-400" />
                  SSD Temperature
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  N/A
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between text-zinc-300 border-b border-white/5 pb-1">
                  <span>Thresholds:</span>
                  <span className="text-emerald-400">&lt;50°C Excellent</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 pt-0.5">
                  <div>50–60°C Good</div>
                  <div>60–70°C Warning</div>
                  <div className="col-span-2 text-rose-400 font-bold">&gt;70°C Critical</div>
                </div>
              </div>
            </div>

            {/* VRM Temp */}
            <div className="bg-[#07080c]/90 border border-white/10 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-rose-400" />
                  VRM Temperature
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  N/A
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between text-zinc-300 border-b border-white/5 pb-1">
                  <span>Thresholds:</span>
                  <span className="text-emerald-400">&lt;60°C Excellent</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 pt-0.5">
                  <div>60–75°C Good</div>
                  <div>75–90°C Warning</div>
                  <div className="col-span-2 text-rose-400 font-bold">&gt;90°C Critical</div>
                </div>
              </div>
            </div>

            {/* PSU Load */}
            <div className="bg-[#07080c]/90 border border-white/10 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-[#fef08a]" />
                  PSU Load
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/10">
                  N/A
                </span>
              </div>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between text-zinc-300 border-b border-white/5 pb-1">
                  <span>Thresholds:</span>
                  <span className="text-emerald-400">&lt;60% Excellent</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-400 pt-0.5">
                  <div>60–75% Good</div>
                  <div>75–90% Warning</div>
                  <div className="col-span-2 text-rose-400 font-bold">&gt;90% Critical</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* REAL-TIME BATTERY & THERMAL DIAGNOSTICS STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          
          {/* Real or Estimated Battery Level */}
          <div className="bg-[#07080c]/90 border border-emerald-500/30 p-4 rounded-xl space-y-2">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">LIVE PC BATTERY LEVEL</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-black text-white">
                {Math.round((realBattery.isSupported ? realBattery.level : 0.88) * 100)}%
              </span>
              <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                {realBattery.charging ? (
                  <>
                    <BatteryCharging className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>PLUGGED IN</span>
                  </>
                ) : (
                  <>
                    <Battery className="h-4 w-4 text-amber-400" />
                    <span>ON BATTERY</span>
                  </>
                )}
              </div>
            </div>
            {/* Battery Level Visual Bar */}
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/10 mt-1">
              <div 
                className={`h-full transition-all duration-500 ${
                  (realBattery.level || 0.88) > 0.4 ? 'bg-emerald-400' : (realBattery.level || 0.88) > 0.2 ? 'bg-amber-400' : 'bg-rose-500'
                }`} 
                style={{ width: `${Math.round((realBattery.isSupported ? realBattery.level : 0.88) * 100)}%` }}
              />
            </div>
          </div>

          {/* GPU & Thermal Heat Load */}
          <div className="bg-[#07080c]/90 border border-emerald-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">GPU SHADER & THERMAL LOAD</span>
            <span className="text-lg font-mono font-bold text-emerald-400 block">
              ULTRA LOW (~0.1W GPU Load)
            </span>
            <span className="text-[10px] font-mono text-zinc-400 block">
              Background loops & heavy shaders throttled
            </span>
          </div>

          {/* OLED Display Power Drain */}
          <div className="bg-[#07080c]/90 border border-emerald-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">OLED CANVAS POWER DRAIN</span>
            <span className={`text-lg font-mono font-bold block ${
              batterySettings.oledMode ? 'text-[#fef08a]' : 'text-zinc-300'
            }`}>
              {batterySettings.oledMode ? 'PURE BLACK (30% Energy Saved)' : 'DARK CHARCOAL (#07080c)'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 block">
              {batterySettings.oledMode ? 'Pixel power shut off for zero drain' : 'Standard dark sanctuary canvas'}
            </span>
          </div>

          {/* Estimated Battery Life Extension */}
          <div className="bg-[#07080c]/90 border border-emerald-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">ESTIMATED RUNTIME EXTENSION</span>
            <span className="text-lg font-mono font-bold text-emerald-300 block">
              +35% LONGER RUNTIME
            </span>
            <span className="text-[10px] font-mono text-emerald-400/90 block">
              Mitigates lithium battery heat degradation
            </span>
          </div>

        </div>

        {/* HARDWARE BATTERY DAMAGE MITIGATION EXPLANATION */}
        <div className="p-4 bg-[#07080c]/90 border border-emerald-500/30 rounded-xl text-xs font-sans text-zinc-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>HOW CONTINUOUS ANIMATIONS IMPACT PC HARDWARE LONGEVITY:</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Infinite 3D rotations, unthrottled shaders, and continuous DOM paint events force GPUs to run unhindered. Pale Ore OS Eco Ward enforces strict GPU sleep states, preserving silicon integrity and battery capacity.
          </p>
        </div>

      </div>

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
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Wipe completion history to reset Level to 1 and accumulated XP to 0.</p>
                
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
                    EMPTY DAILY DIRECTIVES
                  </button>
                )}
              </div>

              {/* Reset Baseline Attributes */}
              <div className="bg-[#07080c] border border-[#c5a059]/20 p-3.5 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold block">RESTART ALL ATTRIBUTES</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  Resets Strength, Endurance, Agility, Focus, and all attributes to Level 1 with 0% progress and recalibrates their progressive progression curve.
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

          {/* DANGER AREA: RE-ALIGN / RESET */}
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
  );
};
