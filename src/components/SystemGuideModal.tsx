import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Activity, Swords, Target, Briefcase, Award, Sparkles, 
  ShoppingBag, BarChart3, Network, Settings, Compass, FolderOpen, 
  Search, ChevronRight, X, HelpCircle, CheckCircle2, Cpu, Flame,
  Zap, Calendar, RefreshCw, Shield, Timer, Coins, ArrowRight, Languages,
  GitFork, ListTodo, FileText, Layers, Crosshair
} from 'lucide-react';
import { motion } from 'motion/react';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function SystemGuideModal({ isOpen, onClose, onNavigateTab }: SystemGuideModalProps) {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    try {
      const saved = localStorage.getItem('pale_ore_guide_lang');
      return (saved === 'ar' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pale_ore_guide_lang', language);
    } catch {}
  }, [language]);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const sections = [
    {
      id: 'getting-started',
      titleEn: '1. Architecture & RPG Loop',
      titleAr: '1. بنية النظام ودورة الترقية',
      icon: BookOpen,
      badgeEn: 'ESSENTIAL',
      badgeAr: 'أساسي',
      color: 'text-cyan-400',
    },
    {
      id: 'core-attributes',
      titleEn: '2. Attributes & Math Engine',
      titleAr: '2. الخصائص والمعادلة الرياضية',
      icon: Cpu,
      badgeEn: 'MECHANICS',
      badgeAr: 'المعادلة',
      color: 'text-purple-400',
    },
    {
      id: 'operations',
      titleEn: '3. Operations & Focus Engine',
      titleAr: '3. العمليات ومحرك التركيز',
      icon: Swords,
      badgeEn: 'DAILY',
      badgeAr: 'يومي',
      color: 'text-emerald-400',
    },
    {
      id: 'strategy',
      titleEn: '4. Goals, Projects & Mini-Breakdowns',
      titleAr: '4. الأهداف والمشاريع والتقسيم المصغر',
      icon: Target,
      badgeEn: 'PLANNING',
      badgeAr: 'تخطيط',
      color: 'text-amber-400',
    },
    {
      id: 'strategic-models',
      titleEn: '5. Decision Models & SOP Docs',
      titleAr: '5. النماذج الاستراتيجية وثائق SOP',
      icon: Compass,
      badgeEn: 'MODELS',
      badgeAr: 'نماذج',
      color: 'text-blue-400',
    },
    {
      id: 'mastery',
      titleEn: '6. Skills, Seals & Class Titles',
      titleAr: '6. المهارات والأختام ونظام الرتب',
      icon: Award,
      badgeEn: 'PROGRESSION',
      badgeAr: 'تقدم',
      color: 'text-pink-400',
    },
    {
      id: 'shop-rewards',
      titleEn: '7. Luminescent Ore Shop',
      titleAr: '7. متجر خامات النور والمكافآت',
      icon: ShoppingBag,
      badgeEn: 'REWARDS',
      badgeAr: 'مكافآت',
      color: 'text-amber-400',
    },
    {
      id: 'analytics-system',
      titleEn: '8. Analytics, Node Canvas & Override',
      titleAr: '8. التحليلات وشبكة العقد ومحرك التحكم',
      icon: Settings,
      badgeEn: 'CONTROL',
      badgeAr: 'تحكم',
      color: 'text-indigo-400',
    }
  ];

  const handleNavigate = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        dir={isAr ? 'rtl' : 'ltr'}
        className="glass-panel border border-cyan-500/30 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.18)] bg-zinc-950/95"
      >
        {/* MODAL HEADER WITH LANGUAGE TOGGLE */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-white flex items-center gap-2">
                {isAr ? 'دليل التشغيل الشامل لمنظومة PALE ORE' : 'PALE ORE PROGRESSION OS — MASTER SYSTEM MANUAL'}
              </h2>
              <p className="text-xs font-mono text-cyan-400/80">
                {isAr 
                  ? 'الدليل التفصيلي لمعادلات النظام، محرك الخصائص، الأهداف المصغرة، والعمليات الاستراتيجية' 
                  : 'Comprehensive Operational Manual, Mathematical Equations & Execution Frameworks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* LANGUAGE SWITCHER BUTTON */}
            <div className="flex items-center bg-zinc-950 border border-cyan-500/30 rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition flex items-center gap-1 ${
                  language === 'en' 
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Languages className="h-3.5 w-3.5" />
                English
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition flex items-center gap-1 ${
                  language === 'ar' 
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Languages className="h-3.5 w-3.5" />
                العربية
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title={isAr ? 'إغلاق الدليل' : 'Close Manual'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY GRID (SIDEBAR + CONTENT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[480px]">
          
          {/* GUIDE NAVIGATION SIDEBAR */}
          <div className="w-full md:w-64 bg-zinc-950/80 border-b md:border-b-0 md:border-r border-white/10 p-3 space-y-1 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-2 py-1">
              {isAr ? 'أقسام الدليل الشامل' : 'MANUAL SECTIONS'}
            </div>

            {sections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                    isActive 
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${sec.color}`} />
                    <span className="truncate">{isAr ? sec.titleAr : sec.titleEn}</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {isAr ? sec.badgeAr : sec.badgeEn}
                  </span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-white/5 mt-4 p-3 bg-zinc-900/50 rounded-xl space-y-2">
              <div className="text-[10px] font-mono text-zinc-400 font-bold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>{isAr ? 'تنويه محاكاة الوقت' : 'SYS DATE CONTROLLER'}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                {isAr 
                  ? 'يمكنك اختبار ترحيل الأيام وتطبيق الغرامات بسلاسة عن طريق تغيير تاريخ النظام (SYS DATE) بأعلى الشاشة ثم الضغط على SYNC TODAY للعودة للوقت الحقيقي.' 
                  : 'You can test daily habit resets or midnight penalties by shifting the SYS DATE at top-left. Click SYNC TODAY anytime to restore real time.'}
              </p>
            </div>
          </div>

          {/* CONTENT DISPLAY AREA */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 font-sans leading-relaxed bg-zinc-950/50">
            
            {/* 1. ARCHITECTURE & RPG LOOP */}
            {activeSection === 'getting-started' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    {isAr ? '1. بنية النظام ودورة الترقية RPG' : '1. System Architecture & The RPG Progression Loop'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'نظام تشغيل الحياة الشخصية PALE ORE تحويل الأهداف اليومية والمهارات إلى حلقة تنفيذية بنظام ألعاب الأدوار RPG'
                      : 'PALE ORE is a personal Progression Operating System turning real-world goals, habits, and skill mastery into an RPG execution loop.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-cyan-500/20 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold text-[11px] block flex items-center gap-1">
                      ⚡ {isAr ? 'العمليات والمهام' : 'DIRECTIVES'}
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {isAr 
                        ? 'إنجاز المهام الرئيسية، معارك الزعماء، والعادات اليومية يمنحك نقاط الخبرة XP، عملات النور، وارتفاع الخصائص.' 
                        : 'Execute Quests, Boss Battles & Daily Habits to earn XP, Luminescent Coins, and Attribute points.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-purple-500/20 rounded-xl space-y-1.5">
                    <span className="text-purple-400 font-bold text-[11px] block flex items-center gap-1">
                      🧬 {isAr ? 'الخصائص والقدرات' : 'ATTRIBUTES'}
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {isAr 
                        ? 'تتكون قدراتك من 8 خصائص (القوة، التركيز، المعرفة، الانضباط، المرونة، الحكمة، الاجتماعي، الإيمان) ترتفع مع إنجاز المهام والمهارات.' 
                        : '8 core stats (Strength, Focus, Knowledge, Discipline, Agility, Wisdom, Social, Faith) grow dynamically through proven quest completions.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-emerald-500/20 rounded-xl space-y-1.5">
                    <span className="text-emerald-400 font-bold text-[11px] block flex items-center gap-1">
                      🏆 {isAr ? 'الاحتراف والمكافآت' : 'MASTERY'}
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {isAr 
                        ? 'رفع مستويات المهارات، كسر أختام القوة لفتح بونص مئوي دائم، واستبدال العملات بمكافآت في متجر خامات النور.' 
                        : 'Level up skills, unseal latent Power Seals for passive multipliers, and spend earned coins in the Reward Shop.'}
                    </p>
                  </div>
                </div>

                {/* NAVIGATION MAP */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {isAr ? 'خريطة التصفح الرئيسية للنظام:' : 'Primary System Navigation Map:'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div onClick={() => handleNavigate('dashboard')} className="p-3 bg-zinc-900/60 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Activity className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{isAr ? 'لوحة التحكم (Dashboard)' : 'Dashboard'}</span>
                        <span className="text-[11px] text-zinc-400">{isAr ? 'الملخص اليومي، Target الأولوي، ومصفوفة الخصائص الـ8.' : 'Daily summary, priority target, and 8-stat attribute capability matrix.'}</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('quests')} className="p-3 bg-zinc-900/60 hover:bg-emerald-950/30 border border-white/5 hover:border-emerald-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Swords className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{isAr ? 'العمليات والمهام (Quests & Habits)' : 'Quests & Directives'}</span>
                        <span className="text-[11px] text-zinc-400">{isAr ? 'إدارة المهام الرئيسية والجانبية والعادات والزعماء وتقسيم ودمج المهام.' : 'Manage main/side quests, daily habits, boss fights, split/merge/move tools.'}</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('goals')} className="p-3 bg-zinc-900/60 hover:bg-amber-950/30 border border-white/5 hover:border-amber-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Target className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{isAr ? 'الأهداف والأهداف المصغرة (Goals & Mini-Goals)' : 'Goals & Mini-Goals'}</span>
                        <span className="text-[11px] text-zinc-400">{isAr ? 'تفكيك الرؤى الاستراتيجية الكبيرة إلى أهداف مصغرة ومراحل قابلة للتتبع.' : 'Breakdown macro strategic vision into actionable mini-goals and milestones.'}</span>
                      </div>
                    </div>

                    <div onClick={() => handleNavigate('projects')} className="p-3 bg-zinc-900/60 hover:bg-blue-950/30 border border-white/5 hover:border-blue-500/30 rounded-xl cursor-pointer transition flex items-start gap-2.5">
                      <Briefcase className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{isAr ? 'المشاريع والمشاريع المصغرة (Projects & Sub-Projects)' : 'Projects & Sub-Projects'}</span>
                        <span className="text-[11px] text-zinc-400">{isAr ? 'تنظيم تسليمات المخرجات البرمجية أو الميدانية إلى مكونات فرعية ومهمات.' : 'Group tasks into project directories with sub-project components & deadlines.'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ATTRIBUTES & MATH ENGINE */}
            {activeSection === 'core-attributes' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-400" />
                    {isAr ? '2. مصفوفة الخصائص والمعادلة الرياضية الدقيقة' : '2. Attribute Matrix & Precision Mathematical Engine'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'كيف يتم حساب وتحديد مستويات الخصائص الـ8 بناءً على أدلة الإنجاز الفعلية والمستويات المبدئية والبونص المكتسب'
                      : 'How core stats are dynamically computed using baseline levels, quest completion evidence, and seal multipliers.'}
                  </p>
                </div>

                {/* EXACT MATHEMATICAL FORMULA BOX */}
                <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-3 font-mono">
                  <div className="text-xs font-bold text-purple-300 uppercase flex items-center justify-between">
                    <span>{isAr ? 'المعادلة الرياضية الرسمية للخصائص' : 'EXPLICIT ATTRIBUTE FORMULA'}</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">FORMULA_VERIFIED</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/10 rounded-lg text-center text-sm sm:text-base font-extrabold text-white">
                    {isAr ? (
                      <div>
                        <span className="text-amber-300">المستوى الإجمالي</span> = <span className="text-zinc-300">الأساس المبدئي (Base)</span> + <span className="text-emerald-400">بونص المهام والمهارات (Earned Bonus)</span> + <span className="text-purple-400">تعزيز الأختام (Seal Boost)</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-amber-300">Total Level</span> = <span className="text-zinc-300">Base Baseline</span> + <span className="text-emerald-400">Earned Bonus</span> + <span className="text-purple-400">Seal & Class Boost</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {isAr 
                      ? 'لكل خاصية أساس مبدئي (Base) تحدده بنفسك في System Control، يضاف عليه بونص مكتسب (Earned Bonus) يتم حسابه تلقائياً من أدلة إنجازك للمهام والمهارات المرتبطة بتلك الخاصية، بالإضافة لتعزيز الأختام الكامنة (Seal Boost).'
                      : 'Each attribute has a configurable base baseline (e.g. 10), plus earned bonus levels calculated from completed quest evidence and skill practice, plus passive seal boosts.'}
                  </p>
                </div>

                {/* 8 ATTRIBUTES DETAILED BREAKDOWN */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {isAr ? 'شرح الخصائص الـ8 ومصادر نموها:' : 'The 8 Core Attributes & Progression Drivers:'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-red-400 block font-mono">1. Strength ({isAr ? 'القوة البدنية' : 'Strength'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بإنجاز مهام اللياقة البدنية والتمارين ومعارك الزعماء Boss Quests.' : 'Increases by completing Fitness skills, physical workouts, and Boss Quests.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-cyan-400 block font-mono">2. Focus ({isAr ? 'التركيز العميق' : 'Focus'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بإتمام المهام الرئيسية Main Quests وإنجاز جلسات مؤقت التركيز Pomodoro.' : 'Grows through completing Main Quests and logging Pomodoro focus sessions.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-blue-400 block font-mono">3. Knowledge ({isAr ? 'المعرفة والمعلومات' : 'Knowledge'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بإنجاز مهارات البرمجة واللغات (العربية، الإنجليزية، الفرنسية) والشطرنج.' : 'Grows via Programming, Languages (Arabic, English, French), and Chess skill practice.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-400 block font-mono">4. Discipline ({isAr ? 'الانضباط والالتزام' : 'Discipline'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بالحفاظ على العادات اليومية الروتينية والمهام الجانبية Side Quests.' : 'Driven by maintaining daily habits routines and side directive completions.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-amber-400 block font-mono">5. Agility ({isAr ? 'المرونة والسرعة' : 'Agility'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تعتمد على السرعة في إغلاق المهمات الاستجابة الفورية للعادات.' : 'Measures speed of quest resolution and rapid daily habit response.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-purple-400 block font-mono">6. Wisdom ({isAr ? 'الحكمة والتخطيط' : 'Wisdom'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بإتمام الأهداف الاستراتيجية الكبرى Goals والربط بين المهمات.' : 'Grows by completing strategic vision Goals and executing SOP planning docs.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-pink-400 block font-mono">7. Social ({isAr ? 'التواصل والاجتماعي' : 'Social'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بمهارات الكتابة، التواصل، الأعمال Business، والطهي.' : 'Driven by Writing, Communication, Business, and Cooking skills.'}</p>
                    </div>

                    <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-300 block font-mono">8. Faith ({isAr ? 'الإيمان والروحانيات' : 'Faith'})</span>
                      <p className="text-zinc-400 text-[11px] font-sans">{isAr ? 'تزيد بتلاوة وحفظ القرآن الكريم واللغة العربية والالتزام الإيماني.' : 'Grows through Qur\'an study, Arabic mastery, and spiritual habits.'}</p>
                    </div>
                  </div>
                </div>

                {/* DASHBOARD FILTER FEATURE */}
                <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> {isAr ? 'الفلترة التفاعلية في لوحة التحكم (Dashboard)' : 'Interactive Dashboard Attribute Filter'}
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans">
                    {isAr 
                      ? 'عندما تضغط على أي بطاقة خاصية داخل مصفوفة الخصائص بالـ Dashboard، يتم فلترة جدول المهام تلقائياً ليعرض لك فقط المهام التي تساهم في رفع هذه الخاصية مباشرة!' 
                      : 'Clicking any attribute card in the Dashboard matrix instantly filters your Quests Board to display only tasks that actively boost that stat!'}
                  </p>
                </div>
              </div>
            )}

            {/* 3. OPERATIONS & FOCUS ENGINE */}
            {activeSection === 'operations' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Swords className="h-5 w-5 text-emerald-400" />
                    {isAr ? '3. العمليات، إدارة المهام ومحرك التركيز (Pomodoro)' : '3. Operations, Directives Management & Focus Engine'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'أنواع المهام، صعوباتها، أدوات تقسيم/دمج/تكرار المهام، ومؤقت التركيز البومودورو' 
                      : 'Quest categories, difficulty rewards, advanced split/merge actions, and the Pomodoro Focus overlay.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-cyan-400 block">{isAr ? 'أنواع المهام (Quest Types)' : 'Quest Categories'}</span>
                    <ul className="text-zinc-400 text-[11px] space-y-1 font-sans">
                      <li>• <strong>Main:</strong> {isAr ? 'المهمات الرئيسية الكبرى.' : 'Core operational goals.'}</li>
                      <li>• <strong>Side:</strong> {isAr ? 'المهمات الجانبية السريعة.' : 'Quick secondary tasks.'}</li>
                      <li>• <strong>Boss:</strong> {isAr ? 'معارك الزعماء الشاقة (نقاط مضاعفة).' : 'Challenging high-reward directives.'}</li>
                      <li>• <strong>Habit:</strong> {isAr ? 'العادات اليومية ذات العداد التراكمي.' : 'Daily routines with streak counter.'}</li>
                      <li>• <strong>Recovery & Penalty:</strong> {isAr ? 'مهام استعادة النقاط بعد الغرامات.' : 'Recovery quests to offset missed items.'}</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-emerald-400 block">{isAr ? 'مستويات الصعوبة والمكافآت' : 'Difficulties & XP Multipliers'}</span>
                    <ul className="text-zinc-400 text-[11px] space-y-1 font-sans">
                      <li>• <strong>Easy:</strong> +25 XP</li>
                      <li>• <strong>Normal:</strong> +50 XP</li>
                      <li>• <strong>Hard:</strong> +100 XP</li>
                      <li>• <strong>Boss:</strong> +250 XP + Luminescent Coins</li>
                    </ul>
                  </div>
                </div>

                {/* ADVANCED QUEST ACTIONS */}
                <div className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-cyan-400" />
                    {isAr ? 'الأدوات المتقدمة لإدارة المهام:' : 'Advanced Quest Directive Controls:'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5">
                      <span className="text-cyan-400 font-bold block">✂️ SPLIT (تقسيم)</span>
                      <p className="text-zinc-400 font-sans text-[11px] mt-1">{isAr ? 'تفكيك مهمة كبيرة إلى مهمتين فرعيتين مع تقسيم XP بنسبة معينة.' : 'Split an overwhelming task into 2 parts with ratio-based XP.'}</p>
                    </div>
                    <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5">
                      <span className="text-purple-400 font-bold block">🔗 MERGE (دمج)</span>
                      <p className="text-zinc-400 font-sans text-[11px] mt-1">{isAr ? 'دمج مهمتين صغيرتين في مهمة واحدة موحدة.' : 'Combine 2 small directives into 1 unified quest.'}</p>
                    </div>
                    <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5">
                      <span className="text-amber-400 font-bold block">📦 MOVE (نقل)</span>
                      <p className="text-zinc-400 font-sans text-[11px] mt-1">{isAr ? 'إعادة ربط المهمة بـ Goal أو Project أو Milestone مختلف.' : 'Reassign quest to a different Goal, Project, or Milestone.'}</p>
                    </div>
                  </div>
                </div>

                {/* POMODORO FOCUS OVERLAY */}
                <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Timer className="h-4 w-4" /> {isAr ? 'مؤقت التركيز المتكامل (Pomodoro Focus Timer)' : 'Integrated Pomodoro Focus Timer Overlay'}
                  </h4>
                  <p className="text-xs text-zinc-300 font-sans">
                    {isAr 
                      ? 'اضغط زر FOCUS TIMER بالأعلى لتشغيل مؤقت التركيز (25د، 45د، 60د)، وربط الجلسة بمهمة نشطة للحصول على بونص XP إضافي مع خيارات الصوت المحيطي!' 
                      : 'Launch Pomodoro timer overlays (25m, 45m, 60m), link focus cycles directly to active quests for extra XP, and toggle ambient focus audio.'}
                  </p>
                </div>
              </div>
            )}

            {/* 4. GOALS, PROJECTS & MINI-BREAKDOWNS */}
            {activeSection === 'strategy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    {isAr ? '4. الأهداف، المشاريع، والتقسيم المصغر (Mini-Goals & Sub-Projects)' : '4. Strategic Goals, Projects & Mini-Breakdowns'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'تفكيك الرؤى الاستراتيجية الكبرى إلى أهداف مصغرة ومشاريع فرعية مع شريط تقدم تلقائي' 
                      : 'Deconstructing macro vision into actionable micro-milestones with automated progress calculation.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MINI GOALS EXPLANATION */}
                  <div className="p-4 bg-zinc-900/90 border border-amber-500/30 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <GitFork className="h-4 w-4" />
                      {isAr ? 'الأهداف المصغرة (Mini-Goals / Sub-Goals)' : 'Mini-Goals & Sub-Goals Structure'}
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {isAr 
                        ? 'في شاشة GoalsView، يمكنك إضافة أهداف مصغرة (Mini-Goals) لكل هدف رئيسي. وضع علامة صح على الهدف المصغر يرفع نسبة إنجاز الهدف الرئيسي مباشرة!' 
                        : 'Inside GoalsView, you can break down any main goal into specific Mini-Goals with target dates. Toggling mini-goals automatically re-calculates the goal progress bar!'}
                    </p>
                    <ul className="text-[11px] text-zinc-400 font-mono space-y-1">
                      <li>• {isAr ? 'تحديد مواعيد مستهدفة لكل هدف مصغر.' : 'Assign target completion dates per mini-goal.'}</li>
                      <li>• {isAr ? 'تتبع إنجاز Micro-milestones بشكل بصري.' : 'Visually track micro-milestone status.'}</li>
                    </ul>
                  </div>

                  {/* MINI PROJECTS EXPLANATION */}
                  <div className="p-4 bg-zinc-900/90 border border-blue-500/30 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {isAr ? 'المشاريع المصغرة (Mini-Projects / Sub-Projects)' : 'Mini-Projects & Sub-Tasks Structure'}
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {isAr 
                        ? 'في شاشة ProjectsView، يمكنك إنشاء مشاريع مصغرة ومكونات فرعية لكل مشروع، مما يسهل توزيع التسليمات المعقدة لأجزاء قابلة للتنفيذ.' 
                        : 'Inside ProjectsView, you can break deliverables into mini-project sub-components. Completing sub-components advances overall project readiness.'}
                    </p>
                    <ul className="text-[11px] text-zinc-400 font-mono space-y-1">
                      <li>• {isAr ? 'تقسيم المخرجات البرمجية أو الميدانية.' : 'Divide complex software or physical deliverables.'}</li>
                      <li>• {isAr ? 'ربط المهمات والـ Milestones تلقائياً.' : 'Link milestones and quests directly.'}</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1 text-xs">
                  <span className="font-mono font-bold text-cyan-400 block uppercase">
                    {isAr ? 'آفاق الأهداف الزمانية (Goal Horizons):' : 'Goal Horizon Tiers:'}
                  </span>
                  <p className="text-zinc-400 font-sans">
                    {isAr 
                      ? '30-Day Sprint (سباق 30 يوم) | Quarterly (فصلي Q1-Q4) | Annual Vision (رؤية سنوية) | Life Vision (رؤية مدى الحياة).' 
                      : '30-Day Sprint | Quarterly (Q1-Q4) | Annual Vision | Life Vision.'}
                  </p>
                </div>
              </div>
            )}

            {/* 5. STRATEGIC MODELS & SOP DOCS */}
            {activeSection === 'strategic-models' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Compass className="h-5 w-5 text-blue-400" />
                    {isAr ? '5. النماذج الاستراتيجية وثائق SOP القياسية' : '5. Strategic Decision Models & SOP Planning Logs'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'نماذج واتخاذ القرار التفاعلية وثائق التخطيط التشغيلي المعيارية' 
                      : 'Interactive decision frameworks and connected Standard Operating Procedure documents.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-cyan-400 block">📊 Eisenhower Matrix</span>
                    <p className="text-zinc-400 font-sans text-[11px]">
                      {isAr ? 'تصنيف المهام حسب العجلة والأهمية: عاجل وهام (نفذ)، غير عاجل وهام (جدول)، عاجل وغير هام (فوض)، غير عاجل وغير هام (احذف).' : 'Categorize tasks into Do Now, Schedule, Delegate, and Eliminate quadrants.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-purple-400 block">🎯 OKRs (Objectives & Key Results)</span>
                    <p className="text-zinc-400 font-sans text-[11px]">
                      {isAr ? 'تحديد الأهداف الاستراتيجية الكبرى وربطها بنتائج قياسية محددة بأرقام.' : 'Align qualitative objectives with quantitative key result progress bars.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-amber-400 block">⚡ Pareto 80/20 Rule</span>
                    <p className="text-zinc-400 font-sans text-[11px]">
                      {isAr ? 'التركيز على الـ 20% من المجهود والمهام التي تحقق 80% من النتائج الفعلية.' : 'Identify the top 20% high-leverage activities driving 80% of actual outcomes.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1.5">
                    <span className="font-mono font-bold text-emerald-400 block">📑 Planning Documents & SOPs</span>
                    <p className="text-zinc-400 font-sans text-[11px]">
                      {isAr ? 'صياغة وثائق Markdown قياسية وربطها بالأهداف والمشاريع والمهارات.' : 'Create Markdown SOP planning logs and link them to Goals, Projects, or Skills.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. MASTERY, SEALS & CLASS TITLES */}
            {activeSection === 'mastery' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-pink-400" />
                    {isAr ? '6. شجرة المهارات، أختام القوة، ونظام الوظائف والرتب' : '6. Skills Mastery Tree, Power Seals & Job Class System'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'رفع كفاءة المهارات، كسر الأختام الكامنة للحصول على بونص مئوي دائم، وتجهيز ألقاب الوظائف' 
                      : 'Leveling skill competencies, breaking latent seals for stats multipliers, and equipping job titles.'}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-zinc-900/80 border border-pink-500/20 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-pink-400 uppercase block">1. Skills Tree ({isAr ? 'شجرة المهارات' : 'Skills Tree'})</span>
                    <p className="text-zinc-300 font-sans">
                      {isAr 
                        ? 'تحديد المهارات الأساسية (Primary) والمهارات الفرعية (Secondary). تسجيل دقائق التمرين يمنح المهارة XP ويرفع مستواها لـ Mastery 100%.' 
                        : 'Organize skills into Primary and Secondary parent-child trees. Practice logs grant skill XP and boost mastery.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-purple-500/20 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-purple-400 uppercase block">2. Power Seals ({isAr ? 'أختام القوة الكامنة' : 'Power Seals'})</span>
                    <p className="text-zinc-300 font-sans">
                      {isAr 
                        ? 'عند وصولك لمستويات شخصية معينة، يمكنك كسر الأختام الكامنة للحصول على تعزيزات مئوية دائمة للـ XP والخصائص!' 
                        : 'Unseal latent power seals as your player level grows to unlock permanent passive percentage bonuses.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-cyan-500/20 rounded-xl space-y-1">
                    <span className="font-mono font-bold text-cyan-300 uppercase block">3. Class Titles & Jobs ({isAr ? 'الوظائف والألقاب المجهزة' : 'Class Titles'})</span>
                    <p className="text-zinc-300 font-sans">
                      {isAr 
                        ? 'تجهيز ألقاب الوظائف (مثل Shadow Monarch, Archmage, High Engineer) لتخصيص الشارات وإبراز الرتبة على اللوحة.' 
                        : 'Equip custom class titles and jobs to display unique badges and stat affinities across the operating system.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. LUMINESCENT SHOP */}
            {activeSection === 'shop-rewards' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-amber-400" />
                    {isAr ? '7. متجر خامات النور والمكافآت (Luminescent Ore Shop)' : '7. Luminescent Ore Reward Shop & Vouchers'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'استبدال العملات الذهبية المسحوبة من إنجاز المهام بمكافآت حقيقية ومزايا تشغيلية' 
                      : 'Redeem Luminescent Coins earned through quest completions for custom real-life treats or system perks.'}
                  </p>
                </div>

                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-amber-300">
                    <span className="flex items-center gap-1.5"><Coins className="h-4 w-4" /> {isAr ? 'كيف تكسب عملات النور (Coins)؟' : 'How Coins Are Earned'}</span>
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">CURRENCY_ENGINE</span>
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    {isAr 
                      ? 'تكتسب عملات النور تلقائياً مع كل مهمة مكتملة (خصوصاً معارك الزعماء Boss Fights) وعند إكمال دورات التركيز Pomodoro. يمكنك إضافة مكافآت مخصصة ذات تكلفة معينة واستبدالها بحرية.' 
                      : 'Coins generate automatically upon completing directives (especially Boss Fights) and finishing focus sessions. Add custom rewards to incentivize real-life execution!'}
                  </p>
                </div>
              </div>
            )}

            {/* 8. ANALYTICS, NODE CANVAS & OVERRIDE */}
            {activeSection === 'analytics-system' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    {isAr ? '8. التحليلات، شبكة العقد، ومحرك التحكم والتجاوز (System Control)' : '8. Analytics, Spiderweb Node Canvas & System Override'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {isAr 
                      ? 'التحليلات البيانية، شبكة العقد المرئية، والتعديل المباشر على الأساس المبدئي والنسخ الاحتياطي' 
                      : 'Performance telemetries, visual node connection canvas, and manual baseline stat overrides.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-cyan-400 font-bold block">1. ANALYTICS</span>
                    <p className="text-zinc-400 font-sans text-[11px]">{isAr ? 'رادار الخصائص المتقاطعة، معدل الإنجاز الأسبوعي، والتحليلات البيانية.' : 'Sustained attribute radar chart, weekly velocity, and performance metrics.'}</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-purple-400 font-bold block">2. SPIDERWEB CANVAS</span>
                    <p className="text-zinc-400 font-sans text-[11px]">{isAr ? 'لوحة كانفاس تفاعلية تربط الأهداف والمشاريع والمهام والمهارات بعقد مرئية.' : 'Interactive visual canvas connecting all Goals, Projects, Quests, and Skills.'}</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
                    <span className="text-amber-300 font-bold block">3. SYSTEM OVERRIDE</span>
                    <p className="text-zinc-400 font-sans text-[11px]">{isAr ? 'في System Control يمكنك تعديل الأساس المبدئي لكل خاصية والتصدير/الاستيراد JSON.' : 'In System Control, manually adjust starting attribute baselines or backup JSON.'}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>{isAr ? 'يمكنك التنقل فوراً لأي شاشة بالضغط على أي خيار أدناه.' : 'Click any action button below to navigate directly to that section.'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>{isAr ? 'الانتقال للوحة التحكم' : 'GO TO DASHBOARD'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-mono text-xs font-bold transition"
            >
              {isAr ? 'إغلاق الدليل' : 'CLOSE MANUAL'}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
