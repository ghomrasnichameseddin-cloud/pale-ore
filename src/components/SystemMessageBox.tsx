import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { SystemMessage } from '../types';
import { 
  Inbox, Bell, ShieldAlert, Award, MessageSquare, AlertTriangle, 
  Check, CheckCheck, Trash2, Send, Filter, Info, X, Terminal, Clock, RefreshCw, Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundSystem } from '../utils/soundEffects';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';

interface SystemMessageBoxProps {
  compact?: boolean;
  onClose?: () => void;
}

export const SystemMessageBox: React.FC<SystemMessageBoxProps> = ({ compact = false, onClose }) => {
  const { 
    state, addSystemMessage, markSystemMessageRead, 
    markAllSystemMessagesRead, deleteSystemMessage, clearAllSystemMessages 
  } = usePOS();

  const messages = state.messages || [];
  const unreadCount = messages.filter(m => !m.read).length;

  const [isMuted, setIsMuted] = useState(soundSystem.getMuted());
  const [filterCategory, setFilterCategory] = useState<'all' | 'alert' | 'achievement' | 'note' | 'warning' | 'unread'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'note' | 'alert' | 'warning'>('note');
  const [isDispatching, setIsDispatching] = useState(false);

  const filteredMessages = messages.filter(m => {
    if (filterCategory === 'unread') return !m.read;
    if (filterCategory === 'all') return true;
    return m.category === filterCategory;
  });

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addSystemMessage({
      sender: 'DIVINE ORACLE',
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      priority: 'medium'
    });

    setNewTitle('');
    setNewContent('');
    setIsDispatching(false);
  };

  const getCategoryIcon = (category: SystemMessage['category']) => {
    switch (category) {
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
    <div className={`glass-panel rounded-xl border border-[#c5a059]/30 bg-[#0b0d13]/90 relative overflow-hidden shadow-xl ${compact ? 'p-4' : 'p-6'} space-y-5`} id="system-message-box-root">
      <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c5a059]/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#fef08a] animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                SACRED COMMUNIQUÉS & ARCHIVES
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-[#3a2e12] border border-[#c5a059]/50 text-[#fef08a] px-2 py-0.5 rounded-full">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              ORACLE_COMM_SANCTUM • Divine dispatches & trial records
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              soundSystem.setMuted(nextMute);
              if (!nextMute) {
                soundSystem.playNotification('achievement');
              }
            }}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
              isMuted 
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' 
                : 'bg-[#07080c] border-[#c5a059]/30 text-[#fef08a] hover:border-[#c5a059]'
            }`}
            title={isMuted ? "Unmute system notification audio" : "Test chime & mute toggle"}
          >
            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-[#c5a059]" />}
            {isMuted ? 'CHIMES MUTED' : 'CHIMES ACTIVE'}
          </button>

          <button
            onClick={() => setIsDispatching(!isDispatching)}
            className={`text-[10px] font-mono px-3 py-1 rounded-lg border font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              isDispatching 
                ? 'bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] text-black border-[#c5a059]' 
                : 'bg-[#3a2e12] hover:bg-[#4a3b18] border-[#c5a059]/40 text-[#fef08a]'
            }`}
          >
            <Send className="h-3 w-3" />
            {isDispatching ? 'CLOSE DISPATCH' : 'INSCRIBE DISPATCH'}
          </button>

          {messages.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllSystemMessagesRead}
                  className="text-[10px] font-mono px-2 py-1 bg-[#07080c] hover:bg-white/[0.04] border border-[#c5a059]/20 text-zinc-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3 text-[#c5a059]" />
                  READ ALL
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm("Purge all communiqués from sacred inbox?")) {
                    clearAllSystemMessages();
                  }
                }}
                className="text-[10px] font-mono p-1.5 bg-[#07080c] hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                title="Purge all messages"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* DISPATCH FORM MODAL/DRAWER */}
      <AnimatePresence>
        {isDispatching && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleDispatch}
            className="p-4 bg-[#07080c] border border-[#c5a059]/30 rounded-xl space-y-3 overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center text-xs font-mono text-[#c5a059] font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <RubElHizbIcon className="h-3.5 w-3.5 text-[#c5a059]" /> SACRED_MESSAGE_DISPATCH
              </span>
              <span className="text-[9px] text-zinc-400">SENDER: DIVINE ORACLE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Subject / Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sanctum Decree / Mastery Reflection..."
                  className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#c5a059] font-mono"
                >
                  <option value="note">📜 Sacred Scroll / Note</option>
                  <option value="alert">🔔 Sanctum Alert</option>
                  <option value="warning">⚠️ Peril Warning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Message Content</label>
              <textarea 
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Inscribe your decree into the sacred archives..."
                className="w-full bg-[#0b0d13] border border-[#c5a059]/25 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] font-sans"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setIsDispatching(false)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-3 py-1 cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#8a6d2b] to-[#c5a059] hover:brightness-110 text-black font-mono font-bold text-xs px-4 py-1.5 rounded-lg transition-colors uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3 w-3" /> DISPATCH DECREE
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#c5a059]/20 pb-3">
        <span className="text-[10px] font-mono text-zinc-400 uppercase mr-1 flex items-center gap-1 font-bold">
          <Filter className="h-3 w-3 text-[#c5a059]" /> FILTER:
        </span>

        {[
          { id: 'all', label: `ALL (${messages.length})` },
          { id: 'unread', label: `UNREAD (${unreadCount})` },
          { id: 'alert', label: 'ALERTS' },
          { id: 'achievement', label: 'ACHIEVEMENTS' },
          { id: 'note', label: 'SCROLLS' },
          { id: 'warning', label: 'WARNINGS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as any)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterCategory === tab.id 
                ? 'bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 font-bold shadow-sm' 
                : 'bg-[#07080c] hover:bg-white/[0.04] text-zinc-400 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MESSAGES LIST */}
      {filteredMessages.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-[#c5a059]/20 rounded-xl">
          <RubElHizbIcon className="h-8 w-8 text-[#c5a059]/40 mx-auto animate-pulse" />
          <p className="text-xs text-zinc-300 font-sans">No communiqués in this sanctum repository.</p>
          <p className="text-[10px] text-zinc-400 font-mono">Divine oracle dispatches and quest milestones will manifest here.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredMessages.map(msg => (
            <div 
              key={msg.id}
              onClick={() => {
                if (!msg.read) markSystemMessageRead(msg.id);
              }}
              className={`p-3.5 rounded-xl border transition-all relative group cursor-pointer ${
                !msg.read 
                  ? 'bg-[#141824] border-[#c5a059]/40 shadow-[0_0_15px_rgba(197,160,89,0.08)]' 
                  : 'bg-[#07080c]/60 border-[#c5a059]/10 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${getCategoryBadgeClass(msg.category)}`}>
                    {getCategoryIcon(msg.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-sans font-bold text-white">
                        {msg.title}
                      </span>
                      {!msg.read && (
                        <span className="h-2 w-2 rounded-full bg-[#fef08a] animate-pulse shrink-0" />
                      )}
                      <span className="text-[9px] font-mono text-[#c5a059] uppercase font-bold">
                        SENDER: {msg.sender}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!msg.read && (
                    <button 
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

              <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-2.5 pl-8 border-l border-[#c5a059]/20">
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
