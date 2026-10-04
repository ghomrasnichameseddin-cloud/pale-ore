import React, { useState, useRef } from 'react';
import { usePOS } from '../POSContext';
import { 
  Download, Upload, Copy, Check, ShieldAlert, FileText, 
  FileJson, Eye, EyeOff, AlertTriangle, RefreshCw, FolderUp, 
  CheckCircle2, Sparkles, Database, ShieldCheck
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { getLocalDateString } from '../utils/dateUtils';

export const SanctumBackupManager: React.FC = () => {
  const { state, exportData, importDataDetailed, getAttributes } = usePOS();

  // Export State
  const [copiedExport, setCopiedExport] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Import State
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [pastedJson, setPastedJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importedSummary, setImportedSummary] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculated Stats for Current State Badge
  const currentAttributes = getAttributes();
  const questsCount = state.quests?.length || 0;
  const skillsCount = state.skills?.length || 0;
  const discipleLevel = state.profile?.level || 1;
  const discipleXp = state.profile?.xp || 0;

  // 1. Download Backup as File (.json)
  const handleDownloadFile = () => {
    try {
      const jsonString = exportData();
      const fileName = `pale_ore_pos_backup_${getLocalDateString()}.json`;
      
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = fileName;
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      
      // Attempt click
      downloadAnchor.click();
      
      // Cleanup
      setTimeout(() => {
        downloadAnchor.remove();
        URL.revokeObjectURL(objectUrl);
      }, 1000);

      setExportNotice('File download started. A copy has also been prepared.');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err: any) {
      console.warn('Direct file download encountered error (e.g. sandbox restriction):', err);
      // Fallback: auto copy to clipboard
      handleCopyClipboard();
      setExportNotice('Browser prevented direct download (iframe sandbox). Backup was copied to clipboard instead!');
      setTimeout(() => setExportNotice(null), 5000);
    }
  };

  // 2. Copy Raw JSON to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const jsonString = exportData();
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonString);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = jsonString;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setExportNotice('Clipboard access denied. Please open "View Raw JSON" below and copy manually.');
      setTimeout(() => setExportNotice(null), 5000);
    }
  };

  // 3. Process Import Payload
  const executeImport = (rawContent: string) => {
    if (!rawContent || !rawContent.trim()) {
      setImportStatus('error');
      setImportMessage('Please provide JSON backup content to restore.');
      setTimeout(() => setImportStatus('idle'), 4000);
      return;
    }

    const result = importDataDetailed(rawContent);

    if (result.success) {
      setImportStatus('success');
      setImportMessage('Archive restored and synchronized with Sanctum Core.');
      setImportedSummary(result.summary || `Restored Level ${result.counts?.level || 1} • ${result.counts?.quests || 0} Quests`);
      setPastedJson('');
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage(null);
      }, 6000);
    } else {
      setImportStatus('error');
      setImportMessage(result.error || 'Failed to restore archive: Invalid schema or unreadable data.');
      setTimeout(() => {
        setImportStatus('idle');
      }, 6000);
    }
  };

  // 4. File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        executeImport(text);
      }
    };
    reader.onerror = () => {
      setImportStatus('error');
      setImportMessage('Unable to read selected file from your device.');
      setTimeout(() => setImportStatus('idle'), 4000);
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 5. Drag and Drop Support
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          executeImport(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // 6. Paste From Clipboard
  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setPastedJson(clipText);
          executeImport(clipText);
          return;
        }
      }
      setImportStatus('error');
      setImportMessage('Clipboard is empty or permission denied. Please paste directly into the box.');
      setTimeout(() => setImportStatus('idle'), 4000);
    } catch (err) {
      setImportStatus('error');
      setImportMessage('Clipboard access denied. Please paste using Ctrl+V / Cmd+V.');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  // Approximate byte size of current state
  const rawExportString = exportData();
  const exportSizeKb = (new Blob([rawExportString]).size / 1024).toFixed(1);

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6 border border-[#c5a059]/30 bg-[#0b0d13]/90 relative shadow-xl">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c5a059]/20 pb-4">
        <div>
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
            SANCTUM ARCHIVE & STATE PRESERVATION
          </h3>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Export complete life progression or restore past backups with atomic schema reconciliation.
          </p>
        </div>

        {/* ACTIVE STATE PILL */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950/80 border border-white/10 rounded-lg text-[10px] font-mono shrink-0">
          <Database className="h-3 w-3 text-[#fef08a]" />
          <span className="text-zinc-400">STATE:</span>
          <span className="text-[#fef08a] font-bold">LVL {discipleLevel}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-400">{questsCount} Quests</span>
          <span className="text-zinc-500">•</span>
          <span className="text-cyan-400">{skillsCount} Skills</span>
          <span className="text-zinc-500">•</span>
          <span className="text-amber-400">{currentAttributes.length} Pillars</span>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* EXPORT SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              1. EXPORT SANCTUM ARCHIVE
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Payload Size: ~{exportSizeKb} KB
            </span>
          </div>

          <div className="p-4 bg-[#07080c] border border-[#c5a059]/20 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-sans font-bold text-white block">
                  Sacred Scroll Backup Package (.json)
                </span>
                <span className="text-[11px] font-mono text-zinc-400 block leading-relaxed">
                  Preserves profile, 18 sovereign attributes, quests, campaigns, doctrines, inventory & spiritual logs.
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* 1-Click File Download */}
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="bg-[#3a2e12] hover:bg-[#4a3b18] border border-[#c5a059]/50 text-[#fef08a] text-xs font-mono px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-bold shadow-sm"
                  title="Download JSON file to your device"
                >
                  <Download className="h-3.5 w-3.5 text-[#fef08a]" />
                  <span>DOWNLOAD .JSON</span>
                </button>

                {/* 1-Click Copy to Clipboard */}
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                    copiedExport
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/10 hover:border-white/20 text-zinc-200'
                  }`}
                  title="Copy full JSON payload to your clipboard"
                >
                  {copiedExport ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span>COPIED TO CLIPBOARD!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      <span>COPY RAW JSON</span>
                    </>
                  )}
                </button>

                {/* Inspect Raw JSON Toggle */}
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg border border-white/10 transition-colors"
                  title={showRawJson ? 'Hide Raw JSON' : 'Inspect Raw JSON Payload'}
                >
                  {showRawJson ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* NOTICES */}
            {exportNotice && (
              <div className="p-2.5 bg-[#3a2e12]/60 border border-[#c5a059]/40 rounded-lg text-xs font-mono text-[#fef08a] flex items-center gap-2 animate-fadeIn">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>{exportNotice}</span>
              </div>
            )}

            {/* RAW JSON VIEWER ACCORDION */}
            {showRawJson && (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>PAYLOAD INSPECTOR (READ ONLY):</span>
                  <button
                    type="button"
                    onClick={handleCopyClipboard}
                    className="text-[#fef08a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> Select & Copy Full Payload
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={rawExportString}
                  className="w-full bg-[#030407] border border-white/10 rounded-lg p-2.5 text-[11px] font-mono text-zinc-300 select-all focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* IMPORT SECTION */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              2. RESTORE ARCHIVE (IMPORT)
            </span>

            {/* SWITCH IMPORT MODE */}
            <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setImportMode('upload')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  importMode === 'upload' 
                    ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/40' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                FILE UPLOAD
              </button>
              <button
                type="button"
                onClick={() => setImportMode('paste')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  importMode === 'paste' 
                    ? 'bg-[#3a2e12] text-[#fef08a] font-bold border border-[#c5a059]/40' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                PASTE TEXT
              </button>
            </div>
          </div>

          {/* HIDDEN FILE INPUT */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json,text/plain"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* MODE 1: FILE DROP & UPLOAD ZONE */}
          {importMode === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center space-y-2.5 ${
                isDragging
                  ? 'border-[#c5a059] bg-[#c5a059]/10'
                  : 'border-[#c5a059]/30 bg-[#07080c] hover:border-[#c5a059]/60 hover:bg-[#0c0f17]'
              }`}
            >
              <div className="mx-auto h-10 w-10 rounded-full bg-[#1b170c] border border-[#c5a059]/30 flex items-center justify-center text-[#fef08a]">
                <FolderUp className="h-5 w-5" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  CLICK TO SELECT OR DRAG & DROP .JSON BACKUP FILE
                </span>
                <span className="text-[11px] font-sans text-zinc-400 block mt-0.5">
                  Supports files exported from any version of Pale Ore POS. Fully reconciled automatically.
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/80 rounded-full border border-white/10 text-[10px] font-mono text-zinc-300">
                <FileJson className="h-3 w-3 text-[#c5a059]" />
                <span>Accepted Format: .json / application/json</span>
              </div>
            </div>
          )}

          {/* MODE 2: PASTE RAW JSON TEXT */}
          {importMode === 'paste' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={4}
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder="Paste JSON archive dump or raw state backup text here..."
                  className="w-full bg-[#07080c] border border-[#c5a059]/25 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059] placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="h-3 w-3 text-zinc-400" />
                    <span>PASTE FROM CLIPBOARD</span>
                  </button>

                  {pastedJson && (
                    <button
                      type="button"
                      onClick={() => setPastedJson('')}
                      className="px-2.5 py-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => executeImport(pastedJson)}
                  disabled={!pastedJson.trim()}
                  className={`text-xs font-mono px-4 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 font-bold ${
                    pastedJson.trim()
                      ? 'bg-[#3a2e12] hover:bg-[#4a3b18] border-[#c5a059]/60 text-[#fef08a] cursor-pointer'
                      : 'bg-zinc-900 border-white/5 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>RESTORE ARCHIVE</span>
                </button>
              </div>
            </div>
          )}

          {/* STATUS NOTIFICATIONS */}
          {importStatus === 'success' && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" />
                <span>ARCHIVE RESTORED & FULLY HYDRATED</span>
              </div>
              {importedSummary && (
                <div className="text-[11px] font-mono text-emerald-200 pl-6">
                  {importedSummary}
                </div>
              )}
              {importMessage && (
                <div className="text-[10px] font-sans text-emerald-400/80 pl-6">
                  {importMessage}
                </div>
              )}
            </div>
          )}

          {importStatus === 'error' && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-xl space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>IMPORT FAILED</span>
              </div>
              <p className="text-[11px] font-sans text-rose-200 pl-6 leading-relaxed">
                {importMessage || 'Invalid schema or corrupted file. Please ensure the file was exported from Pale Ore POS.'}
              </p>
            </div>
          )}

          {/* RESILIENCE & SAFETY FOOTNOTE */}
          <div className="flex items-start gap-2 text-[10px] font-mono text-zinc-500 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              <strong>Safe Schema Reconciler:</strong> Old exports automatically receive the 18 sovereign pillars, habit formations, normalized masteries, and prayer logs without wiping existing data structures.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
