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
  onInspectPerson: (personId: string) => void;
  onUpdateRoleDistribution?: (targetRole: RoleType, delta: number) => void;
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
    description: 'Prepare willow bark extracts, poultices, and dried feverfew to treat infection and sickness.',
    keyResource: 'Health & Recovery',
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
    label: 'Wilderness Scouts',
    icon: <Compass className="w-4 h-4 text-indigo-400" />,
    description: 'Explore unmapped territorial biomes, uncover flint deposits, and watch for predator packs.',
    keyResource: 'Geographic Knowledge',
    requiresAdult: true,
  },
  {
    id: 'elder_lorekeeper',
    label: 'Elder Lorekeepers',
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    description: 'Safeguard oral survival knowledge around the sacred fire. Prevent civilizational tech loss.',
    keyResource: 'Generational Knowledge',
    requiresAdult: true,
  },
];

export const LaborManager: React.FC<LaborManagerProps> = ({
  state,
  onInspectPerson,
}) => {
  const livingPeople = state.people.filter((p) => p.alive);
  const adults = livingPeople.filter((p) => p.age >= 10);
  const children = livingPeople.filter((p) => p.age < 10);

  // Group living people by role
  const roleCounts: Record<string, number> = {};
  livingPeople.forEach((p) => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  });

  const getRoleRationale = (roleId: RoleType): string => {
    switch (roleId) {
      case 'forager':
        return `Meadow and riparian margin foraging scaled for ${state.season} vegetation yields.`;
      case 'hunter':
        return `Game tracking active across forest borders to secure animal protein and hides.`;
      case 'fisherman':
        return `Exploiting Red River aquatic biome; vital seasonal fish protein.`;
      case 'farmer':
        return state.technologies.some((t) => t.id === 'tech-agri' && t.discovered)
          ? 'Intensive cereal crop cultivation on river terrace loam.'
          : 'Experimental horticulture pending agricultural mastery.';
      case 'water_fetcher':
        return `Ensuring continuous camp hydration (Water reserve: ${Math.round(state.resources.fresh_water.quantity)}L).`;
      case 'lumberjack':
        return `Harvesting firewood buffer and timber for infrastructure.`;
      case 'builder':
        return `Maintaining dwellings and erecting civic infrastructure.`;
      case 'herbalist':
        return `Providing medical triage and botanical remedies for the sick.`;
      case 'scout':
        return `Perimeter border vigilance and predator deterrence.`;
      case 'elder_lorekeeper':
        return `Senior elders transmitting generational technology around the communal hearth.`;
      default:
        return 'Engaged in camp maintenance and communal chores.';
    }
  };

  return (
    <div id="labor-manager-view" className="space-y-6">
      {/* Header section */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Autonomous Division of Labor & Societal Workforce
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              The civilization self-organizes without manual micromanagement. Workers are autonomously deployed to tasks
              based on marginal caloric returns, water runways, winter frost proximity, and individual craft proficiencies.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 text-xs">
            <div>
              <div className="text-stone-400">Active Workforce</div>
              <div className="font-mono font-bold text-emerald-400 text-base">{adults.length} adult agents</div>
            </div>
            <div className="border-l border-stone-800 pl-3">
              <div className="text-stone-400">Dependent Children</div>
              <div className="font-mono font-bold text-stone-300 text-base">{children.length}</div>
            </div>
          </div>
        </div>

        {/* Autonomy Status Banner */}
        <div className="mt-4 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-stone-200">
              Autonomous Dynamic Labor Planner:
              <span className="text-emerald-400 ml-1.5 font-bold">100% SELF-GOVERNING</span>
            </span>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center gap-2">
            <span>Doctrine:</span>
            <span className="px-2 py-0.5 rounded bg-stone-950 text-amber-300 border border-stone-800 font-medium">
              {state.nationalFocus === 'food_security'
                ? 'Caloric Abundance'
                : state.nationalFocus === 'defense'
                ? 'Defensive Vigilance'
                : state.nationalFocus === 'technology'
                ? 'Science & Lore'
                : state.nationalFocus === 'expansion'
                ? 'Urban Growth'
                : state.nationalFocus === 'ecological'
                ? 'Ecological Harmony'
                : 'Autonomous Equilibrium'}
            </span>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLE_DEFINITIONS.map((def) => {
          const count = roleCounts[def.id] || 0;
          const workersInRole = livingPeople.filter((p) => p.role === def.id);
          const pct = Math.round((count / Math.max(1, adults.length)) * 100);

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

                  {/* Observational Allocation Badge */}
                  <div className="flex items-center gap-1.5 bg-stone-950 px-2.5 py-1 rounded-md border border-stone-800 text-right">
                    <div>
                      <span className="font-mono font-bold text-amber-300 text-sm">{count}</span>
                      <span className="text-[10px] text-stone-400 ml-1">({pct}%)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed mb-2">{def.description}</p>

                {/* Autonomous Rationale */}
                <div className="bg-stone-950/70 p-2 rounded border border-stone-800/80 text-[11px] text-stone-300 mb-3">
                  <span className="text-amber-400/90 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                    Council Deployment Logic:
                  </span>
                  <span>{getRoleRationale(def.id)}</span>
                </div>
              </div>

              {/* Worker Avatars Preview */}
              <div className="border-t border-stone-800/80 pt-2.5">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span>Assigned Clan Cohort ({count})</span>
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
