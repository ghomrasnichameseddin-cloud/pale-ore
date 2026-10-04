import React, { useState, useMemo } from 'react';
import { usePOS } from '../POSContext';
import { XPHistoryEntry, XPSourceCategory, LeisureTransaction, TimeTransactionType } from '../types';
import { 
  TrendingUp, TrendingDown, Search, ArrowUpDown, 
  Download, Calendar, Award, Zap, ShieldAlert, Clock, 
  RotateCcw, ChevronLeft, ChevronRight, CheckCircle2,
  AlertTriangle, Layers, PlusCircle, Coins, Hourglass,
  Sparkles, Scale, Swords, Activity, ShieldCheck, BookOpen,
  Moon, Coffee, ShoppingBag, Eye, RefreshCw, BarChart2,
  ChevronDown, ChevronUp, SlidersHorizontal, Info, Compass
} from 'lucide-react';
import { RubElHizbIcon, ArabesqueCorner } from './IslamicRpgDecorations';
import { getLocalDateString, getSystemTimestamp } from '../utils/dateUtils';

export type CirculationCurrency = 'all' | 'xp' | 'rest' | 'coin';
export type CirculationFlow = 'all' | 'inflow' | 'outflow';

// Helper to derive the source and human label of any XP History entry
export const deriveXpSourceInfo = (entry: XPHistoryEntry, questMap: Map<string, any>): {
  category: XPSourceCategory;
  label: string;
  badgeClass: string;
  icon: any;
} => {
  const name = (entry.questName || '').toLowerCase();
  const qId = (entry.questId || '').toLowerCase();

  // 1. Explicit Ṣalāh and Mandatory Prayers
  if (entry.type === 'salah' || qId.startsWith('spiritual-prayer-') || name.includes('fardh') || name.includes('salah') || name.includes('sunnah rawatib') || name.includes('on-time bonus') || name.includes('masjid / jamā')) {
    return { category: 'salah', label: 'Ṣalāh Fulfilled', badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300', icon: RubElHizbIcon };
  }

  // 2. Explicit Adhkār Fortress & Dhikr
  if (entry.type === 'adhkar' || qId.startsWith('spiritual-adhkar-') || qId.startsWith('spiritual-dhikr-') || qId.startsWith('spiritual-salawat-') || name.includes('adhkār') || name.includes('tasbīḥ') || name.includes('dhikr') || name.includes('salawāt')) {
    return { category: 'adhkar', label: 'Adhkār Fortress', badgeClass: 'bg-teal-950/60 border-teal-500/30 text-teal-300', icon: Sparkles };
  }

  // 3. Qur'an Tilāwah & Memorization Revision
  if (qId.startsWith('spiritual-quran-') || name.includes('qur\'ān') || name.includes('quran') || name.includes('tilawah') || name.includes('tadabbur')) {
    return { category: 'quran', label: 'Qur\'ān Tilāwah', badgeClass: 'bg-amber-950/60 border-amber-500/40 text-amber-300', icon: BookOpen };
  }

  // 4. Siam & Fasting
  if (qId.startsWith('spiritual-fasting-') || name.includes('fasting') || name.includes('siam') || name.includes('suhur') || name.includes('iftar')) {
    return { category: 'fasting', label: 'Siam & Fasting', badgeClass: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300', icon: Moon };
  }

  // 5. Kaffārah Restitution Penance
  if (name.includes('[kaffārah]') || name.includes('[kaffarah]') || name.includes('[remedy]') || name.includes('kaffārah restitution')) {
    return { category: 'kaffarah', label: 'Kaffārah Restitution', badgeClass: 'bg-violet-950/60 border-violet-500/30 text-violet-300', icon: Scale };
  }

  // 6. Manual Operator Calibration
  if (name.includes('[operator]') || name.includes('manual operator') || entry.source === 'manual_adjustment') {
    return { category: 'manual_adjustment', label: 'Operator Calibration', badgeClass: 'bg-slate-900 border-slate-700 text-slate-300', icon: PlusCircle };
  }

  // 7. Muhāsabah Audit Slip
  if (entry.source === 'muhasabah' || name.includes('muhāsabah') || name.includes('muhasabah') || name.includes('mīzān') || name.includes('mizan')) {
    return { category: 'muhasabah', label: 'Muhāsabah Audit', badgeClass: 'bg-purple-950/60 border-purple-500/30 text-purple-300', icon: Scale };
  }

  // 8. Midnight Overdue Penalty
  if (entry.source === 'penalty_midnight' || name.includes('midnight penalty') || (name.includes('midnight') && entry.xp < 0)) {
    return { category: 'penalty_midnight', label: 'Midnight Lapsed', badgeClass: 'bg-rose-950/60 border-rose-500/40 text-rose-300', icon: ShieldAlert };
  }

  // 9. Failed Directive / General Penalty
  if (entry.type === 'penalty' || entry.source === 'penalty_failed' || name.includes('penalty') || entry.xp < 0) {
    return { category: 'penalty_failed', label: 'Penalty Deduction', badgeClass: 'bg-rose-950/60 border-rose-500/40 text-rose-300', icon: AlertTriangle };
  }

  // 10. Focus Session
  if (entry.type === 'focus' || entry.source === 'focus' || name.includes('focus session') || name.includes('🧘') || name.includes('work block')) {
    return { category: 'focus', label: 'Focus Session', badgeClass: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300', icon: Clock };
  }

  // 11. Resonance Surge
  if (entry.source === 'surge' || name.includes('xp surge') || name.includes('streak surge')) {
    return { category: 'surge', label: 'Resonance Surge', badgeClass: 'bg-amber-950/60 border-amber-500/30 text-amber-300', icon: Zap };
  }

  // 12. Boss Trials & Gates
  if (entry.type === 'boss' || entry.source === 'boss' || name.includes('boss')) {
    return { category: 'boss', label: 'Boss Trial', badgeClass: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300', icon: Award };
  }

  // 13. Habits & Recurring Rites
  if (entry.type === 'habit' || entry.source === 'habit') {
    return { category: 'habit', label: 'Habit Rite', badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300', icon: RotateCcw };
  }

  // 14. Check if associated quest is a Habit or Boss
  if (entry.questId && questMap.has(entry.questId)) {
    const q = questMap.get(entry.questId);
    if (q.type === 'Habit' || q.cadence) {
      return { category: 'habit', label: 'Habit Rite', badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300', icon: RotateCcw };
    }
    if (q.type === 'Boss') {
      return { category: 'boss', label: 'Boss Trial', badgeClass: 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300', icon: Award };
    }
  }

  return { category: 'quest', label: 'Direct Quest', badgeClass: 'bg-blue-950/60 border-blue-500/30 text-blue-300', icon: Swords };
};

// Map temporal leisure transaction types to human-readable domain info
export const deriveRestSourceInfo = (type: string, reason: string): {
  label: string;
  badgeClass: string;
  icon: any;
} => {
  const normType = (type || '').toLowerCase();
  const normReason = (reason || '').toLowerCase();

  if (normType === 'focus_mint' || normReason.includes('focus')) {
    return { label: 'Focus Mint', badgeClass: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300', icon: Clock };
  }
  if (normType === 'quest_dividend' || normReason.includes('quest') || normReason.includes('dividend')) {
    return { label: 'Quest Dividend', badgeClass: 'bg-blue-950/60 border-blue-500/30 text-blue-300', icon: Swords };
  }
  if (normType === 'ritual_reward' || normReason.includes('prayer') || normReason.includes('salah') || normReason.includes('quran')) {
    return { label: 'Sacred Ritual', badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300', icon: Moon };
  }
  if (normType === 'leisure_redemption' || normReason.includes('active rest') || normReason.includes('redeemed') || normReason.includes('pass')) {
    return { label: 'Active Rest Pass', badgeClass: 'bg-purple-950/60 border-purple-500/30 text-purple-300', icon: Coffee };
  }
  if (normType === 'rest_refund' || normReason.includes('refund') || normReason.includes('early')) {
    return { label: 'Rest Refund', badgeClass: 'bg-teal-950/60 border-teal-500/30 text-teal-300', icon: RotateCcw };
  }
  if (normType === 'time_debt_penalty' || normReason.includes('penalty') || normReason.includes('breach') || normReason.includes('overdraft')) {
    return { label: 'Temporal Penalty', badgeClass: 'bg-rose-950/60 border-rose-500/40 text-rose-300', icon: AlertTriangle };
  }
  if (normType === 'app_usage_deduction' || normReason.includes('usage') || normReason.includes('digital limit')) {
    return { label: 'Digital Breach', badgeClass: 'bg-amber-950/60 border-amber-500/40 text-amber-300', icon: ShieldAlert };
  }
  return { label: 'Temporal Adjustment', badgeClass: 'bg-slate-900 border-slate-700 text-slate-300', icon: Hourglass };
};

export interface UnifiedCirculationItem {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  currency: 'xp' | 'rest' | 'coin';
  direction: 'inflow' | 'outflow';
  delta: number; // Signed delta
  unit: string; // 'XP', 'm', '🪙'
  runningBalance: number;
  title: string;
  domainLabel: string;
  domainBadgeClass: string;
  Icon: any;
  categoryFilterKey: string;
  metadata: {
    questId?: string | null;
    skillIds?: string[];
    passId?: string;
    inventoryId?: string;
    reason?: string;
    type?: string;
  };
}

export interface ImperialCirculationLedgerProps {
  onNavigate?: (tab: string) => void;
}

export const ImperialCirculationLedger: React.FC<ImperialCirculationLedgerProps> = ({ onNavigate }) => {
  const { 
    state, addXp, addTimeCredits, addCoins, getPlayerLevelInfo, 
    getXPAnalytics, getTemporalCapitalInfo, getDailyRestState
  } = usePOS();

  // Active Currency Stream Tab
  const [selectedCurrency, setSelectedCurrency] = useState<CirculationCurrency>('all');
  const [selectedFlow, setSelectedFlow] = useState<CirculationFlow>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_impact' | 'highest_deduction'>('newest');

  // Sub-Panels
  const [expandedIntelligencePanel, setExpandedIntelligencePanel] = useState<'none' | 'xp' | 'temporal' | 'treasury'>('xp');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Calibration Modal State
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [calibrateCurrency, setCalibrateCurrency] = useState<'xp' | 'rest' | 'coin'>('xp');
  const [calibrateDirection, setCalibrateDirection] = useState<'inflow' | 'outflow'>('inflow');
  const [calibrateAmount, setCalibrateAmount] = useState<number>(50);
  const [calibrateReason, setCalibrateReason] = useState<string>('');
  const [calibrateSkillId, setCalibrateSkillId] = useState<string>('');

  const questMap = useMemo(() => {
    const map = new Map<string, any>();
    (state.quests || []).forEach(q => map.set(q.id, q));
    return map;
  }, [state.quests]);

  const skillMap = useMemo(() => {
    const map = new Map<string, string>();
    (state.skills || []).forEach(s => map.set(s.id, s.name));
    return map;
  }, [state.skills]);

  const playerLevelInfo = getPlayerLevelInfo();
  const temporalInfo = getTemporalCapitalInfo ? getTemporalCapitalInfo() : null;
  const restState = getDailyRestState ? getDailyRestState() : null;
  const xpAnalytics = useMemo(() => {
    if (typeof getXPAnalytics === 'function') {
      return getXPAnalytics();
    }
    return null;
  }, [state.xpHistory, state.systemDate, state.skills, state.quests, getXPAnalytics]);

  // 1. RECONSTRUCT XP CHRONOLOGICAL STREAM
  const xpItems = useMemo<UnifiedCirculationItem[]>(() => {
    const raw = [...(state.xpHistory || [])];
    raw.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let running = 0;
    return raw.map(entry => {
      running += entry.xp;
      const source = deriveXpSourceInfo(entry, questMap);
      return {
        id: `xp-${entry.id}`,
        timestamp: entry.timestamp,
        date: entry.date || entry.timestamp.split('T')[0],
        currency: 'xp' as const,
        direction: entry.xp >= 0 ? 'inflow' as const : 'outflow' as const,
        delta: entry.xp,
        unit: 'XP',
        runningBalance: running,
        title: entry.questName || 'System Decree / Event',
        domainLabel: source.label,
        domainBadgeClass: source.badgeClass,
        Icon: source.icon,
        categoryFilterKey: source.category,
        metadata: {
          questId: entry.questId,
          skillIds: entry.skillIds,
          type: entry.type
        }
      };
    });
  }, [state.xpHistory, questMap]);

  // 2. RECONSTRUCT TEMPORAL REST CAPITAL STREAM
  const restItems = useMemo<UnifiedCirculationItem[]>(() => {
    const raw = [...(state.timeHistory || [])];
    // If empty, supply an initial baseline endowment of 60m
    if (raw.length === 0) {
      const genesisDate = state.systemDate ? `${state.systemDate}T00:00:00` : new Date().toISOString();
      return [{
        id: 'time-genesis-seed',
        timestamp: genesisDate,
        date: genesisDate.split('T')[0],
        currency: 'rest' as const,
        direction: 'inflow' as const,
        delta: 60,
        unit: 'm',
        runningBalance: 60,
        title: 'Genesis Leisure Bank Endowment',
        domainLabel: 'Rest Reserve',
        domainBadgeClass: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
        Icon: Clock,
        categoryFilterKey: 'focus_mint',
        metadata: { reason: 'Sanctum Genesis Rest Allocation' }
      }];
    }

    raw.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let running = 0;
    return raw.map(tx => {
      const delta = tx.minutesDelta !== undefined ? tx.minutesDelta : (tx.minutes || 0);
      running = tx.endingBalance !== undefined ? tx.endingBalance : (tx.balanceAfter !== undefined ? tx.balanceAfter : Math.max(0, running + delta));
      const source = deriveRestSourceInfo(tx.type, tx.reason);
      return {
        id: `rest-${tx.id}`,
        timestamp: tx.timestamp,
        date: tx.timestamp.split('T')[0],
        currency: 'rest' as const,
        direction: delta >= 0 ? 'inflow' as const : 'outflow' as const,
        delta,
        unit: 'm',
        runningBalance: running,
        title: tx.reason || 'Rest Allocation / Usage',
        domainLabel: source.label,
        domainBadgeClass: source.badgeClass,
        Icon: source.icon,
        categoryFilterKey: tx.type,
        metadata: {
          passId: tx.linkedId || tx.relatedId,
          reason: tx.reason,
          type: tx.type
        }
      };
    });
  }, [state.timeHistory, state.systemDate]);

  // 3. RECONSTRUCT IMPERIAL GOLD DINARS STREAM
  const coinItems = useMemo<UnifiedCirculationItem[]>(() => {
    const events: {
      id: string;
      timestamp: string;
      delta: number;
      title: string;
      domainLabel: string;
      domainBadgeClass: string;
      Icon: any;
      categoryFilterKey: string;
      metadata: any;
    }[] = [];

    // Shop item redemptions & vouchers
    (state.inventory || []).forEach(item => {
      if ((item.costCoins || 0) > 0) {
        events.push({
          id: `inv-${item.id}`,
          timestamp: item.redeemedAt || getSystemTimestamp(state.systemDate),
          delta: -Math.abs(item.costCoins),
          title: `Vault Voucher Claim: ${item.itemName}`,
          domainLabel: 'Imperial Vault',
          domainBadgeClass: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          Icon: ShoppingBag,
          categoryFilterKey: 'shop_purchase',
          metadata: { inventoryId: item.id, category: item.category }
        });
      }
    });

    // Muhasabah fines
    (state.muhasabahEntries || []).forEach(entry => {
      if ((entry.coinsDeducted || 0) > 0) {
        events.push({
          id: `muh-coin-${entry.id}`,
          timestamp: entry.timestamp || `${entry.date}T12:00:00`,
          delta: -Math.abs(entry.coinsDeducted || 0),
          title: `Muhāsabah Disciplinary Fine: ${entry.title}`,
          domainLabel: 'Treasury Fine',
          domainBadgeClass: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
          Icon: Scale,
          categoryFilterKey: 'disciplinary_fine',
          metadata: { category: entry.category, severity: entry.severity }
        });
      }
    });

    // Spiritual rites & directive coin rewards
    (state.xpHistory || []).forEach(entry => {
      const qId = (entry.questId || '').toLowerCase();
      const name = (entry.questName || '').toLowerCase();
      let coinEarned = 0;
      let label = 'Sanctum Bounty';

      if (qId.includes('-fardh') || name.includes('fardh')) {
        coinEarned = 5;
        label = 'Ṣalāh Bounty';
      } else if (qId.includes('-ontime') || name.includes('on-time bonus')) {
        coinEarned = 3;
        label = 'On-Time Bonus';
      } else if (qId.includes('-masjid') || name.includes('masjid')) {
        coinEarned = 5;
        label = 'Congregation Gift';
      } else if (qId.includes('-sunnahrawatib') || name.includes('sunan rawātib')) {
        coinEarned = 2;
        label = 'Sunnah Bounty';
      } else if (qId.includes('masjid40') || name.includes('40-day')) {
        coinEarned = 15;
        label = 'Covenant Reward';
      } else if (qId.includes('salawat') || name.includes('salawāt')) {
        coinEarned = 15;
        label = 'Salawāt Reward';
      } else if (qId.includes('qiyam') || name.includes('qiyām')) {
        coinEarned = 15;
        label = 'Qiyām Night Bounty';
      } else if (qId.includes('adhkar-sabah') || qId.includes('adhkar-masa') || qId.includes('adhkar-sleep')) {
        coinEarned = 10;
        label = 'Adhkār Fortress Gift';
      } else if (qId.includes('adhkar-rec')) {
        coinEarned = 2;
        label = 'Litany Completion';
      }

      if (coinEarned > 0) {
        events.push({
          id: `coin-xp-${entry.id}`,
          timestamp: entry.timestamp,
          delta: coinEarned,
          title: `Reward: ${entry.questName}`,
          domainLabel: label,
          domainBadgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
          Icon: Coins,
          categoryFilterKey: 'spiritual_bounty',
          metadata: { questId: entry.questId }
        });
      }
    });

    // Add genesis endowment of 150 coins
    const genesisTime = state.systemDate ? `${state.systemDate}T00:00:00` : new Date().toISOString();
    events.push({
      id: 'coin-genesis-endowment',
      timestamp: genesisTime,
      delta: 150,
      title: 'Imperial Vault Genesis Endowment',
      domainLabel: 'Sovereign Treasury',
      domainBadgeClass: 'bg-[#c5a059]/20 border-[#c5a059]/40 text-[#fef08a]',
      Icon: Coins,
      categoryFilterKey: 'genesis_seed',
      metadata: { reason: 'Sanctum Genesis Seed' }
    });

    // Sort chronologically ascending
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Calculate running balance and align final balance with state.profile.coins
    let running = 0;
    const items: UnifiedCirculationItem[] = events.map(ev => {
      running = Math.max(0, running + ev.delta);
      return {
        id: ev.id,
        timestamp: ev.timestamp,
        date: ev.timestamp.split('T')[0],
        currency: 'coin' as const,
        direction: ev.delta >= 0 ? 'inflow' as const : 'outflow' as const,
        delta: ev.delta,
        unit: '🪙',
        runningBalance: running,
        title: ev.title,
        domainLabel: ev.domainLabel,
        domainBadgeClass: ev.domainBadgeClass,
        Icon: ev.Icon,
        categoryFilterKey: ev.categoryFilterKey,
        metadata: ev.metadata
      };
    });

    // If there is an operator calibration difference with state.profile.coins, add reconciliation entry
    const actualCoins = state.profile.coins ?? 150;
    if (running !== actualCoins) {
      const diff = actualCoins - running;
      running += diff;
      items.push({
        id: `coin-calibration-sync`,
        timestamp: getSystemTimestamp(state.systemDate),
        date: state.systemDate || getLocalDateString(),
        currency: 'coin' as const,
        direction: diff >= 0 ? 'inflow' as const : 'outflow' as const,
        delta: diff,
        unit: '🪙',
        runningBalance: running,
        title: 'Sovereign Treasury Calibration Synchronization',
        domainLabel: 'Operator Calibration',
        domainBadgeClass: 'bg-slate-900 border-slate-700 text-slate-300',
        Icon: PlusCircle,
        categoryFilterKey: 'calibration_sync',
        metadata: { reason: 'Treasury calibration balance alignment' }
      });
    }

    return items;
  }, [state.inventory, state.muhasabahEntries, state.xpHistory, state.profile.coins, state.systemDate]);

  // COMBINE AND INTERLEAVE BASED ON SELECTED CURRENCY
  const combinedCirculationItems = useMemo<UnifiedCirculationItem[]>(() => {
    let pool: UnifiedCirculationItem[] = [];
    if (selectedCurrency === 'all') {
      pool = [...xpItems, ...restItems, ...coinItems];
    } else if (selectedCurrency === 'xp') {
      pool = xpItems;
    } else if (selectedCurrency === 'rest') {
      pool = restItems;
    } else if (selectedCurrency === 'coin') {
      pool = coinItems;
    }

    // Sort chronologically ascending to assure valid balance progression
    pool.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return pool;
  }, [selectedCurrency, xpItems, restItems, coinItems]);

  // AGGREGATE SUMMARY METRICS
  const summaryMetrics = useMemo(() => {
    const todayStr = state.systemDate || getLocalDateString();
    
    // XP metrics
    const totalXpGains = xpItems.filter(i => i.delta > 0).reduce((s, i) => s + i.delta, 0);
    const totalXpLosses = Math.abs(xpItems.filter(i => i.delta < 0).reduce((s, i) => s + i.delta, 0));
    const todayXpGains = xpItems.filter(i => i.date === todayStr && i.delta > 0).reduce((s, i) => s + i.delta, 0);
    const todayXpLosses = Math.abs(xpItems.filter(i => i.date === todayStr && i.delta < 0).reduce((s, i) => s + i.delta, 0));
    const todayXpNet = todayXpGains - todayXpLosses;

    // Rest metrics
    const totalRestMinted = restItems.filter(i => i.delta > 0).reduce((s, i) => s + i.delta, 0);
    const totalRestSpent = Math.abs(restItems.filter(i => i.delta < 0).reduce((s, i) => s + i.delta, 0));
    const todayRestMinted = restItems.filter(i => i.date === todayStr && i.delta > 0).reduce((s, i) => s + i.delta, 0);
    const todayRestSpent = Math.abs(restItems.filter(i => i.date === todayStr && i.delta < 0).reduce((s, i) => s + i.delta, 0));
    const currentRestBank = state.profile.timeCredits ?? 60;

    // Coin metrics
    const totalCoinsEarned = coinItems.filter(i => i.delta > 0).reduce((s, i) => s + i.delta, 0);
    const totalCoinsSpent = Math.abs(coinItems.filter(i => i.delta < 0).reduce((s, i) => s + i.delta, 0));
    const todayCoinsEarned = coinItems.filter(i => i.date === todayStr && i.delta > 0).reduce((s, i) => s + i.delta, 0);
    const todayCoinsSpent = Math.abs(coinItems.filter(i => i.date === todayStr && i.delta < 0).reduce((s, i) => s + i.delta, 0));
    const currentCoins = state.profile.coins ?? 150;

    return {
      totalXpGains,
      totalXpLosses,
      todayXpNet,
      todayXpGains,
      todayXpLosses,
      totalRestMinted,
      totalRestSpent,
      todayRestMinted,
      todayRestSpent,
      currentRestBank,
      totalCoinsEarned,
      totalCoinsSpent,
      todayCoinsEarned,
      todayCoinsSpent,
      currentCoins
    };
  }, [xpItems, restItems, coinItems, state.profile.timeCredits, state.profile.coins, state.systemDate]);

  // FILTER & SORT ENGINE
  const filteredEntries = useMemo(() => {
    const todayStr = state.systemDate || getLocalDateString();
    const nowTime = new Date(state.systemDate || new Date()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    return combinedCirculationItems.filter(entry => {
      // 1. Flow Filter
      if (selectedFlow === 'inflow' && entry.direction !== 'inflow') return false;
      if (selectedFlow === 'outflow' && entry.direction !== 'outflow') return false;

      // 2. Domain Filter
      if (selectedDomain !== 'all') {
        if (entry.categoryFilterKey !== selectedDomain && entry.domainLabel.toLowerCase() !== selectedDomain.toLowerCase()) {
          return false;
        }
      }

      // 3. Time Filter
      if (timeFilter === 'today') {
        if (entry.date !== todayStr && !(Boolean(entry.timestamp) && entry.timestamp.startsWith(todayStr))) return false;
      } else if (timeFilter === '7days') {
        const t = new Date(entry.timestamp).getTime();
        if (nowTime - t > sevenDays) return false;
      } else if (timeFilter === '30days') {
        const t = new Date(entry.timestamp).getTime();
        if (nowTime - t > thirtyDays) return false;
      }

      // 4. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesDomain = entry.domainLabel.toLowerCase().includes(q);
        const matchesCurrency = entry.currency.toLowerCase().includes(q);
        const matchesSkills = (entry.metadata.skillIds || []).some(id => (skillMap.get(id) || '').toLowerCase().includes(q));
        if (!matchesTitle && !matchesDomain && !matchesCurrency && !matchesSkills) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortOrder === 'highest_impact') {
        return Math.abs(b.delta) - Math.abs(a.delta);
      }
      if (sortOrder === 'highest_deduction') {
        return a.delta - b.delta;
      }
      return 0;
    });
  }, [combinedCirculationItems, selectedFlow, selectedDomain, timeFilter, searchTerm, sortOrder, state.systemDate, skillMap]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / rowsPerPage));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredEntries.slice(start, start + rowsPerPage);
  }, [filteredEntries, currentPage, rowsPerPage]);

  // EXPORT CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Date', 'Currency', 'Direction', 'Source_Domain', 'Event_Title', 'Delta_Impact', 'Unit', 'Cumulative_Balance', 'ID'];
    const rows = filteredEntries.map(e => [
      `"${e.timestamp}"`,
      `"${e.date}"`,
      `"${e.currency.toUpperCase()}"`,
      `"${e.direction.toUpperCase()}"`,
      `"${e.domainLabel.replace(/"/g, '""')}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      e.delta,
      `"${e.unit}"`,
      e.runningBalance,
      `"${e.id}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `imperial_circulation_ledger_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // CALIBRATION SUBMISSION
  const handleApplyCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibrateAmount || calibrateAmount <= 0) return;

    const amount = calibrateDirection === 'inflow' ? Math.round(calibrateAmount) : -Math.round(calibrateAmount);
    const reasonText = calibrateReason.trim() || `Manual Operator ${calibrateCurrency.toUpperCase()} Calibration`;

    if (calibrateCurrency === 'xp') {
      const skills = calibrateSkillId ? [calibrateSkillId] : [];
      addXp(amount, `[OPERATOR] ${reasonText}`, skills);
    } else if (calibrateCurrency === 'rest') {
      addTimeCredits(amount, `[OPERATOR] ${reasonText}`, 'manual_adjustment');
    } else if (calibrateCurrency === 'coin') {
      addCoins(amount, `[OPERATOR] ${reasonText}`);
    }

    setShowCalibrateModal(false);
    setCalibrateReason('');
    setCalibrateAmount(50);
    setCalibrateSkillId('');
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="imperial-circulation-ledger-root">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <span>IMPERIAL CIRCULATION LEDGER</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-300 font-mono mt-1">
            Forensic tri-currency ledger observing the sovereign circulation of Sacred XP, Temporal Rest Capital & Imperial Gold Dinars.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-[#0b0d13] hover:bg-[#141824] border border-[#c5a059]/30 text-[#e5c875] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="Export filtered circulation records to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCalibrateModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059]/25 border border-[#c5a059]/40 text-[#fef08a] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>CALIBRATE CIRCULATION</span>
          </button>
        </div>
      </div>

      {/* 2. TRI-CURRENCY METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Sacred XP */}
        <div className="glass-panel rounded-xl p-4 border border-[var(--border-accent)] bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--accent-bright)] uppercase font-bold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>SACRED XP RESONANCE</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Lv.{playerLevelInfo.level}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight tabular-nums">
            {playerLevelInfo.totalXp.toLocaleString()} <span className="text-xs font-mono text-zinc-400 font-normal">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5 flex items-center justify-between">
            <span>Today: <strong className={summaryMetrics.todayXpNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {summaryMetrics.todayXpNet >= 0 ? `+${summaryMetrics.todayXpNet}` : summaryMetrics.todayXpNet} XP
            </strong></span>
            <span>+{summaryMetrics.totalXpGains.toLocaleString()} / −{summaryMetrics.totalXpLosses.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Temporal Rest Capital */}
        <div className="glass-panel rounded-xl p-4 border border-cyan-500/25 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>TEMPORAL REST BANK</span>
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
              temporalInfo?.temporalStatus === 'STABLE' ? 'border-emerald-500/40 text-emerald-300' : 'border-amber-500/40 text-amber-300'
            }`}>
              {temporalInfo?.temporalStatus || 'STABLE'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-cyan-300 tracking-tight tabular-nums">
            {summaryMetrics.currentRestBank} <span className="text-xs font-mono text-cyan-500 font-normal">min ({Math.floor(summaryMetrics.currentRestBank / 60)}h {summaryMetrics.currentRestBank % 60}m)</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5 flex items-center justify-between">
            <span>Today Rest: <strong className="text-cyan-300">+{summaryMetrics.todayRestMinted}m / −{summaryMetrics.todayRestSpent}m</strong></span>
            <span>Cap: {restState?.remainingAllowance ?? 120}m left</span>
          </div>
        </div>

        {/* Card 3: Imperial Gold Dinars */}
        <div className="glass-panel rounded-xl p-4 border border-amber-500/25 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
              <Coins className="h-3 w-3 text-amber-400" />
              <span>IMPERIAL VAULT TREASURY</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">Gold Dinars</span>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-[#fef08a] tracking-tight tabular-nums">
            🪙 {summaryMetrics.currentCoins.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5 flex items-center justify-between">
            <span>Today Flux: <strong className={summaryMetrics.todayCoinsEarned >= summaryMetrics.todayCoinsSpent ? 'text-emerald-400' : 'text-rose-400'}>
              {summaryMetrics.todayCoinsEarned >= summaryMetrics.todayCoinsSpent ? '+' : ''}{summaryMetrics.todayCoinsEarned - summaryMetrics.todayCoinsSpent} 🪙
            </strong></span>
            <span>Mint: +{summaryMetrics.totalCoinsEarned} • Spend: −{summaryMetrics.totalCoinsSpent}</span>
          </div>
        </div>

        {/* Card 4: Economic Health & Solvency Index */}
        <div className="glass-panel rounded-xl p-4 border border-[#c5a059]/20 bg-[#0b0d13]/90 relative overflow-hidden shadow-lg space-y-1">
          <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#fef08a] uppercase font-bold flex items-center gap-1">
              <Scale className="h-3 w-3 text-[#c5a059]" />
              <span>CIRCULATION EQUILIBRIUM</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">3 Currencies</span>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight tabular-nums">
            {combinedCirculationItems.length} <span className="text-xs font-mono text-zinc-400 font-normal">Audit Events</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 pt-0.5 flex items-center justify-between">
            <span>XP: {xpItems.length} logs</span>
            <span>Rest: {restItems.length}</span>
            <span>Coins: {coinItems.length}</span>
          </div>
        </div>

      </div>

      {/* 3. COLLAPSIBLE CIRCULATION INTELLIGENCE PANELS */}
      <div className="glass-panel rounded-xl border border-[#c5a059]/25 bg-[#080a10]/95 shadow-xl overflow-hidden">
        
        {/* Intelligence Tab Switcher */}
        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#0b0d13] flex-wrap gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold mr-1 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-[#c5a059]" />
              INTELLIGENCE:
            </span>
            <button
              type="button"
              onClick={() => setExpandedIntelligencePanel(prev => prev === 'xp' ? 'none' : 'xp')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                expandedIntelligencePanel === 'xp' ? 'bg-[#c5a059]/20 text-[#fef08a] border border-[#c5a059]/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              XP Velocity & Flow
            </button>
            <button
              type="button"
              onClick={() => setExpandedIntelligencePanel(prev => prev === 'temporal' ? 'none' : 'temporal')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                expandedIntelligencePanel === 'temporal' ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Temporal Capital & Rest
            </button>
            <button
              type="button"
              onClick={() => setExpandedIntelligencePanel(prev => prev === 'treasury' ? 'none' : 'treasury')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                expandedIntelligencePanel === 'treasury' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Imperial Vault Economics
            </button>
          </div>

          <button
            type="button"
            onClick={() => setExpandedIntelligencePanel(prev => prev === 'none' ? 'xp' : 'none')}
            className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-white/10"
          >
            {expandedIntelligencePanel === 'none' ? 'EXPAND' : 'COLLAPSE'}
          </button>
        </div>

        {/* Panel 1: XP Velocity & Flow */}
        {expandedIntelligencePanel === 'xp' && xpAnalytics && (
          <div className="p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">7-Day Net Flux</div>
                <div className={`text-base font-display font-bold mt-0.5 ${xpAnalytics.sevenDayXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {xpAnalytics.sevenDayXP >= 0 ? '+' : ''}{xpAnalytics.sevenDayXP.toLocaleString()} XP
                </div>
                <div className="text-[9px] font-mono text-zinc-300 mt-0.5">
                  {xpAnalytics.velocityDeltaPercent >= 0 ? '+' : ''}{xpAnalytics.velocityDeltaPercent}% vs prior week
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Daily Burn/Run Rate</div>
                <div className="text-base font-display font-bold text-[#fef08a] mt-0.5">
                  {xpAnalytics.dailyVelocity} XP/day
                </div>
                <div className="text-[9px] font-mono text-zinc-300 mt-0.5">
                  Rolling 7-day average
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Prior 7-Day Baseline</div>
                <div className="text-base font-display font-bold text-cyan-300 mt-0.5">
                  {xpAnalytics.priorSevenDayXP >= 0 ? '+' : ''}{xpAnalytics.priorSevenDayXP.toLocaleString()} XP
                </div>
                <div className="text-[9px] font-mono text-zinc-300 mt-0.5">
                  Comparative momentum period
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Anti-Farming State</div>
                <div className="text-base font-display font-bold text-amber-300 mt-0.5">
                  {xpAnalytics.diminishedActivitiesCount} Reps
                </div>
                <div className="text-[9px] font-mono text-zinc-300 mt-0.5">
                  Diminishing returns active
                </div>
              </div>
            </div>

            {/* Source Distribution */}
            <div className="bg-[#0b0d13] p-3 rounded-lg border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="uppercase font-bold text-zinc-300">XP Source Ecosystem</span>
                <span>Total XP Ledger Events: {xpItems.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                {xpAnalytics.sourceDistribution.map(src => (
                  <div key={src.type} className="p-2 rounded bg-white/5 border border-white/10">
                    <div className="text-[9px] font-mono text-zinc-400 uppercase truncate" title={src.label}>
                      {src.label}
                    </div>
                    <div className="text-sm font-display font-bold text-white mt-0.5">
                      {src.percentage}%
                    </div>
                    <div className="text-[9px] font-mono text-[#fef08a]">{src.xp.toLocaleString()} XP</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel 2: Temporal Capital & Rest */}
        {expandedIntelligencePanel === 'temporal' && temporalInfo && (
          <div className="p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Daily Waking Budget</div>
                <div className="text-base font-display font-bold text-cyan-300 mt-0.5">
                  {temporalInfo.dailyWakingMinutes} min (16h)
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Unrenewable daily capital
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Invested Labor Today</div>
                <div className="text-base font-display font-bold text-emerald-400 mt-0.5">
                  {temporalInfo.investedMinutesToday} min
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Focus cycles & completed quests
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Daily Rest Allowance</div>
                <div className="text-base font-display font-bold text-[#fef08a] mt-0.5">
                  {temporalInfo.dailyRestUsedToday} / {temporalInfo.dailyRestAllowanceMinutes} min
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  {temporalInfo.dailyRestRemainingToday}m safe rest capacity left
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Protected Safety Buffer</div>
                <div className="text-base font-display font-bold text-white mt-0.5">
                  {temporalInfo.protectedBufferMinutes} min ({temporalInfo.protectedBufferPercent}%)
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Non-allocatable margin
                </div>
              </div>
            </div>

            <div className="bg-[#0b0d13] p-3 rounded-lg border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="uppercase font-bold text-zinc-300">Rest Capital Inflows & Outflows</span>
                <span>Total Temporal Events: {restItems.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/20">
                  <div className="text-zinc-400 text-[10px] uppercase">Lifetime Minted Labor Rest</div>
                  <div className="text-cyan-300 font-bold text-base mt-0.5">+{summaryMetrics.totalRestMinted}m ({Math.round(summaryMetrics.totalRestMinted / 60)}h)</div>
                </div>
                <div className="p-2.5 rounded bg-purple-950/20 border border-purple-500/20">
                  <div className="text-zinc-400 text-[10px] uppercase">Lifetime Rest Consumed</div>
                  <div className="text-purple-300 font-bold text-base mt-0.5">−{summaryMetrics.totalRestSpent}m ({Math.round(summaryMetrics.totalRestSpent / 60)}h)</div>
                </div>
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20">
                  <div className="text-zinc-400 text-[10px] uppercase">Net Rest Equity Balance</div>
                  <div className="text-emerald-300 font-bold text-base mt-0.5">+{summaryMetrics.currentRestBank}m available</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Imperial Vault Economics */}
        {expandedIntelligencePanel === 'treasury' && (
          <div className="p-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Sovereign Vault Reserve</div>
                <div className="text-base font-display font-bold text-[#fef08a] mt-0.5">
                  🪙 {summaryMetrics.currentCoins} Coins
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Ready gold dinar liquidity
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Inflows (Mints)</div>
                <div className="text-base font-display font-bold text-emerald-400 mt-0.5">
                  +{summaryMetrics.totalCoinsEarned} 🪙
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Prayers, Adhkār, Salawāt & Quests
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Outflows (Spend/Fines)</div>
                <div className="text-base font-display font-bold text-rose-400 mt-0.5">
                  −{summaryMetrics.totalCoinsSpent} 🪙
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Shop vouchers & Muhāsabah fines
                </div>
              </div>

              <div className="bg-[#0b0d13] p-2.5 rounded-lg border border-white/5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Vouchers Acquired</div>
                <div className="text-base font-display font-bold text-white mt-0.5">
                  {(state.inventory || []).length} Items
                </div>
                <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  {(state.inventory || []).filter(r => r.status === 'Available').length} active in pouch
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. FILTER AND SEARCH CONTROLS */}
      <div className="glass-panel rounded-xl p-4 border border-[#c5a059]/20 bg-[#07080c]/90 space-y-3.5 shadow-md">
        
        {/* Row 1: Search & Primary Currency Segmented Tabs */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search across events, directives, passes, shop items, or audit notes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#0b0d13] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Currency Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#0b0d13] border border-white/10 rounded-lg shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => { setSelectedCurrency('all'); setSelectedDomain('all'); setCurrentPage(1); }}
              className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all cursor-pointer font-bold ${
                selectedCurrency === 'all' ? 'bg-[#c5a059] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ALL ASSETS ({combinedCirculationItems.length})
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCurrency('xp'); setSelectedDomain('all'); setCurrentPage(1); }}
              className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all cursor-pointer font-bold flex items-center gap-1 ${
                selectedCurrency === 'xp' ? 'bg-[var(--accent-bright)] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="h-3 w-3" />
              SACRED XP ({xpItems.length})
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCurrency('rest'); setSelectedDomain('all'); setCurrentPage(1); }}
              className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all cursor-pointer font-bold flex items-center gap-1 ${
                selectedCurrency === 'rest' ? 'bg-cyan-600 text-white shadow' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <Clock className="h-3 w-3" />
              REST TIME ({restItems.length})
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCurrency('coin'); setSelectedDomain('all'); setCurrentPage(1); }}
              className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all cursor-pointer font-bold flex items-center gap-1 ${
                selectedCurrency === 'coin' ? 'bg-amber-600 text-white shadow' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Coins className="h-3 w-3" />
              COINS ({coinItems.length})
            </button>
          </div>

        </div>

        {/* Row 2: Secondary Filters (Flow, Time, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/5 text-xs font-mono">
          
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Flow Filter (Inflow / Outflow) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">FLOW:</span>
              <div className="flex items-center gap-1 bg-[#0b0d13] p-0.5 rounded border border-white/10">
                <button
                  type="button"
                  onClick={() => { setSelectedFlow('all'); setCurrentPage(1); }}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                    selectedFlow === 'all' ? 'bg-white/10 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFlow('inflow'); setCurrentPage(1); }}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors flex items-center gap-0.5 ${
                    selectedFlow === 'inflow' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <TrendingUp className="h-2.5 w-2.5" /> Inflow (+)
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFlow('outflow'); setCurrentPage(1); }}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors flex items-center gap-0.5 ${
                    selectedFlow === 'outflow' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <TrendingDown className="h-2.5 w-2.5" /> Outflow (−)
                </button>
              </div>
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">TIME:</span>
              <select
                value={timeFilter}
                onChange={(e) => { setTimeFilter(e.target.value as any); setCurrentPage(1); }}
                className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today Only</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
              </select>
            </div>

          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              SORT:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-[#0b0d13] border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_impact">Highest Magnitude</option>
              <option value="highest_deduction">Highest Deduction / Outflow</option>
            </select>
          </div>

        </div>

      </div>

      {/* 5. MAIN CIRCULATION LEDGER TABLE */}
      <div className="glass-panel rounded-xl border border-[var(--border-accent)] bg-[#0b0d13]/90 overflow-hidden shadow-xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#c5a059]/20 bg-[#07080c] text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-[110px]">TIMESTAMP</th>
                <th className="py-3 px-4 w-[90px]">ASSET</th>
                <th className="py-3 px-4 w-[140px]">SOURCE DOMAIN</th>
                <th className="py-3 px-4">CIRCULATION EVENT & DETAILS</th>
                <th className="py-3 px-4 text-right w-[120px]">IMPACT</th>
                <th className="py-3 px-4 text-right w-[140px]">BALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <RubElHizbIcon className="h-8 w-8 text-zinc-600 mx-auto" />
                      <div className="text-zinc-400 font-bold uppercase text-xs">NO CIRCULATION RECORDS MATCHING FILTER</div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                        No transactions found for the selected criteria. Try resetting the filters or logging activities across Sacred XP, Rest Passes, or Imperial Shop vouchers.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCurrency('all');
                          setSelectedFlow('all');
                          setSelectedDomain('all');
                          setTimeFilter('all');
                        }}
                        className="px-3 py-1 bg-[#141824] hover:bg-[#1e2436] border border-white/10 rounded text-[10px] text-[#fef08a] cursor-pointer"
                      >
                        RESET ALL FILTERS
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => {
                  const isInflow = entry.direction === 'inflow';
                  const isExpanded = expandedRowId === entry.id;
                  const dateObj = new Date(entry.timestamp);
                  const dateStr = isNaN(dateObj.getTime()) 
                    ? entry.timestamp 
                    : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeStr = isNaN(dateObj.getTime())
                    ? ''
                    : dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

                  const IconComponent = entry.Icon;

                  // Asset badge styling
                  let assetTag = { label: 'XP', style: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
                  if (entry.currency === 'rest') {
                    assetTag = { label: 'REST', style: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/30' };
                  } else if (entry.currency === 'coin') {
                    assetTag = { label: 'COIN', style: 'text-[#fef08a] bg-amber-950/50 border-[#c5a059]/40' };
                  }

                  return (
                    <React.Fragment key={entry.id}>
                      <tr 
                        onClick={() => setExpandedRowId(isExpanded ? null : entry.id)}
                        className={`hover:bg-[#141824]/60 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#141824]/80' : ''
                        }`}
                      >
                        {/* TIMESTAMP */}
                        <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                          <div className="text-[11px] font-bold text-zinc-300 tabular-nums">{dateStr}</div>
                          <div className="text-[9px] text-zinc-500 tabular-nums">{timeStr}</div>
                        </td>

                        {/* ASSET BADGE */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${assetTag.style}`}>
                            {entry.currency === 'xp' && <Zap className="h-2.5 w-2.5" />}
                            {entry.currency === 'rest' && <Clock className="h-2.5 w-2.5" />}
                            {entry.currency === 'coin' && <Coins className="h-2.5 w-2.5" />}
                            <span>{assetTag.label}</span>
                          </span>
                        </td>

                        {/* SOURCE DOMAIN */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold ${entry.domainBadgeClass}`}>
                            <IconComponent className="h-3 w-3" />
                            <span>{entry.domainLabel}</span>
                          </span>
                        </td>

                        {/* EVENT TITLE */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-200 font-sans font-medium line-clamp-1 break-all">
                              {entry.title}
                            </span>
                            {entry.metadata?.questId && (
                              <span className="text-[9px] text-zinc-500 bg-white/5 px-1 rounded shrink-0 hidden sm:inline">
                                #{entry.metadata.questId.slice(-4)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* IMPACT (DELTA) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className={`font-mono font-black text-xs tabular-nums ${
                            isInflow ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isInflow ? `+${entry.delta}` : entry.delta} {entry.unit}
                          </span>
                        </td>

                        {/* RUNNING BALANCE */}
                        <td className="py-3 px-4 text-right whitespace-nowrap text-zinc-300 font-mono text-xs tabular-nums">
                          {entry.runningBalance.toLocaleString()} {entry.unit}
                        </td>
                      </tr>

                      {/* EXPANDABLE ROW DETAILS */}
                      {isExpanded && (
                        <tr className="bg-[#07080c] border-b border-white/5">
                          <td colSpan={6} className="p-4 space-y-3">
                            <div className="p-3 bg-[#0b0d13] border border-white/10 rounded-lg space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 text-[10px] font-mono">
                                <span className="text-[#c5a059] font-bold uppercase">
                                  CIRCULATION FORENSIC METADATA: {entry.id}
                                </span>
                                <span className="text-zinc-500">ISO: {entry.timestamp}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-sans">
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">CIRCULATION ASSET</span>
                                  <span className="text-white font-medium">{entry.currency.toUpperCase()} ({entry.unit}) — {entry.domainLabel}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">FLOW MECHANISM</span>
                                  <span className={isInflow ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                                    {isInflow ? 'Inflow (Credit / Mint / Harvest)' : 'Outflow (Debit / Redemption / Fine)'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">RUNNING BALANCE AFTER IMPACT</span>
                                  <span className="text-[#fef08a] font-mono font-bold">{entry.runningBalance.toLocaleString()} {entry.unit}</span>
                                </div>
                              </div>
                              {entry.metadata.skillIds && entry.metadata.skillIds.length > 0 && (
                                <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap text-[10px] font-mono">
                                  <span className="text-zinc-500 uppercase">IMPACTED DISCIPLINES:</span>
                                  {entry.metadata.skillIds.map(skId => (
                                    <span key={skId} className="px-2 py-0.5 bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#fef08a] rounded">
                                      {skillMap.get(skId) || skId}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-3 border-t border-white/5 bg-[#07080c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span>Showing {paginatedEntries.length} of {filteredEntries.length} records</span>
            <span className="text-zinc-600">•</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-[#0b0d13] border border-white/10 rounded px-1.5 py-0.5 text-zinc-300 focus:outline-none"
            >
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded bg-[#0b0d13] border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-zinc-300 font-bold text-[11px]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded bg-[#0b0d13] border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 6. UNIFIED ASSET CALIBRATION MODAL */}
      {showCalibrateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-xl border border-[#c5a059]/40 bg-[#0b0d13] shadow-2xl space-y-4 relative">
            <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" />
            
            <div className="border-b border-[#c5a059]/20 pb-3">
              <h3 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                CALIBRATE SOVEREIGN CIRCULATION
              </h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Calibrate Sacred XP, Temporal Rest Capital, or Imperial Gold Dinars with empirical audit records.
              </p>
            </div>

            <form onSubmit={handleApplyCalibration} className="space-y-4">
              
              {/* Asset Selector */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5 font-bold">
                  Select Circulation Asset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalibrateCurrency('xp')}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      calibrateCurrency === 'xp' ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#fef08a]' : 'bg-[#07080c] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Sacred XP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalibrateCurrency('rest')}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      calibrateCurrency === 'rest' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-[#07080c] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>Rest Minutes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalibrateCurrency('coin')}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      calibrateCurrency === 'coin' ? 'bg-amber-950/60 border-amber-500 text-[#fef08a]' : 'bg-[#07080c] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span>Gold Dinars</span>
                  </button>
                </div>
              </div>

              {/* Direction Selector */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5 font-bold">
                  Flow Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalibrateDirection('inflow')}
                    className={`py-1.5 px-3 rounded border text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      calibrateDirection === 'inflow' ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300' : 'bg-[#07080c] border-white/10 text-zinc-400'
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Inflow / Grant (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalibrateDirection('outflow')}
                    className={`py-1.5 px-3 rounded border text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      calibrateDirection === 'outflow' ? 'bg-rose-950/70 border-rose-500 text-rose-300' : 'bg-[#07080c] border-white/10 text-zinc-400'
                    }`}
                  >
                    <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                    <span>Outflow / Deduct (−)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                  Amount ({calibrateCurrency === 'xp' ? 'XP' : calibrateCurrency === 'rest' ? 'Minutes' : 'Coins'})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={calibrateAmount}
                  onChange={(e) => setCalibrateAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                  Audit Reason & Justification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unlogged Deep Focus Session, Disciplinary Nafs Fine, Rest Allowance Recalibration..."
                  value={calibrateReason}
                  onChange={(e) => setCalibrateReason(e.target.value)}
                  className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Optional Skill Link for XP */}
              {calibrateCurrency === 'xp' && (
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                    Associated Competency (Optional)
                  </label>
                  <select
                    value={calibrateSkillId}
                    onChange={(e) => setCalibrateSkillId(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
                  >
                    <option value="">None / General Sanctum XP</option>
                    {(state.skills || []).map(sk => (
                      <option key={sk.id} value={sk.id}>{sk.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCalibrateModal(false)}
                  className="flex-1 py-2 rounded-lg bg-[#141824] hover:bg-[#1e2436] text-zinc-300 text-xs font-mono cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#c5a059] hover:bg-[#e5c875] text-[#07080c] text-xs font-mono font-bold cursor-pointer"
                >
                  COMMIT CALIBRATION
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Backwards compatibility alias
export const XPHistoryLedger = ImperialCirculationLedger;
