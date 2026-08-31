import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Coins, Plus, Trash2, CheckCircle, ShieldAlert, Sparkles, 
  Coffee, Gamepad2, Utensils, Tv, BookOpen, Zap, Shield, Gift, Clock, Tag,
  Pencil, RotateCcw, Edit3, Lock, Swords, Star
} from 'lucide-react';
import { usePOS, isQuestArchived } from '../POSContext';
import { ShopItem, ShopItemCategory, RedeemedReward } from '../types';
import { DEFAULT_SHOP_ITEMS } from '../initialState';
import { RubElHizbIcon, ArabesqueCorner, GeometricDivider } from './IslamicRpgDecorations';

export const RewardShopView: React.FC = () => {
  const { 
    state, 
    purchaseShopItem, 
    useInventoryItem, 
    addCustomShopItem, 
    updateShopItem,
    deleteShopItem,
    deleteCustomShopItem,
    resetDefaultShopItems,
    clearVoucherHistory,
    clearAllVouchers,
    addCoins,
    systemDate,
    isQuestFinishedForToday,
    isQuestScheduledForDate,
    completeQuest,
    isShopLocked
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'all' | 'real-life' | 'system-perks' | 'custom' | 'inventory'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Custom Item Form State
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCost, setCustomCost] = useState<number>(50);
  const [customCategory, setCustomCategory] = useState<ShopItemCategory>('Real Life Reward');
  const [customIcon, setCustomIcon] = useState('🎁');

  // Edit Item Form State
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCost, setEditCost] = useState<number>(50);
  const [editCategory, setEditCategory] = useState<ShopItemCategory>('Real Life Reward');
  const [editIcon, setEditIcon] = useState('🎁');
  const [editEffectType, setEditEffectType] = useState<'INVENTORY' | 'PERK_FOCUS_SHIELD' | 'PERK_MOMENTUM_BOOST' | 'PERK_XP_SURGE'>('INVENTORY');
  const [editValue, setEditValue] = useState<number>(1);

  const iconsList = ['🎁', '☕', '🍕', '🎮', '🍿', '📚', '🍦', '🍩', '🛍️', '✈️', '🎟️', '💆‍♂️', '🛡️', '⚡', '✨', '👑', '🚀', '💎', '🎨', '🎯'];

  const coins = state.profile.coins ?? 150;
  const focusShields = state.profile.focusShields ?? 0;
  const shopItems = state.shopItems && state.shopItems.length > 0 ? state.shopItems : DEFAULT_SHOP_ITEMS;
  const inventory = state.inventory || [];

  const todayStr = systemDate;
  const REQUIRED_SHOP_LOCK_TYPES = ['MAIN', 'BOSS', 'PENALTY', 'HABIT', 'RECOVERY'];
  const baseQuests = (state.quests || []).filter(q => {
    if (isQuestArchived(q, state.lists, state.folders)) return false;
    if (state.profile.recoveryMode) {
      if (q.type !== 'Recovery' && q.type !== 'Optional' && q.type !== 'Penalty') return false;
    }
    return true;
  });

  const todayQuests = baseQuests.filter(q => {
    const qType = (q.type || 'Main').toUpperCase();
    if (!REQUIRED_SHOP_LOCK_TYPES.includes(qType)) return false;

    const isFinished = isQuestFinishedForToday(q);
    if (isFinished) {
      return q.status !== 'Failed';
    }
    if (q.status !== 'Active') return false;
    const isScheduled = isQuestScheduledForDate(q, todayStr);
    if (!isScheduled) return false;
    return !q.deadline || q.deadline <= todayStr;
  });

  const remainingTodayQuests = todayQuests.filter(q => !isQuestFinishedForToday(q));

  const activeVouchers = inventory.filter(i => i.status === 'Available');
  const usedVouchers = inventory.filter(i => i.status === 'Used');

  const showToast = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleBuy = (itemId: string) => {
    if (isShopLocked) {
      showToast("Reward Shop is locked! Resolve today's required directives (Main, Boss, Penalty & Habit) first.", 'error');
      return;
    }
    const res = purchaseShopItem(itemId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleUseVoucher = (voucherId: string) => {
    const res = useInventoryItem(voucherId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addCustomShopItem({
      name: customName,
      description: customDesc || 'Personal real-life custom reward.',
      costCoins: customCost,
      category: customCategory,
      icon: customIcon,
      effectType: 'INVENTORY'
    });

    setCustomName('');
    setCustomDesc('');
    setCustomCost(50);
    setIsAddModalOpen(false);
    showToast(`Created custom reward "${customName}"!`, 'success');
  };

  const handleStartEdit = (item: ShopItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDesc(item.description);
    setEditCost(item.costCoins);
    setEditCategory(item.category);
    setEditIcon(item.icon);
    setEditEffectType(item.effectType || 'INVENTORY');
    setEditValue(item.value || 1);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    const updated: ShopItem = {
      ...editingItem,
      name: editName.trim(),
      description: editDesc.trim(),
      costCoins: editCost,
      category: editCategory,
      icon: editIcon,
      effectType: editEffectType,
      value: editValue
    };

    updateShopItem(updated);
    setEditingItem(null);
    showToast(`Updated reward "${updated.name}"!`, 'success');
  };

  const handleDeleteItem = (item: ShopItem) => {
    deleteShopItem(item.id);
    showToast(`Deleted reward "${item.name}" from shop.`, 'success');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset shop catalog to default items? This will restore original items.')) {
      resetDefaultShopItems();
      showToast('Shop catalog reset to default rewards!', 'success');
    }
  };

  const filteredItems = shopItems.filter(item => {
    if (activeTab === 'real-life') return item.category === 'Real Life Reward';
    if (activeTab === 'system-perks') return item.category === 'System Perk';
    if (activeTab === 'custom') return item.isCustom;
    return true;
  });

  return (
    <div className="space-y-6 pb-12" id="reward-shop-container">
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 max-w-md ${
              notification.type === 'success'
                ? 'bg-[#181408]/95 border-[#c5a059] text-[#fef08a] shadow-[0_0_25px_rgba(197,160,89,0.3)]'
                : 'bg-[#1a0808]/95 border-rose-500/50 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <RubElHizbIcon className="h-5 w-5 text-[#e5c875] shrink-0 animate-pulse" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-mono font-medium">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER - ISLAMIC RPG SUQ / BAZAAR */}
      <div className="glass-panel border border-[#c5a059]/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl bg-gradient-to-r from-[#141824]/90 via-[#0b0d13]/95 to-[#1a1208]/90">
        <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
        <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />
        <ArabesqueCorner position="bottom-left" className="bottom-2 left-2 h-4 w-4" color="#c5a059" />
        <ArabesqueCorner position="bottom-right" className="bottom-2 right-2 h-4 w-4" color="#c5a059" />

        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Coins className="w-64 h-64 text-[#c5a059]" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                <RubElHizbIcon className="h-3 w-3 text-[#e5c875]" />
                IMPERIAL BAZAAR & REPUTATION EXCHANGE
              </span>
              {focusShields > 0 && (
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  {focusShields} Focus Shields
                </span>
              )}
            </div>
            <h2 className="text-2xl font-display font-black text-white tracking-wide flex items-center gap-2">
              REWARD VAULT & TALISMANS
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl font-sans leading-relaxed">
              Exchange your earned guild coins for tangible real-life rewards, guilt-free rest passes, and high-tier system relics.
            </p>
          </div>

          {/* WALLET DISPLAY */}
          <div className="flex items-center gap-3 bg-[#07080c]/90 border border-[#c5a059]/50 rounded-xl p-4 shadow-[0_0_20px_rgba(197,160,89,0.15)] shrink-0">
            <div className="h-12 w-12 rounded-xl bg-[#3a2e12] border border-[#c5a059] flex items-center justify-center shrink-0 shadow-inner">
              <Coins className="h-7 w-7 text-[#e5c875] animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#c5a059] uppercase font-bold tracking-wider flex items-center gap-1">
                <RubElHizbIcon className="h-2 w-2" />
                TREASURY BALANCE
              </div>
              <div className="text-2xl font-mono font-extrabold text-[#fef08a] tracking-tight flex items-baseline gap-1">
                {coins} <span className="text-xs font-sans text-[#c5a059] font-bold">DIRHAMS</span>
              </div>
            </div>
            <button
              onClick={() => addCoins(50, 'Imperial stipend bonus added.')}
              className="ml-2 text-[9px] font-mono text-[#c5a059] hover:text-[#fef08a] bg-[#3a2e12]/40 hover:bg-[#3a2e12] border border-[#c5a059]/40 hover:border-[#c5a059] px-2.5 py-1.5 rounded-lg transition cursor-pointer font-bold"
              title="Add bonus (+50 Coins)"
            >
              +50 🪙
            </button>
          </div>
        </div>
      </div>

      {/* LOCK RESTRICTION OVERLAY / PANEL */}
      {isShopLocked && (
        <div className="glass-panel border-2 border-rose-500/40 bg-rose-950/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.15)] text-center space-y-6">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 transform -translate-x-8 translate-y-8 w-40 h-40 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
            <Lock className="h-10 w-10 text-rose-400" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full font-bold tracking-wider">
              SANCTUARY SEALED • UNRESOLVED MANDATES
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              REWARD VAULT RESTRICTED
            </h3>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Guild discipline requires resolving <span className="text-[#fef08a] font-bold">today's required directives (Main, Boss, Penalty, Habit & Recovery)</span> before claiming treasures or purchasing new vouchers.
            </p>
          </div>

          {/* Progress Bar & Counter */}
          <div className="max-w-md mx-auto bg-[#07080c]/90 border border-white/10 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-zinc-400">TODAY'S OPERATIONAL PROGRESS:</span>
              <span className="text-[#e5c875]">
                {todayQuests.length - remainingTodayQuests.length} / {todayQuests.length} COMPLETED
              </span>
            </div>
            <div className="w-full bg-[#07080c] h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="rpg-progress-gold h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                style={{ width: `${Math.round(((todayQuests.length - remainingTodayQuests.length) / Math.max(1, todayQuests.length)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-rose-400">
              ⚠️ {remainingTodayQuests.length} directive{remainingTodayQuests.length === 1 ? '' : 's'} remaining for today.
            </p>
          </div>

          {/* Remaining Quests List */}
          <div className="max-w-lg mx-auto space-y-2 text-left">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5 text-[#e5c875]" />
              REMAINING DIRECTIVES TO UNLOCK VAULT ({remainingTodayQuests.length}):
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {remainingTodayQuests.map(q => (
                <div 
                  key={q.id}
                  className="bg-[#0b0d13] border border-[#c5a059]/20 hover:border-[#c5a059]/50 p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm">
                      {q.type === 'Main' ? '🏆' : q.type === 'Boss' ? '🔥' : q.type === 'Habit' ? '⚡' : q.type === 'Recovery' ? '🛡️' : '🎯'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 truncate">{q.name}</div>
                      <div className="text-[9.5px] font-mono text-zinc-500 flex items-center gap-2">
                        <span>EST: {q.estimatedTime}m</span>
                        {q.deadline && <span>• DEADLINE: {q.deadline}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => completeQuest(q.id)}
                    className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white rounded text-[10px] font-mono font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Complete directive"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>COMPLETE</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                : 'bg-[#07080c] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#e5c875]" />
            ALL WARES ({shopItems.length})
          </button>
          <button
            onClick={() => setActiveTab('real-life')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'real-life'
                ? 'bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                : 'bg-[#07080c] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Gift className="h-3.5 w-3.5 text-[#e5c875]" />
            MUNDANE LUXURIES
          </button>
          <button
            onClick={() => setActiveTab('system-perks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'system-perks'
                ? 'bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                : 'bg-[#07080c] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-[#e5c875]" />
            SYSTEM RELICS
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 relative cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#3a2e12] border border-[#c5a059] text-[#fef08a] shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                : 'bg-[#07080c] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Tag className="h-3.5 w-3.5 text-purple-400" />
            MY VOUCHERS ({inventory.length})
            {activeVouchers.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            className="bg-[#07080c] hover:bg-[#141824] text-zinc-400 hover:text-[#e5c875] border border-white/10 hover:border-[#c5a059]/40 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Reset catalog to original default items"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESET CATALOG
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#3a2e12]/80 hover:bg-[#3a2e12] text-[#fef08a] border border-[#c5a059]/50 hover:border-[#c5a059] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4 text-[#e5c875]" />
            FORGE CUSTOM REWARD
          </button>
        </div>
      </div>

      {/* INVENTORY / VOUCHERS VIEW TAB */}
      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="glass-panel border border-[#c5a059]/30 rounded-2xl p-6 space-y-4 bg-[#0b0d13]/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RubElHizbIcon className="h-4 w-4 text-[#c5a059]" />
                ACTIVE REWARD VOUCHERS ({activeVouchers.length})
              </h3>
              {inventory.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all vouchers (both active and history)?')) {
                      clearAllVouchers();
                    }
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Clear all vouchers from inventory"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  CLEAR ALL VOUCHERS
                </button>
              )}
            </div>

            {activeVouchers.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs border border-dashed border-[#c5a059]/20 rounded-xl bg-[#07080c]/50">
                No unredeemed vouchers in your inventory. Purchase rewards from the catalog to claim them here!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeVouchers.map(v => (
                  <div 
                    key={v.id} 
                    className="bg-[#07080c] border border-[#c5a059]/40 hover:border-[#c5a059] rounded-xl p-4 space-y-3 shadow-lg relative overflow-hidden group"
                  >
                    <ArabesqueCorner position="top-right" className="top-1 right-1 h-3 w-3" color="#c5a059" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{v.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm font-display">{v.itemName}</h4>
                          <span className="text-[10px] font-mono text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40 px-1.5 py-0.5 rounded">
                            {v.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {v.redeemedAt.split('T')[0]}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-mono text-[#e5c875]">Cost: {v.costCoins} 🪙</span>
                      <button
                        onClick={() => handleUseVoucher(v.id)}
                        className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:from-[#a38033] hover:to-[#a38033] text-[#07080c] font-black px-3.5 py-1.5 rounded-lg text-xs font-mono shadow-md transition flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5 stroke-[3]" />
                        REDEEM NOW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REDEMPTION HISTORY */}
          {usedVouchers.length > 0 && (
            <div className="glass-panel border border-[#c5a059]/20 rounded-2xl p-6 space-y-3 bg-[#07080c]/80">
              <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-2.5">
                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RubElHizbIcon className="h-3 w-3 text-[#c5a059]" />
                  CLAIMED / REDEEMED ARCHIVE ({usedVouchers.length})
                </h4>
                <button
                  onClick={() => {
                    if (window.confirm('Clear all redeemed voucher history records?')) {
                      clearVoucherHistory();
                    }
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Clear redeemed vouchers history"
                >
                  <Trash2 className="h-3 w-3" />
                  CLEAR HISTORY
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {usedVouchers.map(v => (
                  <div key={v.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span>{v.icon}</span>
                      <span className="text-zinc-400 font-medium line-through opacity-75">{v.itemName}</span>
                      <span className="text-[9px] text-zinc-500">({v.category})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                      ✓ REDEEMED {v.usedAt?.split('T')[0] || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SHOP CATALOG GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const canAfford = coins >= item.costCoins;
            const progress = Math.min(100, Math.round((coins / item.costCoins) * 100));

            return (
              <div
                key={item.id}
                className={`glass-panel border rounded-2xl p-5 flex flex-col justify-between gap-4 transition duration-200 relative overflow-hidden ${
                  canAfford 
                    ? 'border-[#c5a059]/40 hover:border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)] bg-[#0b0d13]/90' 
                    : 'border-white/5 bg-[#07080c]/60 opacity-80'
                }`}
              >
                {canAfford && (
                  <ArabesqueCorner position="top-right" className="top-1.5 right-1.5 h-3.5 w-3.5" color="#c5a059" />
                )}

                {/* TOP HEADER */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#3a2e12]/80 border border-[#c5a059]/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base font-display leading-snug">{item.name}</h3>
                        <span className="text-[9.5px] font-mono text-[#fef08a] bg-[#3a2e12] border border-[#c5a059]/40 px-2 py-0.5 rounded font-semibold inline-block mt-0.5">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-zinc-500 hover:text-[#e5c875] transition p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                        title="Edit reward item contents"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="text-zinc-500 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                        title="Delete reward item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* BOTTOM PRICE & ACTION */}
                <div className="space-y-2 pt-3 border-t border-[#c5a059]/15">
                  <div className="flex items-center justify-between font-mono">
                    <div className="text-xs text-zinc-400">Price:</div>
                    <div className="text-base font-bold text-[#fef08a] flex items-center gap-1">
                      <Coins className="h-4 w-4 text-[#e5c875]" />
                      {item.costCoins} COINS
                    </div>
                  </div>

                  {/* PROGRESS TO AFFORD IF NOT ENOUGH COINS */}
                  {!canAfford && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                        <span>Savings Progress</span>
                        <span>{coins} / {item.costCoins} 🪙 ({progress}%)</span>
                      </div>
                      <div className="w-full bg-[#07080c] h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="rpg-progress-gold h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:from-[#a38033] hover:to-[#a38033] text-[#07080c] font-black shadow-[0_0_15px_rgba(197,160,89,0.25)] cursor-pointer'
                        : 'bg-[#07080c] text-zinc-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 stroke-[2.5]" />
                    {canAfford ? 'PURCHASE REWARD' : `NEED ${item.costCoins - coins} MORE COINS`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CUSTOM REWARD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            >
              <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
                  <RubElHizbIcon className="h-5 w-5 text-[#c5a059]" />
                  FORGE CUSTOM REWARD
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-zinc-500 hover:text-white font-mono text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustom} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1 font-bold">Reward Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fine Feast at Tavern, 30m Fragrant Bath, Buy Book"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of what this reward grants you..."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1 font-bold">Coin Price (🪙)</label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={customCost}
                      onChange={(e) => setCustomCost(Number(e.target.value))}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-[#fef08a] font-mono font-bold focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as ShopItemCategory)}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="Real Life Reward">Real Life Reward</option>
                      <option value="Custom Personal">Custom Personal</option>
                      <option value="System Perk">System Perk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">Choose Emblem</label>
                  <div className="flex flex-wrap gap-2 bg-[#07080c] p-3 rounded-xl border border-white/5">
                    {iconsList.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCustomIcon(icon)}
                        className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition cursor-pointer ${
                          customIcon === icon
                            ? 'bg-[#3a2e12] border border-[#c5a059]'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c5a059]/20">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:from-[#a38033] hover:to-[#a38033] text-[#07080c] font-mono font-black text-xs px-5 py-2 rounded-xl transition shadow-md cursor-pointer"
                  >
                    ADD TO REWARD VAULT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT REWARD ITEM MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0d13] border border-[#c5a059]/50 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            >
              <ArabesqueCorner position="top-left" className="top-2 left-2 h-4 w-4" color="#c5a059" />
              <ArabesqueCorner position="top-right" className="top-2 right-2 h-4 w-4" color="#c5a059" />

              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3">
                <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-[#c5a059]" />
                  MODIFY REWARD DETAILS
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-zinc-500 hover:text-white font-mono text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1 font-bold">Reward Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-[#07080c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#c5a059] uppercase mb-1 font-bold">Coin Price (🪙)</label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={editCost}
                      onChange={(e) => setEditCost(Number(e.target.value))}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-[#fef08a] font-mono font-bold focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as ShopItemCategory)}
                      className="w-full bg-[#07080c] border border-[#c5a059]/30 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="Real Life Reward">Real Life Reward</option>
                      <option value="Custom Personal">Custom Personal</option>
                      <option value="System Perk">System Perk</option>
                    </select>
                  </div>
                </div>

                {editCategory === 'System Perk' && (
                  <div className="grid grid-cols-2 gap-3 bg-[#07080c] p-3 rounded-xl border border-cyan-500/30">
                    <div>
                      <label className="block text-[10px] font-mono text-cyan-400 uppercase mb-1">Perk Effect Type</label>
                      <select
                        value={editEffectType}
                        onChange={(e) => setEditEffectType(e.target.value as any)}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      >
                        <option value="INVENTORY">Standard Voucher</option>
                        <option value="PERK_FOCUS_SHIELD">Focus Shield Token</option>
                        <option value="PERK_MOMENTUM_BOOST">Momentum Boost</option>
                        <option value="PERK_XP_SURGE">XP Surge Token</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-cyan-400 uppercase mb-1">Effect Value</label>
                      <input
                        type="number"
                        min={1}
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-full bg-[#0b0d13] border border-white/10 rounded-lg p-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">Choose Emblem</label>
                  <div className="flex flex-wrap gap-2 bg-[#07080c] p-3 rounded-xl border border-white/5">
                    {iconsList.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditIcon(icon)}
                        className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition cursor-pointer ${
                          editIcon === icon
                            ? 'bg-[#3a2e12] border border-[#c5a059]'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#c5a059]/20">
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(editingItem)}
                    className="px-3 py-2 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    DELETE
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#8a6d2b] hover:from-[#a38033] hover:to-[#a38033] text-[#07080c] font-mono font-black text-xs px-5 py-2 rounded-xl transition shadow-md cursor-pointer"
                    >
                      SAVE CHANGES
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
