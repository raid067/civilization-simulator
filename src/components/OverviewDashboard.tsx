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
  Crown,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { CivilizationState, RoleType } from '../types';
import { AutonomousFeed } from './AutonomousFeed';

interface OverviewDashboardProps {
  state: CivilizationState;
  onInspectPerson: (personId: string) => void;
  onNavigateTab: (tab: string) => void;
  onUpdatePolicy?: (key: keyof CivilizationState['policies'], value: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  state,
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
  const shelterCapacity = (state.infrastructure.leafHuts || 0) * 4 + (state.infrastructure.thatchedCabins || 0) * 8;
  const unsheltered = Math.max(0, totalLiving - shelterCapacity);

  // Average Morale & Health
  const avgHealth = totalLiving > 0 ? Math.round(livingPeople.reduce((a, b) => a + b.health, 0) / totalLiving) : 0;
  const avgMorale = totalLiving > 0 ? Math.round(livingPeople.reduce((a, b) => a + b.mentalState, 0) / totalLiving) : 0;

  const leader = state.leader;

  return (
    <div id="overview-dashboard-view" className="space-y-6">
      {/* Governance Leadership & Doctrine Banner */}
      {leader && (
        <div className="bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-950 border border-amber-800/50 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {leader.title} {leader.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-950 text-amber-200 border border-stone-800 font-mono">
                  {leader.personality}
                </span>
                <span className="text-[10px] text-stone-400">
                  Reign: Year {leader.reignStartYear}–{state.year} ({Math.max(1, state.year - leader.reignStartYear)}y)
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Executive doctrine: Wisdom {leader.wisdom}/100 • Charisma {leader.charisma}/100 • Decisiveness {leader.aggressiveness}/100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => onInspectPerson(leader.id)}
              className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-amber-300 font-semibold rounded-lg border border-stone-800 transition-colors"
            >
              Inspect Chieftain →
            </button>
          </div>
        </div>
      )}

      {/* Live Autonomous Decisions & Council Deliberation Feed */}
      <AutonomousFeed
        decisions={state.autonomousDecisions || []}
        currentYear={state.year}
        currentSeason={state.season}
        maxDisplay={15}
      />

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

              <div className="text-[11px] text-amber-300 font-mono italic">
                Council autonomy actively managing mitigation...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settlement Survival Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Population */}
        <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Active Cohort
            </span>
            <span className="font-mono text-stone-500">Living</span>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">{totalLiving}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            {state.people.length - totalLiving > 0 ? `${state.people.length - totalLiving} ancestors recorded` : 'Full starting cohort'}
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
            {sickCount > 0 ? `${sickCount} infected/injured agents` : 'No active contagion'}
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
            {(state.infrastructure.leafHuts || 0) + (state.infrastructure.thatchedCabins || 0)} dwellings
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {unsheltered > 0 ? `${unsheltered} unsheltered agents` : '100% population sheltered'}
          </div>
        </div>
      </div>

      {/* Autonomous Policies & Model Parameters (Observational) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2 mb-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Autonomous Societal Policies & Survival Mandates
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          The civilization automatically enacts survival decrees based on real-time ecological conditions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Food Rationing */}
          <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-1.5">
            <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">
              Caloric Rationing Mandate
            </span>
            <div className="text-base font-bold font-mono text-amber-300">
              {state.policies.foodRationing} Consumption
            </div>
            <p className="text-[10px] text-stone-400">
              {state.policies.foodRationing === 'Frugal'
                ? 'Emergency austerity (-20% food intake) active to preserve dwindling stockpiles.'
                : state.policies.foodRationing === 'Generous'
                ? 'Harvest feasting (+25% food intake) active; morale and reproduction elevated.'
                : 'Balanced baseline per-capita caloric distribution active.'}
            </p>
          </div>

          {/* Water Conservation */}
          <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-1.5">
            <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">
              Water Conservation Protocol
            </span>
            <div className="text-base font-bold font-mono text-cyan-300">
              {state.policies.waterConservation ? 'Active Conservation Mandate' : 'Unrestricted Access'}
            </div>
            <p className="text-[10px] text-stone-400">
              {state.policies.waterConservation
                ? 'Water drawing capped at 75% per capita due to drought conditions or low reserves.'
                : 'Normal spring and river hydration access allowed across all clan quarters.'}
            </p>
          </div>

          {/* Firewood Priority */}
          <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-1.5">
            <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">
              Communal Hearth Protocol
            </span>
            <div className="text-base font-bold font-mono text-orange-300">
              {state.policies.firewoodPriority}
            </div>
            <p className="text-[10px] text-stone-400">
              {state.policies.firewoodPriority === 'Maximum Warmth'
                ? 'Hearth fires stoked with maximum fuel to protect against sub-zero frostbite.'
                : 'Balanced wood burning maintaining stable communal warmth without wasting timber.'}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Generational Demographics & Civilization Epoch */}
      {(() => {
        const living = state.people.filter((p) => p.alive);
        const children = living.filter((p) => p.age <= 15).length;
        const primeAdults = living.filter((p) => p.age >= 16 && p.age <= 49).length;
        const elders = living.filter((p) => p.age >= 50).length;
        const total = Math.max(1, living.length);

        const coupledPairs = Math.floor(
          living.filter((p) => p.relationships?.partnerId && living.some((m) => m.id === p.relationships?.partnerId && m.alive)).length / 2
        );

        let settlementTier = 'Surviving Band Encampment';
        if (living.length >= 300) settlementTier = 'Thriving Ancient Township';
        else if (living.length >= 200) settlementTier = 'Permanent River Village';
        else if (living.length >= 120) settlementTier = 'Settled Tribal Hamlet';
        else if (living.length >= 60) settlementTier = 'River Terrace Clan Camp';

        return (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Demographic Pyramid & Societal Epoch
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Long-term population structure, generational replacement, and settlement evolutionary phase.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 font-medium">
                  {settlementTier}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-950 text-stone-400 border border-stone-800 font-mono">
                  Solar Cycle: Year {state.year}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Age Pyramid Distribution */}
              <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-2">
                <div className="font-semibold text-stone-300">Generational Age Structure</div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-cyan-300">
                    <span>Children (0–15y):</span>
                    <span>{children} ({Math.round((children / total) * 100)}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-300">
                    <span>Adults (16–49y):</span>
                    <span>{primeAdults} ({Math.round((primeAdults / total) * 100)}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-300">
                    <span>Elders (50+y):</span>
                    <span>{elders} ({Math.round((elders / total) * 100)}%)</span>
                  </div>
                </div>
              </div>

              {/* Kinship Networks */}
              <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-2">
                <div className="font-semibold text-stone-300">Kinship & Genetic Lineage</div>
                <div className="space-y-1.5 font-mono text-[11px] text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Coupled Pairs:</span>
                    <span className="text-amber-200 font-bold">{coupledPairs} families</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total Historical Births:</span>
                    <span className="text-purple-300 font-bold">{Math.max(0, state.people.length - 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Oral Technologies:</span>
                    <span className="text-emerald-300 font-bold">
                      {state.technologies.filter((t) => t.discovered).length} / {state.technologies.length} known
                    </span>
                  </div>
                </div>
              </div>

              {/* Environmental Carrying Capacity */}
              <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-2">
                <div className="font-semibold text-stone-300">Carrying Capacity & Health</div>
                <div className="space-y-1.5 font-mono text-[11px] text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Current Cohort:</span>
                    <span className="text-stone-100 font-bold">{living.length} agents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Habitat Capacity:</span>
                    <span className="text-stone-300">{shelterCapacity} sheltered</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Active Illness:</span>
                    <span className={sickCount > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {sickCount} cases
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
