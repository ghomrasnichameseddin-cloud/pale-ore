import React, { useState } from 'react';
import { TOPIC_ICON_OPTIONS, renderTopicIcon } from './TopicIconHelper';
import { Check } from 'lucide-react';

interface TopicIconPickerProps {
  selectedIconName: string;
  onSelectIcon: (iconName: string) => void;
  defaultCategory?: string;
}

export const TopicIconPicker: React.FC<TopicIconPickerProps> = ({
  selectedIconName,
  onSelectIcon,
  defaultCategory = 'Knowledge'
}) => {
  // Find which group currently contains the selected icon
  const initialGroup = TOPIC_ICON_OPTIONS.find(g => 
    g.icons.some(i => i.name === selectedIconName) || g.category.toLowerCase() === defaultCategory.toLowerCase()
  ) || TOPIC_ICON_OPTIONS[0];

  const [activeCategory, setActiveCategory] = useState<string>(initialGroup.category);

  const currentGroup = TOPIC_ICON_OPTIONS.find(g => g.category === activeCategory) || TOPIC_ICON_OPTIONS[0];

  return (
    <div className="space-y-2">
      {/* CATEGORY TABS */}
      <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
        {TOPIC_ICON_OPTIONS.map(group => {
          const isCategoryActive = group.category === activeCategory;
          const containsSelected = group.icons.some(i => i.name === selectedIconName);

          return (
            <button
              key={group.category}
              type="button"
              onClick={() => setActiveCategory(group.category)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isCategoryActive 
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/20' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span>{group.category}</span>
              {containsSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" title="Selected icon in this category" />
              )}
            </button>
          );
        })}
      </div>

      {/* ICONS IN SELECTED CATEGORY */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-zinc-950/80 p-2.5 rounded-lg border border-white/10">
        {currentGroup.icons.map(icon => {
          const isSelected = selectedIconName === icon.name;

          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => onSelectIcon(icon.name)}
              className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-[11px] font-mono border transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                {renderTopicIcon(icon.name, 'h-5 w-5')}
                {isSelected && (
                  <span className="absolute -top-1 -right-2 bg-cyan-500 text-black rounded-full p-0.5 shadow">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="truncate w-full text-center">{icon.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
