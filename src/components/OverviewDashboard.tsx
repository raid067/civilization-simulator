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
  Sparkles,
  Crown,
  Compass,
  Home,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { CivilizationState } from '../types';
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

  // Food reserve days calculation
  const totalFoodKg =
    (state.resources.meat?.quantity || 0) +
    (state.resources.fish?.quantity || 0) +
    (state.resources.grains?.quantity || 0) +
    (state.resources.fruit?.quantity || 0) +
    (state.resources.plants?.quantity || 0);

  const dailyFoodConsumptionKg = Math.round(
    totalLiving * (state.policies.foodRationing === 'Frugal' ? 1.0 : state.policies.foodRationing === 'Normal' ? 1.5 : 2.0)
  );
  const foodReserveDays = dailyFoodConsumptionKg > 0 ? Math.floor(totalFoodKg / dailyFoodConsumptionKg) : 0;

  // Water reserve days calculation
  const totalWaterL = state.resources.fresh_water?.quantity || 0;
  const dailyWaterConsumptionL = Math.round(totalLiving * 2.0 * (state.policies.waterConservation ? 0.75 : 1.0));
  const waterReserveDays = dailyWaterConsumptionL > 0 ? Math.floor(totalWaterL / dailyWaterConsumptionL) : 0;

  // Shelter capacity
  const shelterCapacity = (state.infrastructure.leafHuts || 0) * 4 + (state.infrastructure.thatchedCabins || 0) * 8;
  const unsheltered = Math.max(0, totalLiving - shelterCapacity);
  const spareBeds = Math.max(0, shelterCapacity - totalLiving);

  // Average Morale & Health
  const avgHealth = totalLiving > 0 ? Math.round(livingPeople.reduce((a, b) => a + b.health, 0) / totalLiving) : 0;
  const avgMorale = totalLiving > 0 ? Math.round(livingPeople.reduce((a, b) => a + b.mentalState, 0) / totalLiving) : 0;

  // Demographic age cohorts
  const infants = livingPeople.filter((p) => p.age <= 2).length;
  const children = livingPeople.filter((p) => p.age >= 3 && p.age <= 9).length;
  const adolescents = livingPeople.filter((p) => p.age >= 10 && p.age <= 15).length;
  const primeAdults = livingPeople.filter((p) => p.age >= 16 && p.age <= 49).length;
  const elders = livingPeople.filter((p) => p.age >= 50).length;
  const kinshipPairs = livingPeople.filter((p) => p.gender === 'female' && p.relationships?.partnerId).length;

  // Annual Demographic Growth calculation
  const recentBirths = state.annualBirths > 0 ? state.annualBirths : (state.lastYearBirths || 0);
  const recentDeaths = state.annualDeaths > 0 ? state.annualDeaths : (state.lastYearDeaths || 0);
  const recentMigrants = state.annualImmigration || state.lastYearImmigration || 0;
  const netGrowth = recentBirths + recentMigrants - recentDeaths;
  const growthRatePct = totalLiving > 0 ? ((netGrowth / Math.max(1, totalLiving - netGrowth)) * 100).toFixed(1) : '0.0';

  // Settlement Evolution Tiers & Milestone calculation
  const tiers = [
    { name: 'Nomadic Camp', min: 0, max: 59, icon: '🏕️', gov: 'Tribal Council' },
    { name: 'Settled Hamlet', min: 60, max: 119, icon: '🌾', gov: 'Tribal Council' },
    { name: 'Large Village', min: 120, max: 199, icon: '🏡', gov: 'Chiefdom' },
    { name: 'Regional Township', min: 200, max: 349, icon: '🏰', gov: 'Chiefdom' },
    { name: 'Fortified City', min: 350, max: 999, icon: '🏛️', gov: 'Kingdom' },
    { name: 'Imperial Metropolis', min: 1000, max: 99999, icon: '👑', gov: 'Empire' },
  ];

  const currentTierIndex = tiers.findIndex((t) => totalLiving >= t.min && totalLiving <= t.max);
  const currentTier = tiers[currentTierIndex] || tiers[0];
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  const tierProgress = nextTier
    ? Math.min(100, Math.round(((totalLiving - currentTier.min) / (nextTier.min - currentTier.min)) * 100))
    : 100;

  const leader = state.leader;

  return (
    <div id="overview-dashboard-view" className="space-y-6">
      {/* 1. Top Evolution Milestone & Demographic Growth Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900/90 to-amber-950/30 border border-amber-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Current Tier & Progress */}
          <div className="space-y-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentTier.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-100">{currentTier.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
                    Tier {currentTierIndex + 1} • {currentTier.gov}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Autonomous settlement self-organization along the fertile riverbanks.
                </p>
              </div>
            </div>

            {/* Progress bar towards next epoch */}
            {nextTier && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium flex items-center gap-1">
                    Progress toward <span className="text-amber-300 font-bold">{nextTier.name}</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {totalLiving} / {nextTier.min} citizens ({tierProgress}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Demographic Velocity Indicator */}
          <div className="flex items-center gap-3 bg-stone-950/80 border border-stone-800/80 rounded-xl p-3.5 shadow-inner">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                netGrowth >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {netGrowth >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Annual Demographic Velocity
              </div>
              <div className="text-lg font-bold font-mono text-stone-100 flex items-center gap-2">
                <span className={netGrowth >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                  {netGrowth >= 0 ? `+${netGrowth}` : netGrowth} citizens
                </span>
                <span className="text-xs font-normal text-stone-400 font-sans">
                  ({netGrowth >= 0 ? `+${growthRatePct}` : growthRatePct}% / yr)
                </span>
              </div>
              <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                <span className="text-emerald-400">+{recentBirths} births</span>
                <span>•</span>
                <span className="text-cyan-400">+{recentMigrants} migrants</span>
                <span>•</span>
                <span className="text-stone-500">-{recentDeaths} deaths</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Autonomous Deliberations & Live Decision Feed */}
        <div className="lg:col-span-7 space-y-6">
          <AutonomousFeed
            decisions={state.autonomousDecisions || []}
            currentYear={state.year}
            currentSeason={state.season}
            maxDisplay={20}
          />

          {/* Active Crises if any */}
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
                        <span className="font-semibold">Cascade chain:</span>
                        {crisis.cascadeChain.map((step, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span>{step}</span>
                            {i < crisis.cascadeChain.length - 1 && <span>→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Columns: Governance, Stockpile Radar & Demographics */}
        <div className="lg:col-span-5 space-y-5">
          {/* Leader Card */}
          {leader && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                    Executive Governance & Chieftain
                  </h3>
                </div>
                <button
                  onClick={() => onInspectPerson(leader.id)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  Inspect Leader <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                  👑
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-100 text-sm">{leader.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 border border-stone-800 font-mono">
                      {leader.personality}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {leader.title} • In power since Year {leader.reignStartYear} ({Math.max(1, state.year - leader.reignStartYear)} solar cycles)
                  </div>
                </div>
              </div>

              {/* Leader stats bars */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60 text-center">
                  <div className="text-[10px] text-stone-400">Wisdom</div>
                  <div className="font-mono font-bold text-amber-300 text-xs">{leader.wisdom}/100</div>
                </div>
                <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60 text-center">
                  <div className="text-[10px] text-stone-400">Charisma</div>
                  <div className="font-mono font-bold text-purple-300 text-xs">{leader.charisma}/100</div>
                </div>
                <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60 text-center">
                  <div className="text-[10px] text-stone-400">Decisiveness</div>
                  <div className="font-mono font-bold text-cyan-300 text-xs">{leader.aggressiveness}/100</div>
                </div>
              </div>
            </div>
          )}

          {/* Survival Runways & Ecological Stockpiles */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
              <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Ecological Stockpiles & Runways
              </h3>
              <button
                onClick={() => onNavigateTab('resources')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                Stockpiles →
              </button>
            </div>

            {/* Food Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" /> Food Reserve
                </span>
                <span className="font-mono text-stone-200 font-semibold">
                  {(totalFoodKg / 1000).toFixed(1)}k kg • <span className="text-amber-400">{foodReserveDays}d runway</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((foodReserveDays / 120) * 100))}%` }}
                ></div>
              </div>
            </div>

            {/* Water Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Fresh Water
                </span>
                <span className="font-mono text-stone-200 font-semibold">
                  {(totalWaterL / 1000).toFixed(1)}k L • <span className="text-cyan-400">{waterReserveDays}d runway</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((waterReserveDays / 90) * 100))}%` }}
                ></div>
              </div>
            </div>

            {/* Shelter Occupancy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-orange-400" /> Shelter Capacity
                </span>
                <span className="font-mono text-stone-200 font-semibold">
                  {totalLiving} / {shelterCapacity} beds •{' '}
                  <span className={unsheltered > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {unsheltered > 0 ? `${unsheltered} unsheltered` : `${spareBeds} open`}
                  </span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${unsheltered > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, Math.round((totalLiving / Math.max(1, shelterCapacity)) * 100))}%` }}
                ></div>
              </div>
            </div>

            {/* Hearth Warmth & Fuel */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Hearth Firewood
                </span>
                <span className="font-mono text-stone-200 font-semibold">
                  {state.resources.fuel?.quantity || 0} fuel units
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((state.resources.fuel?.quantity || 0) / 1000) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Demographic Composition Breakdown */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
              <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Demographic Census Structure
              </h3>
              <button
                onClick={() => onNavigateTab('roster')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                Roster ({totalLiving}) →
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60">
                <div className="text-[10px] text-stone-400">Infants</div>
                <div className="font-mono font-bold text-amber-300 text-sm">{infants}</div>
                <div className="text-[9px] text-stone-500">0-2y</div>
              </div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60">
                <div className="text-[10px] text-stone-400">Children</div>
                <div className="font-mono font-bold text-amber-300 text-sm">{children}</div>
                <div className="text-[9px] text-stone-500">3-9y</div>
              </div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60">
                <div className="text-[10px] text-stone-400">Teens</div>
                <div className="font-mono font-bold text-cyan-300 text-sm">{adolescents}</div>
                <div className="text-[9px] text-stone-500">10-15y</div>
              </div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60">
                <div className="text-[10px] text-stone-400">Adults</div>
                <div className="font-mono font-bold text-emerald-300 text-sm">{primeAdults}</div>
                <div className="text-[9px] text-stone-500">16-49y</div>
              </div>
              <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/60">
                <div className="text-[10px] text-stone-400">Elders</div>
                <div className="font-mono font-bold text-purple-300 text-sm">{elders}</div>
                <div className="text-[9px] text-stone-500">50y+</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span>Kinship Pairings: <strong className="text-stone-200">{kinshipPairs} couples</strong></span>
              <span>Vitality: <strong className="text-emerald-400">{avgHealth}%</strong></span>
              <span>Morale: <strong className="text-amber-300">{avgMorale}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
