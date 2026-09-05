import React from 'react';
import {
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Users,
} from 'lucide-react';
import { CivilizationState } from '../types';

interface TechTreeProps {
  state: CivilizationState;
}

export const TechTree: React.FC<TechTreeProps> = ({ state }) => {
  const livingKeepers = state.people.filter((p) => p.alive && p.role === 'elder_lorekeeper').length;

  return (
    <div id="tech-tree-view" className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Generational Knowledge & Technological Evolution (Sections 26 & 28)
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Technology transforms resource efficiency rather than just unlocking items. Knowledge is living—passed orally
              around the fire. If the elders carrying a technology perish during famine or cold, that knowledge may be permanently lost!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 text-xs">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-stone-400">Living Lorekeepers</div>
              <div className="font-mono font-bold text-purple-300">{livingKeepers} elders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.technologies.map((tech) => {
          const isKnown = tech.discovered;
          const isVulnerable = isKnown && tech.activeKeepersCount <= 2 && tech.id !== 'tech-fire';

          return (
            <div
              key={tech.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                isKnown
                  ? 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                  : 'bg-stone-950/40 border-stone-900 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800 uppercase">
                    {tech.era}
                  </span>

                  {isKnown ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Discovered
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3" /> {tech.costPoints} lore pts left
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-stone-100 mb-1">{tech.name}</h3>
                <p className="text-xs text-stone-400 leading-relaxed mb-3">{tech.description}</p>

                {/* Practical Benefits */}
                <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 text-xs mb-3">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-0.5">
                    Civilization Impact
                  </div>
                  <div className="text-stone-300">{tech.benefits}</div>
                </div>
              </div>

              {/* Keepers of Knowledge */}
              <div className="border-t border-stone-800 pt-3 text-xs">
                {isKnown ? (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Living Knowledge Carriers:</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                        isVulnerable ? 'text-red-400 bg-red-950/60 border border-red-800' : 'text-purple-300'
                      }`}
                    >
                      {tech.activeKeepersCount} keepers
                    </span>
                  </div>
                ) : (
                  <div className="text-stone-500 italic text-[11px]">
                    Oral research progressing through elder campfire discussions.
                  </div>
                )}

                {isVulnerable && (
                  <div className="mt-2 text-[11px] text-red-400 flex items-center gap-1 bg-red-950/20 p-1.5 rounded border border-red-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Critical risk: Few elders remember this. If they die, knowledge is lost!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
