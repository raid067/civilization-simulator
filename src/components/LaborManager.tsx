import React from 'react';
import {
  Users,
  Wheat,
  Crosshair,
  Droplets,
  Axe,
  Hammer,
  Sparkles,
  Compass,
  BookOpen,
  Apple,
  Fish,
} from 'lucide-react';
import { CivilizationState, RoleType } from '../types';

interface LaborManagerProps {
  state: CivilizationState;
  onUpdateRoleDistribution: (targetRole: RoleType, delta: number) => void;
  onInspectPerson: (personId: string) => void;
  onToggleAutonomy?: (enabled: boolean) => void;
  onApplyPreset?: (preset: 'balanced' | 'food' | 'winter' | 'lore') => void;
}

const ROLE_DEFINITIONS: {
  id: RoleType;
  label: string;
  icon: React.ReactNode;
  description: string;
  keyResource: string;
  requiresAdult: boolean;
}[] = [
  {
    id: 'forager',
    label: 'Wild Foragers',
    icon: <Apple className="w-4 h-4 text-emerald-400" />,
    description: 'Gather wild berries, tubers, and edible plants from meadows and forest margins.',
    keyResource: 'Fruit, Roots & Plants',
    requiresAdult: true,
  },
  {
    id: 'hunter',
    label: 'Game Hunters',
    icon: <Crosshair className="w-4 h-4 text-red-400" />,
    description: 'Track deer, boar, and upland game for dense animal protein, bone, and hides.',
    keyResource: 'Raw Meat & Bone',
    requiresAdult: true,
  },
  {
    id: 'fisherman',
    label: 'River Fishermen',
    icon: <Fish className="w-4 h-4 text-blue-400" />,
    description: 'Catch river trout, salmon, and eels along the Red River basin; set fish weirs and ice traps.',
    keyResource: 'River Fish & Protein',
    requiresAdult: true,
  },
  {
    id: 'farmer',
    label: 'Terrace Cultivators',
    icon: <Wheat className="w-4 h-4 text-amber-400" />,
    description: 'Till river terrace loam and tend cereal grains. Requires agriculture tech for full yield.',
    keyResource: 'Grains & Seeds',
    requiresAdult: true,
  },
  {
    id: 'water_fetcher',
    label: 'Water Carriers',
    icon: <Droplets className="w-4 h-4 text-cyan-400" />,
    description: 'Haul fresh river and spring water to encampment cisterns and water skins.',
    keyResource: 'Fresh Water Reserve',
    requiresAdult: true,
  },
  {
    id: 'lumberjack',
    label: 'Wood & Fuel Cutters',
    icon: <Axe className="w-4 h-4 text-orange-400" />,
    description: 'Fell woodland trees and gather dry fallen timber for shelter construction and fires.',
    keyResource: 'Wood & Fuel Bundles',
    requiresAdult: true,
  },
  {
    id: 'stonecutter',
    label: 'Flint & Stone Quarrymen',
    icon: <Hammer className="w-4 h-4 text-stone-400" />,
    description: 'Break river boulders and quarry granite ridges for flint tools and firestones.',
    keyResource: 'Stone & Raw Flint',
    requiresAdult: true,
  },
  {
    id: 'builder',
    label: 'Shelter Builders',
    icon: <Hammer className="w-4 h-4 text-amber-500" />,
    description: 'Construct and repair leaf huts, thatched cabins, granaries, and defensive fences.',
    keyResource: 'Shelter Infrastructure',
    requiresAdult: true,
  },
  {
    id: 'herbalist',
    label: 'Healers & Herbalists',
    icon: <Sparkles className="w-4 h-4 text-pink-400" />,
    description: 'Prepare willow bark poultices and care for infected or wounded clan members.',
    keyResource: 'Reduced Clan Mortality',
    requiresAdult: true,
  },
  {
    id: 'toolmaker',
    label: 'Flint Knappers',
    icon: <Hammer className="w-4 h-4 text-yellow-400" />,
    description: 'Flake sharp biface tools and spear tips to boost efficiency across all roles.',
    keyResource: 'Work Efficiency Bonus',
    requiresAdult: true,
  },
  {
    id: 'scout',
    label: 'Trail Scouts',
    icon: <Compass className="w-4 h-4 text-teal-400" />,
    description: 'Range into distant mountains, coastlines, and steppes to discover resources.',
    keyResource: 'Region Discovery',
    requiresAdult: true,
  },
  {
    id: 'elder_lorekeeper',
    label: 'Elder Lorekeepers',
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    description: 'Maintain oral history and invent innovations around the fire. Preserves discoveries.',
    keyResource: 'Generational Knowledge',
    requiresAdult: true,
  },
];

export const LaborManager: React.FC<LaborManagerProps> = ({
  state,
  onUpdateRoleDistribution,
  onInspectPerson,
  onToggleAutonomy,
  onApplyPreset,
}) => {
  const livingPeople = state.people.filter((p) => p.alive);
  const adults = livingPeople.filter((p) => p.age >= 10);
  const children = livingPeople.filter((p) => p.age < 10);

  // Group living people by role
  const roleCounts: Record<string, number> = {};
  livingPeople.forEach((p) => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  });

  const isAutonomyOn = state.policies.autonomyEnabled !== false;

  return (
    <div id="labor-manager-view" className="space-y-6">
      {/* Header section */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Emergent Division of Labor & Societal Dynamics (Section 19)
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Every survival discipline demands dedicated human labor. Agents self-organize according to metabolic
              priorities (hydration, caloric intake, thermal survival). Observers can examine autonomous equilibrium
              or apply counterfactual societal policies.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 text-xs">
            <div>
              <div className="text-stone-400">Total Active Workforce</div>
              <div className="font-mono font-bold text-emerald-400 text-base">{adults.length} adult agents</div>
            </div>
            <div className="border-l border-stone-800 pl-3">
              <div className="text-stone-400">Dependent Cohort (Children)</div>
              <div className="font-mono font-bold text-stone-300 text-base">{children.length}</div>
            </div>
          </div>
        </div>

        {/* Autonomy & Archetypes Bar */}
        <div className="mt-4 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Autonomy Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle-tribal-autonomy"
                checked={isAutonomyOn}
                onChange={(e) => onToggleAutonomy && onToggleAutonomy(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              <span className="ml-2.5 text-xs font-semibold text-stone-200">
                Autonomous Agent Allocation:
                <span className={isAutonomyOn ? 'text-amber-400 ml-1 font-bold' : 'text-stone-500 ml-1'}>
                  {isAutonomyOn ? 'ACTIVE (Self-Organizing)' : 'MANUAL INTERVENTION'}
                </span>
              </span>
            </label>
            <span className="text-[11px] text-stone-500 hidden sm:inline">
              (Agents autonomously reallocate labor upon metabolic or environmental stress thresholds)
            </span>
          </div>

          {/* Societal Archetypes */}
          {onApplyPreset && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-stone-400 font-medium mr-1">Archetypes:</span>
              <button
                id="preset-balanced"
                onClick={() => onApplyPreset('balanced')}
                className="px-2.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs transition-colors"
                title="Scenario: Steady-state baseline labor equilibrium"
              >
                ⚖️ Nomadic Baseline
              </button>
              <button
                id="preset-food"
                onClick={() => onApplyPreset('food')}
                className="px-2.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-amber-300 text-xs transition-colors"
                title="Scenario: Focus workforce heavily on calorie acquisition"
              >
                🍞 Caloric Focus
              </button>
              <button
                id="preset-winter"
                onClick={() => onApplyPreset('winter')}
                className="px-2.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-orange-300 text-xs transition-colors"
                title="Scenario: Prioritize firewood harvesting and thermal insulation against frost"
              >
                ❄️ Thermal Buffer
              </button>
              <button
                id="preset-lore"
                onClick={() => onApplyPreset('lore')}
                className="px-2.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-purple-300 text-xs transition-colors"
                title="Scenario: Dedicate senior agents to preserving oral technologies"
              >
                🔬 Epistemic Focus
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLE_DEFINITIONS.map((def) => {
          const count = roleCounts[def.id] || 0;
          const workersInRole = livingPeople.filter((p) => p.role === def.id);

          return (
            <div
              key={def.id}
              className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 rounded-xl p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">{def.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-200">{def.label}</h3>
                      <span className="text-[11px] text-amber-400/90 font-medium">{def.keyResource}</span>
                    </div>
                  </div>

                  {/* Worker Counter and Controls */}
                  <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1 rounded-md border border-stone-800">
                    <button
                      onClick={() => onUpdateRoleDistribution(def.id, -1)}
                      disabled={count <= 0}
                      className="w-5 h-5 flex items-center justify-center rounded bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-30 text-xs font-bold transition-colors"
                      title="Counterfactual adjustment: Reassign 1 adult agent from this discipline"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-amber-300 px-1 text-sm min-w-[20px] text-center">
                      {count}
                    </span>
                    <button
                      onClick={() => onUpdateRoleDistribution(def.id, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-amber-700 hover:bg-amber-600 text-stone-100 text-xs font-bold transition-colors"
                      title="Counterfactual adjustment: Assign 1 adult agent to this discipline"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed mb-3">{def.description}</p>
              </div>

              {/* Worker Avatars Preview */}
              <div className="border-t border-stone-800/80 pt-2.5">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span>Active Cohort ({count} agents)</span>
                  <span>Avg Health: {workersInRole.length > 0 ? Math.round(workersInRole.reduce((a, b) => a + b.health, 0) / workersInRole.length) : 0}%</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {workersInRole.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => onInspectPerson(worker.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-950 hover:bg-amber-950/60 hover:text-amber-300 border border-stone-800 text-stone-300 truncate max-w-[110px] transition-colors"
                      title={`${worker.name} (${worker.age}y, ${Math.round(worker.health)}% HP) - Click to inspect`}
                    >
                      {worker.name.split(' ')[0]}
                    </button>
                  ))}
                  {workersInRole.length === 0 && (
                    <span className="text-[11px] text-stone-600 italic">No clan members assigned</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
