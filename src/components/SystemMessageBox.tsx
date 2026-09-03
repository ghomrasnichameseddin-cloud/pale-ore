import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { SystemMessage, Quest, Goal, Project } from '../types';
import { 
  Inbox, Bell, ShieldAlert, Award, MessageSquare, AlertTriangle, 
  Check, CheckCheck, Trash2, Send, Filter, Info, X, Terminal, Clock, RefreshCw, 
  Volume2, VolumeX, Laptop, Smartphone, ExternalLink, Settings2, Sparkles, 
  CheckCircle2, CalendarPlus, ChevronRight, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundSystem } from '../utils/soundEffects';
import { 
  getNotificationPermission, requestNotificationPermission, testNativeNotification, 
  isInIframe, triggerVibration, NotificationPermissionState 
} from '../utils/nativeNotifications';
import { 
  scanAllDelayedItems, DelayedScanResult, snoozeEntity, calculateSnoozeDate 
} from '../utils/delayedTaskScanner';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

interface SystemMessageBoxProps {
  compact?: boolean;
  onClose?: () => void;
  onNavigateToQuest?: (questId: string) => void;
  onNavigateToGoal?: (goalId: string) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export const SystemMessageBox: React.FC<SystemMessageBoxProps> = ({ 
  compact = false, 
  onClose,
  onNavigateToQuest,
  onNavigateToGoal,
  onNavigateToProject
}) => {
  const { 
    state, addSystemMessage, markSystemMessageRead, 
    markAllSystemMessagesRead, deleteSystemMessage, clearAllSystemMessages,
    updateNotificationSettings, scanDelayedTasks, updateQuest, updateGoal, updateProject
  } = usePOS();

  const messages = state.messages || [];
  const unreadCount = messages.filter(m => !m.read).length;
  const delayedMessages = messages.filter(m => m.category === 'delayed');

  const [isMuted, setIsMuted] = useState(soundSystem.getMuted());
  const [filterCategory, setFilterCategory] = useState<'all' | 'delayed' | 'alert' | 'achievement' | 'note' | 'warning' | 'unread'>('all');
  
  // Inscription composer state
  const [isDispatching, setIsDispatching] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'note' | 'alert' | 'warning' | 'delayed'>('note');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  
  // Notification status & controls
  const [permState, setPermState] = useState<NotificationPermissionState>(() => getNotificationPermission());
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'info' | 'warn'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Scan current delayed tasks
  const [delayedScan, setDelayedScan] = useState<DelayedScanResult>(() => scanAllDelayedItems(state));

  useEffect(() => {
    setDelayedScan(scanAllDelayedItems(state));
    setPermState(getNotificationPermission());
  }, [state.quests, state.goals, state.projects, state.systemDate]);

  const showFeedback = (text: string, type: 'success' | 'info' | 'warn' = 'success', timeout = 4500) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => setFeedbackBanner(null), timeout);
  };

  const handleRequestPermission = async () => {
    const updated = await requestNotificationPermission();
    setPermState(updated);
    if (updated === 'granted') {
      updateNotificationSettings({ enableDesktopNotifications: true });
      soundSystem.playNotification('achievement');
      showFeedback('PC & Mobile OS alerts connected! Test dispatched to notification tray.', 'success');
      testNativeNotification();
    } else if (updated === 'denied') {
      showFeedback('Browser notifications blocked. Enable in your browser address bar (lock icon).', 'warn');
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const res = await testNativeNotification();
      showFeedback(res.message, res.success ? 'success' : 'info');
    } catch (e: any) {
      showFeedback('Failed: ' + (e?.message || 'Check browser permissions.'), 'warn');
    } finally {
      setIsTesting(false);
    }
  };

  const handleAuditDelayedTasks = async () => {
    setIsAuditing(true);
    try {
      const { addedCount, scanResult } = await scanDelayedTasks(true);
      setDelayedScan(scanResult);
      if (addedCount > 0) {
        showFeedback(`Audit complete: Dispatched ${addedCount} delayed alerts to inbox and OS tray.`, 'success');
        setFilterCategory('delayed');
      } else if (scanResult.totalDelayedCount > 0) {
        showFeedback(`${scanResult.totalDelayedCount} delayed items recorded in your archives.`, 'info');
        setFilterCategory('delayed');
      } else {
        showFeedback('All quests, strategic goals, and campaigns are perfectly on schedule!', 'success');
      }
    } catch (e: any) {
      showFeedback('Audit completed.', 'info');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleResolveTask = (entityType?: string, entityId?: string, msgId?: string) => {
    if (entityId) {
      if (entityType === 'quest') {
        updateQuest(entityId, { status: 'Completed', completedAt: new Date().toISOString() });
      } else if (entityType === 'goal') {
        updateGoal(entityId, { status: 'Completed' });
      } else if (entityType === 'project') {
        updateProject(entityId, { status: 'Completed' });
      }
    }
    if (msgId) {
      markSystemMessageRead(msgId);
    }
    soundSystem.playNotification('achievement');
    showFeedback('Task marked completed and resolved!', 'success');
  };

  const handleSnoozeTask = (entityType?: string, entityId?: string, msgId?: string, days = 1) => {
    if (entityId && entityType) {
      const newDate = snoozeEntity(
        entityType as any,
        entityId,
        days,
        state,
        { updateQuest, updateGoal, updateProject }
      );
      if (msgId) {
        markSystemMessageRead(msgId);
      }
      soundSystem.playNotification('note');
      showFeedback(`Rescheduled +${days} day${days > 1 ? 's' : ''} (New deadline: ${newDate})`, 'info');
    }
  };

  const handleSnoozeAllDelayed = (days = 1) => {
    let count = 0;
    const delayedQuests = (state.quests || []).filter(q => q.status === 'Active' && (q.postponedTo || q.deadline) && (q.postponedTo || q.deadline)! < (state.systemDate || ''));
    
    delayedQuests.forEach(q => {
      snoozeEntity('quest', q.id, days, state, { updateQuest, updateGoal, updateProject });
      count++;
    });

    delayedMessages.forEach(m => markSystemMessageRead(m.id));
    soundSystem.playNotification('note');
    showFeedback(`Postponed ${count} overdue quest${count !== 1 ? 's' : ''} forward by ${days} day.`, 'success');
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addSystemMessage({
      sender: 'OPERATOR',
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      priority: newPriority
    });

    setNewTitle('');
    setNewContent('');
    setIsDispatching(false);
    showFeedback('Sanctum communiqué inscribed & dispatched!', 'success');
  };

  const applyPreset = (title: string, category: 'note' | 'alert' | 'warning' | 'delayed', priority: 'low' | 'medium' | 'high' | 'urgent', content: string) => {
    setNewTitle(title);
    setNewCategory(category);
    setNewPriority(priority);
    setNewContent(content);
  };

  const filteredMessages = messages.filter(m => {
    if (filterCategory === 'unread') return !m.read;
    if (filterCategory === 'all') return true;
    return m.category === filterCategory;
  });

  const getCategoryIcon = (category: SystemMessage['category']) => {
    switch (category) {
      case 'delayed':
        return <Clock className="h-4 w-4 text-amber-400 animate-pulse" />;
      case 'alert':
        return <Bell className="h-4 w-4 text-[#c5a059]" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-[#fef08a]" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'log':
        return <Terminal className="h-4 w-4 text-[#e5c875]" />;
      case 'note':
      default:
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getCategoryBadgeClass = (category: SystemMessage['category']) => {
    switch (category) {
      case 'delayed':
        return 'bg-amber-950/70 border-amber-500/50 text-amber-300';
      case 'alert':
        return 'bg-[#3a2e12] border-[#c5a059]/40 text-[#fef08a]';
      case 'achievement':
        return 'bg-[#3a2e12] border-[#c5a059]/50 text-[#fef08a]';
      case 'warning':
        return 'bg-rose-950/60 border-rose-500/40 text-rose-400';
      case 'log':
        return 'bg-[#141824] border-[#c5a059]/30 text-zinc-300';
      case 'note':
      default:
        return 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className={`glass-panel rounded-xl border border-[#c5a059]/30 bg-[#0b0d13]/98 relative overflow-hidden shadow-2xl ${compact ? 'p-3.5' : 'p-5'} space-y-3.5`} id="system-message-box-root">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
      
      {/* HEADER BAR: ULTRA-CLEAN & BALANCED */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#c5a059]/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#fef08a] animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                SACRED COMMUNIQUÉS
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a] px-2 py-0.5 rounded-full">
                  {unreadCount} UNREAD
                </span>
              )}
              {delayedScan.totalDelayedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterCategory('delayed')}
                  className="text-[10px] font-mono font-bold bg-amber-950/90 hover:bg-amber-900 border border-amber-500/60 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  title="Filter overdue directives"
                >
                  <Clock className="h-3 w-3 animate-pulse" />
                  {delayedScan.totalDelayedCount} OVERDUE
                </button>
              )}
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              Directives, overdue trials, and milestone decrees synced across PC & Mobile
            </p>
          </div>
        </div>

        {/* PRIMARY CONTROLS: MINIMALIST & HIGH INTENT */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
          {/* OS Notification Status & Quick Test */}
          {permState === 'granted' ? (
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={isTesting}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Native PC & Mobile alerts active. Click to test delivery."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OS SYNCED</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-[#c5a059] bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] text-black font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:brightness-110"
              title="Enable native desktop & phone lockscreen notifications"
            >
              <Bell className="h-3 w-3" />
              <span>ENABLE OS ALERTS</span>
            </button>
          )}

          {/* Overdue Audit */}
          <button
            type="button"
            onClick={handleAuditDelayedTasks}
            disabled={isAuditing}
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            title="Scan for overdue quests, goals, and campaigns"
          >
            <RefreshCw className={`h-3 w-3 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'AUDITING...' : 'AUDIT'}</span>
          </button>

          {/* Inscribe Message Toggle */}
          <button
            type="button"
            onClick={() => setIsDispatching(!isDispatching)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold uppercase flex items-center gap-1 transition-all cursor-pointer ${
              isDispatching 
                ? 'bg-[#c5a059] text-black border-[#c5a059]' 
                : 'bg-[#141824] hover:bg-[#3a2e12] border-[#c5a059]/30 text-[#fef08a]'
            }`}
            title="Inscribe a new sanctum decree or note"
          >
            <Send className="h-3 w-3" />
            <span>{isDispatching ? 'CLOSE' : 'INSCRIBE'}</span>
          </button>

          {/* Settings Popover Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showSettings 
                ? 'bg-[#3a2e12] border-[#c5a059] text-[#fef08a]' 
                : 'bg-[#07080c] border-white/10 text-zinc-400 hover:text-white hover:border-[#c5a059]/40'
            }`}
            title="Notification preferences"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllSystemMessagesRead}
              className="p-1.5 rounded-lg border border-white/10 bg-[#07080c] hover:bg-white/5 text-zinc-400 hover:text-[#c5a059] transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Purge All */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Purge all communiqués from sacred inbox?")) {
                  clearAllSystemMessages();
                  showFeedback("Archive cleared.", "info");
                }
              }}
              className="p-1.5 rounded-lg border border-white/10 bg-[#07080c] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Purge archive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Close Modal */}
          {onClose && (
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* COMPACT SETTINGS POPOVER DRAWER */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl border border-[#c5a059]/30 bg-[#07080c] space-y-2.5 overflow-hidden shadow-lg"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#c5a059] uppercase border-b border-[#c5a059]/20 pb-1.5">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> NOTIFICATION PREFERENCES
              </span>
              <button 
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-zinc-950/60 cursor-pointer hover:border-[#c5a059]/30">
                <input
                  type="checkbox"
                  checked={state.notificationSettings?.enableDesktopNotifications !== false}
                  onChange={(e) => updateNotificationSettings({ enableDesktopNotifications: e.target.checked })}
                  className="rounded border-zinc-700 text-[#c5a059] focus:ring-0"
                />
                <span className="font-mono text-zinc-300 text-[11px]">Native OS Alerts</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-zinc-950/60 cursor-pointer hover:border-[#c5a059]/30">
                <input
                  type="checkbox"
                  checked={state.notificationSettings?.enableSound !== false}
                  onChange={(e) => {
                    updateNotificationSettings({ enableSound: e.target.checked });
                    soundSystem.setMuted(!e.target.checked);
                    setIsMuted(!e.target.checked);
                  }}
                  className="rounded border-zinc-700 text-[#c5a059] focus:ring-0"
                />
                <span className="font-mono text-zinc-300 text-[11px]">Audio Chimes</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-zinc-950/60 cursor-pointer hover:border-[#c5a059]/30">
                <input
                  type="checkbox"
                  checked={state.notificationSettings?.enableVibration !== false}
                  onChange={(e) => {
                    updateNotificationSettings({ enableVibration: e.target.checked });
                    if (e.target.checked) triggerVibration([100, 50, 100]);
                  }}
                  className="rounded border-zinc-700 text-[#c5a059] focus:ring-0"
                />
                <span className="font-mono text-zinc-300 text-[11px]">Mobile Vibration</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-zinc-950/60 cursor-pointer hover:border-[#c5a059]/30">
                <input
                  type="checkbox"
                  checked={state.notificationSettings?.notifyDelayedQuests !== false}
                  onChange={(e) => updateNotificationSettings({ notifyDelayedQuests: e.target.checked })}
                  className="rounded border-zinc-700 text-[#c5a059] focus:ring-0"
                />
                <span className="font-mono text-zinc-300 text-[11px]">Auto Delayed Scan</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STREAMLINED INSCRIBE DRAWER WITH ONE-CLICK PRESETS */}
      <AnimatePresence>
        {isDispatching && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleDispatch}
            className="p-3.5 bg-[#07080c] border border-[#c5a059]/30 rounded-xl space-y-2.5 overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center text-xs font-mono text-[#c5a059] font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-[#c5a059]" /> INSCRIBE SACRED DECREE
              </span>
              <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('Daily Recalibration Directive', 'note', 'medium', 'Review daily commitments, prayers, and deep focus goals.')}
                  className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  Daily Review
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Peril Warning: Stagnation', 'warning', 'urgent', 'Momentum is waning. Re-engage high-priority quests immediately.')}
                  className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-rose-300 cursor-pointer"
                >
                  Warning
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Decree Title..."
                  className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                  required
                />
              </div>

              <div className="flex gap-2">
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-1/2 bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#c5a059] font-mono"
                >
                  <option value="note">Scroll / Note</option>
                  <option value="alert">Alert</option>
                  <option value="delayed">Delayed Notice</option>
                  <option value="warning">Warning</option>
                </select>
                <select 
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-1/2 bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#c5a059] font-mono"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <textarea 
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Inscribe instructions, reminders, or observations..."
              className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
              required
            />

            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsDispatching(false)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-3 py-1 cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] hover:brightness-110 text-black font-mono font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors uppercase flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Send className="h-3 w-3" /> DISPATCH
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* DISCREET FEEDBACK BANNER */}
      <AnimatePresence>
        {feedbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center justify-between gap-2 ${
              feedbackBanner.type === 'warn'
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                : feedbackBanner.type === 'info'
                ? 'bg-[#141824] border-cyan-500/40 text-cyan-300'
                : 'bg-[#141824] border-[#c5a059]/40 text-[#fef08a]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{feedbackBanner.text}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setFeedbackBanner(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STREAMLINED FILTER + BATCH ACTIONS BAR */}
      <div className="flex items-center justify-between gap-2 border-b border-[#c5a059]/20 pb-2.5 flex-wrap">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: `ALL (${messages.length})` },
            { id: 'unread', label: `UNREAD (${unreadCount})` },
            { id: 'delayed', label: `OVERDUE (${delayedScan.totalDelayedCount})`, icon: Clock },
            { id: 'alert', label: 'ALERTS' },
            { id: 'achievement', label: 'ACHIEVEMENTS' },
            { id: 'note', label: 'SCROLLS' }
          ].map(tab => {
            const isDelayedTab = tab.id === 'delayed';
            const isSelected = filterCategory === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id as any)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                  isSelected
                    ? isDelayedTab
                      ? 'bg-amber-950 border border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 shadow-sm' 
                    : isDelayedTab && delayedScan.totalDelayedCount > 0
                    ? 'bg-amber-950/40 text-amber-300/90 border border-amber-500/40 hover:bg-amber-950/70'
                    : 'bg-[#07080c] hover:bg-white/[0.04] text-zinc-400 border border-white/5'
                }`}
              >
                {Icon && <Icon className="h-3 w-3 text-amber-400" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* BATCH ACTION: QUICK SNOOZE ALL OVERDUE */}
        {delayedScan.totalDelayedCount > 0 && (
          <button
            type="button"
            onClick={() => handleSnoozeAllDelayed(1)}
            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-amber-500/50 bg-amber-950/70 hover:bg-amber-900 text-amber-200 transition-colors flex items-center gap-1 cursor-pointer ml-auto"
            title="Snooze all overdue tasks by 1 day"
          >
            <CalendarPlus className="h-3 w-3 text-amber-400" />
            <span>SNOOZE ALL (+1D)</span>
          </button>
        )}
      </div>

      {/* MESSAGES LIST */}
      {filteredMessages.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-[#c5a059]/20 rounded-xl">
          <RubElHizbIcon className="h-7 w-7 text-[#c5a059]/40 mx-auto animate-pulse" />
          <p className="text-xs text-zinc-300 font-sans">
            {filterCategory === 'delayed'
              ? 'No delayed directives logged in your archive.'
              : 'No communiqués in this sanctum repository.'}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">
            {filterCategory === 'delayed'
              ? 'All tracked trials are operating within schedule.'
              : 'Directives, reflections, and trial updates will manifest here.'}
          </p>
          {filterCategory === 'delayed' && delayedScan.totalDelayedCount > 0 && (
            <button
              type="button"
              onClick={handleAuditDelayedTasks}
              className="text-[10px] font-mono font-bold mt-2 px-3 py-1 bg-amber-950/70 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-900 transition-colors cursor-pointer"
            >
              Audit & Generate Alerts for {delayedScan.totalDelayedCount} Overdue Items
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
          {filteredMessages.map(msg => {
            const isDelayed = msg.category === 'delayed';
            return (
              <div 
                key={msg.id}
                onClick={() => {
                  if (!msg.read) markSystemMessageRead(msg.id);
                }}
                className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                  isDelayed
                    ? !msg.read
                      ? 'bg-gradient-to-r from-amber-950/40 to-[#141824] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                      : 'bg-[#0a0805]/70 border-amber-500/20 opacity-90 hover:opacity-100'
                    : !msg.read 
                    ? 'bg-[#141824] border-[#c5a059]/40 shadow-[0_0_15px_rgba(197,160,89,0.08)]' 
                    : 'bg-[#07080c]/60 border-[#c5a059]/10 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${getCategoryBadgeClass(msg.category)}`}>
                      {getCategoryIcon(msg.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-sans font-bold text-white">
                          {msg.title}
                        </span>
                        {!msg.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#fef08a] animate-pulse shrink-0" />
                        )}
                        <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold">
                          {msg.sender}
                        </span>
                        {isDelayed && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {msg.daysDelayed ? `${msg.daysDelayed}D OVERDUE` : 'OVERDUE'}
                          </span>
                        )}
                        {msg.entityType && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold">
                            {msg.entityType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[9px] font-mono text-zinc-400">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                        {msg.dueDate && <span>Due: {msg.dueDate}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {!msg.read && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markSystemMessageRead(msg.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-[#fef08a] transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSystemMessage(msg.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-2 pl-7 border-l border-[#c5a059]/20">
                  {msg.content}
                </p>

                {/* DIRECT ACTION BAR ON CARD FOR DELAYED DIRECTIVES (10/10 WORKFLOW) */}
                {isDelayed && msg.entityId && (
                  <div className="mt-2.5 pl-7 flex items-center gap-2 flex-wrap">
                    {/* Mark Done */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveTask(msg.entityType, msg.entityId, msg.id);
                      }}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Mark task completed"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      DONE
                    </button>

                    {/* +1 Day Snooze */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSnoozeTask(msg.entityType, msg.entityId, msg.id, 1);
                      }}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reschedule deadline forward by 1 day"
                    >
                      <CalendarPlus className="h-3 w-3 text-amber-400" />
                      +1D SNOOZE
                    </button>

                    {/* +3 Days Snooze */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSnoozeTask(msg.entityType, msg.entityId, msg.id, 3);
                      }}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reschedule deadline forward by 3 days"
                    >
                      +3D SNOOZE
                    </button>

                    {/* View in App */}
                    {(msg.entityType === 'quest' && onNavigateToQuest) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markSystemMessageRead(msg.id);
                          onNavigateToQuest(msg.entityId!);
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1 ml-auto"
                      >
                        VIEW QUEST <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                    {(msg.entityType === 'goal' && onNavigateToGoal) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markSystemMessageRead(msg.id);
                          onNavigateToGoal(msg.entityId!);
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1 ml-auto"
                      >
                        VIEW GOAL <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                    {(msg.entityType === 'project' && onNavigateToProject) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markSystemMessageRead(msg.id);
                          onNavigateToProject(msg.entityId!);
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1 ml-auto"
                      >
                        VIEW CAMPAIGN <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
