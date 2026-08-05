import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { SystemMessage } from '../types';
import { 
  Inbox, Bell, ShieldAlert, Award, MessageSquare, AlertTriangle, 
  Check, CheckCheck, Trash2, Send, Filter, Info, X, Terminal, Clock, RefreshCw, Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundSystem } from '../utils/soundEffects';

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
      sender: 'OPERATOR',
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
        return <Bell className="h-4 w-4 text-cyan-400" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-amber-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'log':
        return <Terminal className="h-4 w-4 text-purple-400" />;
      case 'note':
      default:
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getCategoryBadgeClass = (category: SystemMessage['category']) => {
    switch (category) {
      case 'alert':
        return 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400';
      case 'achievement':
        return 'bg-amber-950/60 border-amber-500/30 text-amber-300';
      case 'warning':
        return 'bg-rose-950/60 border-rose-500/30 text-rose-400';
      case 'log':
        return 'bg-purple-950/60 border-purple-500/30 text-purple-300';
      case 'note':
      default:
        return 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className={`glass-panel rounded-lg ${compact ? 'p-4' : 'p-6'} space-y-5`} id="system-message-box-root">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Inbox className="h-5 w-5 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                System Message Box
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-zinc-500">
              POS_COMM_CENTER • Real-time notifications & operator log dispatches
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
            className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
              isMuted 
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' 
                : 'bg-zinc-900 border-white/10 text-cyan-400 hover:bg-zinc-800'
            }`}
            title={isMuted ? "Unmute system notification audio" : "Test chime & mute toggle"}
          >
            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {isMuted ? 'MUTED' : 'AUDIO ON'}
          </button>

          <button
            onClick={() => setIsDispatching(!isDispatching)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded border font-bold uppercase flex items-center gap-1.5 transition-all ${
              isDispatching 
                ? 'bg-cyan-500 text-black border-cyan-400' 
                : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-cyan-400'
            }`}
          >
            <Send className="h-3 w-3" />
            {isDispatching ? 'CLOSE DISPATCH' : 'DISPATCH MESSAGE'}
          </button>

          {messages.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllSystemMessagesRead}
                  className="text-[10px] font-mono px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3 text-cyan-400" />
                  READ ALL
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm("Clear all messages from System Inbox?")) {
                    clearAllSystemMessages();
                  }
                }}
                className="text-[10px] font-mono p-1 bg-zinc-900 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                title="Purge all messages"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors"
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
            className="p-4 bg-zinc-950 border border-cyan-500/30 rounded-lg space-y-3 overflow-hidden"
          >
            <div className="flex justify-between items-center text-xs font-mono text-cyan-400 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> OPERATOR_MESSAGE_DISPATCH
              </span>
              <span className="text-[9px] text-zinc-500">SENDER: OPERATOR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Subject / Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Protocol Override Note / Sprint Reflection..."
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="note">📝 Note / Reflection</option>
                  <option value="alert">🔔 System Alert</option>
                  <option value="warning">⚠️ Warning / Risk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">Message Content</label>
              <textarea 
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Log your directive or operational notes into the System Inbox..."
                className="w-full bg-zinc-900 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setIsDispatching(false)}
                className="text-xs font-mono text-zinc-500 hover:text-zinc-300 px-3 py-1"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs px-4 py-1 rounded transition-colors uppercase flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" /> DISPATCH TO INBOX
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 pb-3">
        <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" /> FILTER:
        </span>

        {[
          { id: 'all', label: `ALL (${messages.length})` },
          { id: 'unread', label: `UNREAD (${unreadCount})` },
          { id: 'alert', label: 'ALERTS' },
          { id: 'achievement', label: 'ACHIEVEMENTS' },
          { id: 'note', label: 'NOTES' },
          { id: 'warning', label: 'WARNINGS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as any)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded transition-all ${
              filterCategory === tab.id 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MESSAGES LIST */}
      {filteredMessages.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-white/5 rounded-lg">
          <Inbox className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-xs text-zinc-400 font-sans">No messages found in this view.</p>
          <p className="text-[10px] text-zinc-500 font-mono">System messages and focus alerts will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredMessages.map(msg => (
            <div 
              key={msg.id}
              onClick={() => {
                if (!msg.read) markSystemMessageRead(msg.id);
              }}
              className={`p-3.5 rounded-lg border transition-all relative group ${
                !msg.read 
                  ? 'bg-zinc-900/90 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.03)]' 
                  : 'bg-zinc-950/50 border-white/5 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md border shrink-0 ${getCategoryBadgeClass(msg.category)}`}>
                    {getCategoryIcon(msg.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-sans font-bold text-white">
                        {msg.title}
                      </span>
                      {!msg.read && (
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                      )}
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        SENDER: {msg.sender}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">
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
                      className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
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

              <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-2.5 pl-8 border-l border-white/5">
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
