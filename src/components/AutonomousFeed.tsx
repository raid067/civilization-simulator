import React, { useState } from 'react';
import {
  Brain,
  Filter,
  Flame,
  Home,
  Shield,
  HeartPulse,
  BookOpen,
  Crown,
  Boxes,
} from 'lucide-react';
import { AutonomousDecision, Season } from '../types';

interface AutonomousFeedProps {
  decisions?: AutonomousDecision[];
  currentYear: number;
  currentSeason: Season;
  maxDisplay?: number;
}

export const AutonomousFeed: React.FC<AutonomousFeedProps> = ({
  decisions = [],
  currentYear,
  currentSeason,
  maxDisplay = 20,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Decisions' },
    { id: 'Food & Calorie', label: 'Food & Calorie' },
    { id: 'Housing & Warmth', label: 'Housing' },
    { id: 'Infrastructure', label: 'Infrastructure' },
    { id: 'Healthcare', label: 'Health' },
    { id: 'Technology', label: 'Tech' },
    { id: 'Security', label: 'Security' },
    { id: 'Governance', label: 'Governance' },
  ];

  const filtered = decisions
    .filter((d) => selectedCategory === 'all' || d.category === selectedCategory)
    .slice()
    .reverse();

  const getCategoryIcon = (cat: AutonomousDecision['category']) => {
    switch (cat) {
      case 'Food & Calorie':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Housing & Warmth':
        return <Home className="w-3.5 h-3.5 text-orange-400" />;
      case 'Infrastructure':
        return <Boxes className="w-3.5 h-3.5 text-blue-400" />;
      case 'Healthcare':
        return <HeartPulse className="w-3.5 h-3.5 text-pink-400" />;
      case 'Technology':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'Security':
        return <Shield className="w-3.5 h-3.5 text-red-400" />;
      case 'Governance':
        return <Crown className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <Brain className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const getImportanceBadge = (importance: AutonomousDecision['importance']) => {
    switch (importance) {
      case 'historic':
        return (
          <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800">
            Historic
          </span>
        );
      case 'notable':
        return (
          <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800">
            Notable
          </span>
        );
      case 'routine':
        return (
          <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-medium tracking-wider bg-stone-800 text-stone-400 border border-stone-700">
            Routine
          </span>
        );
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              Autonomous Decisions & Council Deliberation Feed
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-950 text-stone-400 border border-stone-800 font-mono">
                {decisions.length} recorded
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Real-time closed-loop actions executed by the civilization based on living conditions, emergencies, and leader doctrine.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <Filter className="w-3 h-3 text-stone-500 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-[11px] px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Stream */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-500 italic">
            No autonomous decisions recorded in this category yet.
          </div>
        ) : (
          filtered.slice(0, maxDisplay).map((d) => (
            <div
              key={d.id}
              className="bg-stone-950/80 border border-stone-800/80 hover:border-stone-700 rounded-lg p-3 text-xs transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-stone-900 border border-stone-800">
                    {getCategoryIcon(d.category)}
                  </div>
                  <span className="font-bold text-stone-200">{d.action}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getImportanceBadge(d.importance)}
                  <span className="text-[10px] font-mono text-stone-400">
                    Year {d.year} • {d.season}
                  </span>
                </div>
              </div>

              {/* Problem & Consequence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-300 pt-1">
                <div className="bg-stone-900/60 p-2 rounded border border-stone-800/60">
                  <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                    Trigger / Deficit:
                  </span>
                  <span>{d.problem}</span>
                </div>

                <div className="bg-stone-900/60 p-2 rounded border border-stone-800/60">
                  <span className="text-amber-400/90 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                    State Modification:
                  </span>
                  <span>{d.consequence}</span>
                </div>
              </div>

              {/* Rationale */}
              {d.reasoning && (
                <div className="text-[11px] text-stone-400 italic flex items-start gap-1 pt-0.5">
                  <span className="text-amber-500 font-serif font-bold text-xs">“</span>
                  <span>{d.reasoning}</span>
                  <span className="text-amber-500 font-serif font-bold text-xs">”</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
