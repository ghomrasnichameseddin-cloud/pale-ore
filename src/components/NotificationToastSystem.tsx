import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSContext';
import { SystemMessage } from '../types';
import { Award, Bell, ShieldAlert, Terminal, MessageSquare, AlertTriangle, X, Inbox, Sparkles, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundSystem } from '../utils/soundEffects';

interface NotificationToastSystemProps {
  onOpenInbox?: () => void;
}

export const NotificationToastSystem: React.FC<NotificationToastSystemProps> = ({ onOpenInbox }) => {
  const { state, markSystemMessageRead } = usePOS();
  const [activeToast, setActiveToast] = useState<SystemMessage | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(soundSystem.getMuted());

  const messages = state.messages || [];

  useEffect(() => {
    // Find unread messages that haven't been shown in toast yet
    const unreadNew = messages.filter(m => !m.read && !seenIds.has(m.id));
    if (unreadNew.length > 0) {
      // Pick the most recent unread
      const latest = unreadNew[unreadNew.length - 1];
      setActiveToast(latest);
      setSeenIds(prev => new Set(prev).add(latest.id));
      
      // Play synthesized notification sound chime
      soundSystem.playNotification(latest.category);
    }
  }, [messages]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundSystem.setMuted(nextMute);
    if (!nextMute) {
      soundSystem.playNotification('note');
    }
  };

  // Auto hide after 7 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const getCategoryIcon = (category: SystemMessage['category']) => {
    switch (category) {
      case 'achievement':
        return <Award className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />;
      case 'alert':
        return <Bell className="h-5 w-5 text-cyan-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 animate-pulse" />;
      case 'log':
        return <Terminal className="h-5 w-5 text-purple-400 shrink-0" />;
      case 'note':
      default:
        return <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />;
    }
  };

  const getCategoryBorder = (category: SystemMessage['category']) => {
    switch (category) {
      case 'achievement':
        return 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] bg-zinc-950/95';
      case 'alert':
        return 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] bg-zinc-950/95';
      case 'warning':
        return 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)] bg-zinc-950/95';
      case 'log':
        return 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] bg-zinc-950/95';
      case 'note':
      default:
        return 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] bg-zinc-950/95';
    }
  };

  const handleDismiss = () => {
    if (activeToast) {
      markSystemMessageRead(activeToast.id);
    }
    setActiveToast(null);
  };

  const handleOpenInboxClick = () => {
    if (activeToast) {
      markSystemMessageRead(activeToast.id);
    }
    setActiveToast(null);
    if (onOpenInbox) {
      onOpenInbox();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full px-4 pointer-events-none">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto rounded-xl border p-4 backdrop-blur-md ${getCategoryBorder(activeToast.category)} space-y-3`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 mt-0.5">
                  {getCategoryIcon(activeToast.category)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                      {activeToast.sender}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {new Date(activeToast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white leading-tight">
                    {activeToast.title}
                  </h4>
                  <p className="text-xs font-sans text-zinc-300 line-clamp-2 leading-snug">
                    {activeToast.content}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-zinc-500 hover:text-cyan-400 p-1 rounded transition"
                  title={isMuted ? "Unmute Notification Sounds" : "Mute Notification Sounds"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-zinc-500 hover:text-white p-1 rounded transition"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              <span className="text-[10px] font-mono text-zinc-400">
                SYSTEM MESSAGE DISPATCHED
              </span>
              <button
                type="button"
                onClick={handleOpenInboxClick}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <Inbox className="h-3.5 w-3.5" />
                OPEN MESSAGE BOX
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
