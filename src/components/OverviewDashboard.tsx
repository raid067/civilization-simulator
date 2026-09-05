import React from 'react';
import {
  Users,
  Utensils,
  Droplets,
  Flame,
  Shield,
  AlertTriangle,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CivilizationState, RoleType } from '../types';

interface OverviewDashboardProps {
  state: CivilizationState;
  onUpdatePolicy: (key: keyof CivilizationState['policies'], value: any) => void;
  onInspectPerson: (personId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  state,
  onUpdatePolicy,
  onInspectPerson,
  onNavigateTab,
}) => {
  const livingPeople = state.people.filter((p) => p.alive);
  const totalLiving = livingPeople.length;
  const sickCount = livingPeople.filter((p) => p.diseases.length > 0).length;
  const injuredCount = livingPeople.filter((p) => p.injuries.length > 0).length;

  // Food reserve days calculation
  const totalFoodKg =
    state.resources.meat.quantity +
    state.resources.fish.quantity +
    state.resources.grains.quantity +
    state.resources.fruit.quantity +
    state.resources.plants.quantity;

  const dailyFoodConsumptionKg = Math.round(totalLiving * (state.policies.foodRationing === 'Frugal' ? 1.2 : state.policies.foodRationing === 'Normal' ? 1.8 : 2.4));
  const foodReserveDays = dailyFoodConsumptionKg > 0 ? Math.floor(totalFoodKg / dailyFoodConsumptionKg) : 0;

  // Water reserve days calculation
  const dailyWaterConsumptionL = Math.round(totalLiving * 2.5 * (state.policies.waterConservation ? 0.75 : 1.0));
  const waterReserveDays = dailyWaterConsumptionL > 0 ? Math.floor(state.resources.fresh_water.quantity / dailyWaterConsumptionL) : 0;

  // Shelter capacity
  const shelterCapacity = state.infrastructure.leafHuts * 4 + state.infrastructure.thatchedCabins * 8;
  const unsheltered = Math.max(0, totalLiving - shelterCapacity);

  // Average Morale & Health
  const avgHealth = totalLiving > 0 ? Math.round(livingPeople.reduce((a, b) => a + b.health, 0) / totalLiving) : 0;
  const avgMorale = totalLiving > 0 ? Math.round(livingPeople.reduce((a, b) => a + b.mentalState, 0) / totalLiving) : 0;

  return (
    <div id="overview-dashboard-view" className="space-y-6">
      {/* The Golden Rule Banner (Section 31) */}
      <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/20 border border-amber-800/40 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔥</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Section 31 • The Golden Law of Civilizations
            </h4>
            <p className="text-xs text-stone-300 mt-0.5 leading-relaxed font-serif">
              "Everything has a cost. Food requires labor. Buildings require materials. Cities require water.
              Technology requires knowledge. War destroys resources. Growth creates environmental pressure. Nothing appears from nowhere."
            </p>
          </div>
        </div>
      </div>

      {/* Active Crises & Cascade Alerts (Sections 21 & 22) */}
      {state.crises.length > 0 && (
        <div className="space-y-3">
          {state.crises.map((crisis) => (
            <div
              key={crisis.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                crisis.severity === 'catastrophic'
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : crisis.severity === 'severe'
                  ? 'bg-orange-950/40 border-orange-800/80 text-orange-200'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{crisis.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono bg-black/40 border border-current">
                      {crisis.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">{crisis.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] opacity-80">
                    <span className="font-semibold">Cascade effect:</span>
                    {crisis.cascadeChain.map((step, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span>{step}</span>
                        {i < crisis.cascadeChain.length - 1 && <span>→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('labor')}
                className="px-3 py-1.5 bg-black/50 hover:bg-black/70 text-xs font-semibold rounded-lg border border-current transition-colors shrink-0"
              >
                Reallocate Labor
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Settlement Survival Vitals Grid (Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Population */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Active Cohort
            </span>
            <span className="font-mono text-stone-500">100 base</span>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">{totalLiving}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            {100 - totalLiving > 0 ? `${100 - totalLiving} deceased agents` : 'Full starting cohort'}
          </div>
        </div>

        {/* Food Stockpile & Runway */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-amber-400" /> Caloric Runway
            </span>
            <span className="font-mono text-amber-400">{foodReserveDays}d runway</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">{totalFoodKg.toLocaleString()} kg</div>
          <div className="text-[11px] text-stone-500 mt-1">~{dailyFoodConsumptionKg} kg / day metabolic burn</div>
        </div>

        {/* Fresh Water Reserve */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Hydration Reserve
            </span>
            <span className="font-mono text-cyan-400">{waterReserveDays}d runway</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {state.resources.fresh_water.quantity.toLocaleString()} L
          </div>
          <div className="text-[11px] text-stone-500 mt-1">{state.resources.fresh_water.quality}% purity rating</div>
        </div>

        {/* Firewood & Fuel */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Thermal Fuel
            </span>
            <span className="font-mono text-orange-400">Stockpile</span>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-300">
            {state.resources.fuel.quantity.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Winter metabolic draw 4x</div>
        </div>

        {/* Clan Health */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-red-400" /> Cohort Vitality
            </span>
            <span className="font-mono text-stone-400">{avgHealth}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{avgHealth}%</div>
          <div className="text-[11px] text-stone-500 mt-1">
            {sickCount > 0 ? `${sickCount} infected/injured agents` : 'No active pathogen contagion'}
          </div>
        </div>

        {/* Shelter & Warmth */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Habitat Capacity
            </span>
            <span className="font-mono text-stone-400">Cap: {shelterCapacity}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">
            {state.infrastructure.leafHuts + state.infrastructure.thatchedCabins} units
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {unsheltered > 0 ? `${unsheltered} unsheltered agents` : '100% population housed'}
          </div>
        </div>
      </div>

      {/* Human Decision-Making & Tribal Policies (Section 23) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-amber-400" />
          Societal Survival Policies & Model Parameters (Section 23)
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Model parameters governing metabolic consumption quotas, conservation mandates, and thermal mitigation:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Food Rationing */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
            <label className="block font-semibold text-stone-300 mb-1.5">Food Rationing Quota</label>
            <div className="grid grid-cols-3 gap-1">
              {(['Frugal', 'Normal', 'Generous'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdatePolicy('foodRationing', mode)}
                  className={`py-1 rounded text-xs font-medium transition-colors ${
                    state.policies.foodRationing === mode
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1.5">
              Frugal preserves reserves but causes hunger & morale drops. Generous boosts vitality.
            </p>
          </div>

          {/* Water Conservation */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-stone-300">Water Conservation Protocol</span>
                <input
                  type="checkbox"
                  checked={state.policies.waterConservation}
                  onChange={(e) => onUpdatePolicy('waterConservation', e.target.checked)}
                  className="rounded border-stone-700 text-amber-600 focus:ring-amber-500 w-4 h-4 bg-stone-900"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Reduces daily water consumption by 25%. Vital during prolonged summer droughts.
              </p>
            </div>
            <span
              className={`text-[11px] font-mono mt-2 ${
                state.policies.waterConservation ? 'text-cyan-400' : 'text-stone-500'
              }`}
            >
              Status: {state.policies.waterConservation ? 'Active Conservation' : 'Normal Usage'}
            </span>
          </div>

          {/* Firewood Priority */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
            <label className="block font-semibold text-stone-300 mb-1.5">Winter Fuel Allocation</label>
            <div className="grid grid-cols-3 gap-1">
              {(['Minimum', 'Balanced', 'Maximum Warmth'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdatePolicy('firewoodPriority', mode)}
                  className={`py-1 rounded text-[11px] font-medium transition-colors ${
                    state.policies.firewoodPriority === mode
                      ? 'bg-orange-600 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {mode.split(' ')[0]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1.5">
              Maximum warmth prevents hypothermia in winter blizzards at the cost of high wood consumption.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Clan Roster Peek */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Micro-Agent Cohort Sample (100 Agents)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Select any agent node to inspect the 13 physiological and psychological telemetry variables.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('roster')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Examine Complete Demographic Census →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {state.people.slice(0, 18).map((p) => (
            <button
              key={p.id}
              onClick={() => onInspectPerson(p.id)}
              className={`p-2 rounded-lg border text-left transition-colors flex flex-col justify-between h-16 ${
                !p.alive
                  ? 'bg-stone-950/60 border-stone-800/60 text-stone-500 opacity-60'
                  : p.health < 40 || p.hunger > 60
                  ? 'bg-red-950/30 border-red-800/80 hover:border-red-600 text-red-200'
                  : 'bg-stone-950 border-stone-800 hover:border-amber-600/80 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-xs truncate max-w-[80px]">{p.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">{p.age}y</span>
              </div>
              <div className="flex items-center justify-between text-[10px] w-full text-stone-400">
                <span className="capitalize truncate max-w-[65px]">{p.role.split('_')[0]}</span>
                {p.alive ? (
                  <span className={`font-mono ${p.health >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.round(p.health)}%
                  </span>
                ) : (
                  <span className="text-red-400">Dead</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
