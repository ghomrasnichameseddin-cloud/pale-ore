import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Coins, Plus, Trash2, CheckCircle, ShieldAlert, Sparkles, 
  Coffee, Gamepad2, Utensils, Tv, BookOpen, Zap, Shield, Gift, Clock, Tag
} from 'lucide-react';
import { usePOS } from '../POSContext';
import { ShopItem, ShopItemCategory, RedeemedReward } from '../types';
import { DEFAULT_SHOP_ITEMS } from '../initialState';

export const RewardShopView: React.FC = () => {
  const { 
    state, 
    purchaseShopItem, 
    useInventoryItem, 
    addCustomShopItem, 
    deleteCustomShopItem,
    addCoins 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'all' | 'real-life' | 'system-perks' | 'custom' | 'inventory'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Custom Item Form State
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCost, setCustomCost] = useState<number>(50);
  const [customCategory, setCustomCategory] = useState<ShopItemCategory>('Real Life Reward');
  const [customIcon, setCustomIcon] = useState('🎁');

  const iconsList = ['🎁', '☕', '🍕', '🎮', '🍿', '📚', '🍦', '🍩', '🛍️', '✈️', '🎟️', '💆‍♂️', '🛡️', '⚡', '✨'];

  const coins = state.profile.coins ?? 150;
  const focusShields = state.profile.focusShields ?? 0;
  const shopItems = state.shopItems && state.shopItems.length > 0 ? state.shopItems : DEFAULT_SHOP_ITEMS;
  const inventory = state.inventory || [];

  const activeVouchers = inventory.filter(i => i.status === 'Available');
  const usedVouchers = inventory.filter(i => i.status === 'Used');

  const showToast = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleBuy = (itemId: string) => {
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
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <Coins className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-mono font-medium">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Coins className="w-64 h-64 text-amber-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-amber-900/60 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                DOPAMINE MARKETPLACE
              </span>
              {focusShields > 0 && (
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Shield className="h-3 w-3 text-cyan-400" />
                  {focusShields} Focus Shields
                </span>
              )}
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
              REWARD SHOP & VOUCHERS
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl font-sans">
              Convert your hard-earned directive coins into tangible real-life treats, guilt-free passes, or strategic system perks.
            </p>
          </div>

          {/* WALLET DISPLAY */}
          <div className="flex items-center gap-3 bg-zinc-950/80 border border-amber-500/40 rounded-xl p-4 shadow-inner shrink-0">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Coins className="h-7 w-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400/80 uppercase font-bold tracking-wider">
                AVAILABLE BALANCE
              </div>
              <div className="text-2xl font-mono font-extrabold text-amber-300 tracking-tight flex items-baseline gap-1">
                {coins} <span className="text-xs font-sans text-amber-500/90 font-normal">COINS</span>
              </div>
            </div>
            <button
              onClick={() => addCoins(50, 'Admin bonus coins added via Shop dashboard.')}
              className="ml-2 text-[9px] font-mono text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-950/60 border border-white/10 hover:border-amber-500/40 px-2 py-1.5 rounded-lg transition"
              title="Add test bonus coins (+50)"
            >
              +50 🪙
            </button>
          </div>
        </div>
      </div>

      {/* FILTER TABS & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-zinc-950 font-extrabold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            ALL ITEMS ({shopItems.length})
          </button>
          <button
            onClick={() => setActiveTab('real-life')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'real-life'
                ? 'bg-amber-500 text-zinc-950 font-extrabold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Gift className="h-3.5 w-3.5 text-amber-400" />
            REAL LIFE TREATS
          </button>
          <button
            onClick={() => setActiveTab('system-perks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'system-perks'
                ? 'bg-amber-500 text-zinc-950 font-extrabold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            SYSTEM PERKS
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 relative ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-zinc-950 font-extrabold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <Tag className="h-3.5 w-3.5 text-purple-400" />
            MY VOUCHERS ({inventory.length})
            {activeVouchers.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          CREATE CUSTOM REWARD
        </button>
      </div>

      {/* INVENTORY / VOUCHERS VIEW TAB */}
      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-400" />
              ACTIVE REWARD VOUCHERS ({activeVouchers.length})
            </h3>

            {activeVouchers.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                No unredeemed vouchers in your inventory. Purchase rewards from the catalog to claim them here!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeVouchers.map(v => (
                  <div 
                    key={v.id} 
                    className="bg-zinc-950 border border-amber-500/40 hover:border-amber-400 rounded-xl p-4 space-y-3 shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{v.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{v.itemName}</h4>
                          <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
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
                      <span className="text-xs font-mono text-zinc-400">Cost: {v.costCoins} 🪙</span>
                      <button
                        onClick={() => handleUseVoucher(v.id)}
                        className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs font-mono shadow transition flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
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
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                CLAIMED / REDEEMED HISTORY ({usedVouchers.length})
              </h4>
              <div className="divide-y divide-white/5">
                {usedVouchers.map(v => (
                  <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{v.icon}</span>
                      <span className="text-zinc-300 font-medium line-through opacity-75">{v.itemName}</span>
                      <span className="text-[9px] font-mono text-zinc-500">({v.category})</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
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
                className={`bg-zinc-900/80 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition duration-200 relative overflow-hidden ${
                  canAfford 
                    ? 'border-amber-500/30 hover:border-amber-500/60 shadow-lg' 
                    : 'border-white/5 opacity-80'
                }`}
              >
                {/* TOP HEADER */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">{item.name}</h3>
                        <span className="text-[9.5px] font-mono text-amber-400/90 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {item.isCustom && (
                      <button
                        onClick={() => deleteCustomShopItem(item.id)}
                        className="text-zinc-600 hover:text-rose-400 transition p-1"
                        title="Delete custom reward"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* BOTTOM PRICE & ACTION */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-zinc-400">Price:</div>
                    <div className="text-base font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Coins className="h-4 w-4 text-amber-400" />
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
                      <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-amber-500 h-full transition-all duration-300"
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
                        ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/10 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
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
              className="bg-zinc-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-400" />
                  CREATE CUSTOM REWARD
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-zinc-500 hover:text-white font-mono text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustom} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Reward Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Order Thai Food, 30m Spa Break, Buy Lego Set"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of what this reward grants you..."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Coin Price (🪙)</label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={customCost}
                      onChange={(e) => setCustomCost(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as ShopItemCategory)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="Real Life Reward">Real Life Reward</option>
                      <option value="Custom Personal">Custom Personal</option>
                      <option value="System Perk">System Perk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">Choose Icon</label>
                  <div className="flex flex-wrap gap-2 bg-zinc-950 p-3 rounded-xl border border-white/5">
                    {iconsList.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCustomIcon(icon)}
                        className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition ${
                          customIcon === icon
                            ? 'bg-amber-500/30 border border-amber-400'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs px-5 py-2 rounded-xl transition shadow-md"
                  >
                    ADD TO REWARD CATALOG
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
