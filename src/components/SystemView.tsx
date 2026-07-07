import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Settings, Download, Upload, RotateCcw, AlertTriangle, 
  Check, Play, ArrowRight, ShieldAlert, Award
} from 'lucide-react';

export const SystemView: React.FC = () => {
  const { 
    state, exportData, importData, resetAllData, resetLevelAndXp, clearAllQuests, resetBaselineAttributes, updateAttributeBase, getAttributes 
  } = usePOS();

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

  return (
    <div className="space-y-6" id="system-view-root">
      
      {/* SECTION HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          POS SYSTEM OPERATIONS
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          CORE_CONTROLS • Direct override controls of the progression database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: EXPORT & IMPORT BACKUPS */}
        <div className="glass-panel rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="h-4 w-4 text-cyan-400" />
              BACKUP & DATA OWNERSHIP
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Your progression logs are kept locally in your container browser state.</p>
          </div>

          <div className="space-y-4">
            {/* Export block */}
            <div className="p-4 bg-zinc-950/60 border border-white/5 rounded-lg flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-sans font-bold text-white block">Download Raw Backup</span>
                <span className="text-[10px] font-mono text-zinc-500 block">Saves a complete JSON string of your goals, quests, and levels.</span>
              </div>
              <button 
                onClick={handleExport}
                className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                EXPORT
              </button>
            </div>

            {/* Import block */}
            <form onSubmit={handleImport} className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">IMPORT_STATE_DATA_DUMP</span>
              <textarea 
                rows={4}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste backup JSON code dump here..."
                className="w-full bg-zinc-950 border border-white/10 rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />

              <div className="flex justify-between items-center">
                {importStatus === 'success' && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="h-4 w-4 animate-bounce" /> DATA IMPORTED SUCCESSFULLY
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
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-mono px-4 py-1.5 rounded transition-colors flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  IMPORT
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: OVERRIDE BASELINE ATTRIBUTES & RESET */}
        <div className="glass-panel rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-cyan-400" />
              OVERRIDE BASELINE ATTRIBUTES
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Directly calibrate baseline values. The system overlays completed quests automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {state.attributes.map((attr) => {
              const fullyCalculated = currentAttributes.find(a => a.id === attr.id);
              return (
                <div key={attr.id} className="p-3 bg-zinc-950 border border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-200 font-bold uppercase">{attr.name}</span>
                    <span className="text-cyan-400 font-bold">TOTAL LVL: {fullyCalculated?.level}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">BASE BASELINE:</label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={attr.level}
                      onChange={(e) => updateAttributeBase(attr.id, Number(e.target.value))}
                      className="w-16 bg-zinc-900 border border-white/10 rounded px-1.5 py-0.5 text-xs text-center text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* QUICK OVERRIDE CONTROLS */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">SYSTEM_MAINTENANCE_OVERRIDE</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reset Level & XP */}
              <div className="bg-zinc-950 border border-white/5 p-3.5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">RESET PLAYER PROGRESS</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Wipe completion history to reset Level to 1 and accumulated XP to 0. Active quests persist.</p>
                
                {showLevelResetConfirm ? (
                  <div className="space-y-2 pt-1 border-t border-rose-500/10">
                    <p className="text-[9px] font-mono text-rose-400">ARE YOU ABSOLUTELY SURE?</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowLevelResetConfirm(false)}
                        className="text-[9px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="button"
                        onClick={() => { resetLevelAndXp(); setShowLevelResetConfirm(false); }}
                        className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                      >
                        CONFIRM_RESET
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowLevelResetConfirm(true)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono py-1 rounded transition-all"
                  >
                    RESET LEVEL & XP
                  </button>
                )}
              </div>

              {/* Empty Daily Tasks / Quests */}
              <div className="bg-zinc-950 border border-white/5 p-3.5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">EMPTY DAILY DIRECTIVES</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Immediately empty all active and completed daily quests. Unlinks them from goals & projects.</p>
                
                {showQuestsResetConfirm ? (
                  <div className="space-y-2 pt-1 border-t border-rose-500/10">
                    <p className="text-[9px] font-mono text-rose-400">ARE YOU ABSOLUTELY SURE?</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowQuestsResetConfirm(false)}
                        className="text-[9px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="button"
                        onClick={() => { clearAllQuests(); setShowQuestsResetConfirm(false); }}
                        className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                      >
                        CONFIRM_PURGE
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowQuestsResetConfirm(true)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono py-1 rounded transition-all"
                  >
                    EMPTY DAILY TASKS
                  </button>
                )}
              </div>

              {/* Reset Baseline Attributes */}
              <div className="bg-zinc-950 border border-white/5 p-3.5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">RESET BASELINE ATTRIBUTES</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Reset baseline levels of Strength, Endurance, Focus, etc. to 1. Earned levels from quest history persist.</p>
                
                {showAttrResetConfirm ? (
                  <div className="space-y-2 pt-1 border-t border-rose-500/10">
                    <p className="text-[9px] font-mono text-rose-400">ARE YOU ABSOLUTELY SURE?</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowAttrResetConfirm(false)}
                        className="text-[9px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="button"
                        onClick={() => { resetBaselineAttributes(); setShowAttrResetConfirm(false); }}
                        className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                      >
                        CONFIRM_RESET
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowAttrResetConfirm(true)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono py-1 rounded transition-all"
                  >
                    RESET BASE ATTRIBUTES
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DANGER AREA: RE-ALIGN / RESET */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">FACTORY_PURGE_ZONE</span>
            
            {showResetWarning ? (
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-3">
                <p className="text-xs text-rose-300 font-sans leading-relaxed">
                  <AlertTriangle className="h-4 w-4 inline mr-1 text-rose-400 shrink-0" />
                  CRITICAL PROMPT: This operation immediately clears all local quest statistics, levels, custom goals, and re-seeds default parameters. This action is final and executes immediately.
                </p>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setShowResetWarning(false)}
                    className="text-[10px] font-mono text-zinc-400"
                  >
                    ABORT
                  </button>
                  <button 
                    onClick={handleReset}
                    className="bg-rose-950 border border-rose-500/40 text-rose-300 text-[10px] font-mono px-3 py-1 rounded"
                  >
                    EXECUTE_WIPE
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetWarning(true)}
                className="w-full bg-rose-950/10 hover:bg-rose-950/30 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs font-mono py-2 rounded transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                RESTORE FACTORY DEFAULT PARAMETERS
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
