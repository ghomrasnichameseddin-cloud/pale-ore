import React, { useState } from 'react';
import { usePOS } from '../../POSContext';
import { 
  JobSpec, TitleSpec, LEVEL_RANK_NAMES, evaluateUnlockConditions, 
  isJobUnlocked, isTitleUnlocked, evaluateLevelConditions, getJobScaledPerk 
} from '../../jobsAndTitles';
import { renderTopicIcon } from './TopicIconHelper';
import { 
  Pencil, Sparkles, Trash2, Check, Lock, Star, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Shield, Zap
} from 'lucide-react';

interface MatrixCardProps {
  item: JobSpec | TitleSpec;
  isJob: boolean;
  isActive: boolean;
  onEdit: () => void;
  onLevelUp: () => void;
  onDelete?: () => void;
  onEquip: () => void;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({
  item,
  isJob,
  isActive,
  onEdit,
  onLevelUp,
  onDelete,
  onEquip
}) => {
  const { state, getJobLvl, getTitleLvl } = usePOS();
  const [showConditionsDetail, setShowConditionsDetail] = useState(false);

  const currentLevel = isJob ? getJobLvl(item.id) : getTitleLvl(item.id);
  const nextLevel = currentLevel < 7 ? currentLevel + 1 : 7;

  const unlockEval = evaluateUnlockConditions(item, state);
  const isUnlocked = isJob ? isJobUnlocked(item as JobSpec, state) : isTitleUnlocked(item as TitleSpec, state);
  const nextLevelEval = evaluateLevelConditions(item, nextLevel, state);
  const canLevelUp = currentLevel < 7 && nextLevelEval.isMet;

  const jobSpec = isJob ? (item as JobSpec) : null;
  const titleSpec = !isJob ? (item as TitleSpec) : null;

  const scaledPerk = jobSpec ? getJobScaledPerk(jobSpec, currentLevel) : null;
  const hasCustomConditions = !!(item.customLevelConditions && Object.keys(item.customLevelConditions).length > 0);

  return (
    <div 
      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col gap-3 font-mono text-xs ${
        isActive 
          ? 'border-cyan-500/60 bg-cyan-950/25 shadow-lg shadow-cyan-500/10' 
          : isUnlocked 
            ? 'border-white/10 bg-zinc-900/40 hover:border-white/20' 
            : 'border-white/5 bg-zinc-900/15 opacity-80'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* LEFT COLUMN: ICON + INFO */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isActive ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-zinc-900 border-white/10'
          }`}>
            {renderTopicIcon(item.iconName || (isJob ? 'Building' : 'GraduationCap'), "h-6 w-6")}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {/* BADGES & TITLE */}
            <div className="flex items-center gap-2 flex-wrap">
              {titleSpec?.badge && (
                <span className="text-[10px] font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                  [{titleSpec.badge}]
                </span>
              )}

              <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wide">
                {item.name}
              </h4>

              <span className="text-[9px] text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                LVL {currentLevel}/7 ({LEVEL_RANK_NAMES[currentLevel]})
              </span>

              <span className="text-[9px] text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                {item.category}
              </span>

              {hasCustomConditions && (
                <span className="text-[9px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  CUSTOM RULES
                </span>
              )}

              {item.isCustom && (
                <span className="text-[9px] text-purple-300 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  CUSTOM
                </span>
              )}
            </div>

            {/* 7-LEVEL PROGRESSION PIPELINE BAR */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between text-[9px] text-zinc-400">
                <span className="uppercase text-zinc-500">Progression Pipeline:</span>
                <span className="text-amber-400 font-bold">
                  {currentLevel === 7 ? '👑 MAX APEX LEVEL 7' : `Next: Lvl ${nextLevel} (${LEVEL_RANK_NAMES[nextLevel]})`}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                  <div 
                    key={lvl} 
                    className={`h-2 rounded transition-all ${
                      lvl <= currentLevel 
                        ? 'bg-gradient-to-r from-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                        : 'bg-zinc-800/80 border border-white/5'
                    }`}
                    title={`Level ${lvl}: ${LEVEL_RANK_NAMES[lvl]}`}
                  />
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">{item.description}</p>

            {/* PERK / UNLOCK REQUIREMENT */}
            {isJob && scaledPerk && (
              <div className="text-[10px] text-cyan-400 font-bold bg-cyan-950/30 border border-cyan-500/20 rounded px-2.5 py-1 inline-flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>PERK: {scaledPerk}</span>
              </div>
            )}

            {!isJob && titleSpec && (
              <div className="text-[10px] text-zinc-400 bg-white/[0.02] border border-white/10 rounded px-2.5 py-1 inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                <span>REQUIREMENT: <strong className="text-zinc-200">{titleSpec.unlockCondition}</strong></span>
              </div>
            )}

            {/* EXPANDABLE CONDITIONS CHECKLIST TOGGLE */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowConditionsDetail(!showConditionsDetail)}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition cursor-pointer"
              >
                <span>{currentLevel === 7 ? 'View Apex Conditions' : `Level ${nextLevel} Requirements`}</span>
                {showConditionsDetail ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {showConditionsDetail && (
                <div className="mt-2 p-2.5 bg-black/50 rounded-lg border border-white/10 space-y-1.5 animate-fade-in">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">
                    {currentLevel === 7 ? 'MAX LEVEL CONDITIONS SATISFIED:' : `LEVEL ${nextLevel} CONDITIONS STATUS:`}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentLevel === 7 ? unlockEval.metConditions : nextLevelEval.metConditions).map((cond, idx) => (
                      <span key={idx} className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[10px]">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        {cond}
                      </span>
                    ))}
                    {currentLevel < 7 && nextLevelEval.unmetConditions.map((cond, idx) => (
                      <span key={idx} className="bg-rose-950/70 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[10px]">
                        <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ACTION BUTTONS */}
        <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 flex flex-wrap md:flex-col items-center md:items-end gap-2">
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg border border-transparent hover:border-cyan-500/30 transition cursor-pointer"
              title="Edit Specs & Unlock Rules"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            
            <button
              type="button"
              onClick={onLevelUp}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Level Up & Condition Configurator"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>LEVEL UP / RULES</span>
            </button>

            {item.isCustom && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                title="Delete Custom Directive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* EQUIP / ACTIVE BUTTON */}
          {isActive ? (
            <span className="w-full md:w-auto text-center px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold rounded-lg flex items-center justify-center gap-1.5 text-[10px]">
              <Check className="h-3.5 w-3.5 stroke-[3]" /> EQUIPPED ACTIVE
            </span>
          ) : isUnlocked ? (
            <button
              type="button"
              onClick={onEquip}
              className="w-full md:w-auto px-4 py-1.5 bg-white/10 hover:bg-cyan-500 hover:text-black text-white font-bold rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider"
            >
              {isJob ? 'EQUIP JOB CLASS' : 'EQUIP TITLE'}
            </button>
          ) : (
            <div className="w-full md:w-auto text-center px-3 py-1.5 bg-zinc-900/80 border border-white/10 text-zinc-500 font-medium rounded-lg flex items-center justify-center gap-1.5 text-[10px]">
              <Lock className="h-3.5 w-3.5" /> LOCKED
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
