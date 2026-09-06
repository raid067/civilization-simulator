import React from 'react';
import {
  Users,
  Home,
  Utensils,
  Droplets,
  Flame,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Compass,
  Crown,
} from 'lucide-react';
import { CivilizationState, ThreatLevel } from '../types';

interface GlobalVitalsHUDProps {
  state: CivilizationState;
  onOpenLedger: () => void;
  onOpenRoster: () => void;
}

export const GlobalVitalsHUD: React.FC<GlobalVitalsHUDProps> = ({
  state,
  onOpenLedger,
  onOpenRoster,
}) => {
  const livingPeople = state.people.filter((p) => p.alive);
  const livingCount = livingPeople.length;

  // Food totals & runway
  const totalFoodKg =
    (state.resources.fruit?.quantity || 0) +
    (state.resources.meat?.quantity || 0) +
    (state.resources.fish?.quantity || 0) +
    (state.resources.grains?.quantity || 0) +
    (state.resources.plants?.quantity || 0);

  const dailyFoodConsumptionKg = Math.round(
    livingCount * (state.policies.foodRationing === 'Frugal' ? 1.0 : state.policies.foodRationing === 'Normal' ? 1.5 : 2.0)
  );
  const foodRunwayDays = dailyFoodConsumptionKg > 0 ? Math.floor(totalFoodKg / dailyFoodConsumptionKg) : 0;

  // Water totals & runway
  const totalWaterL = state.resources.fresh_water?.quantity || 0;
  const dailyWaterL = Math.round(livingCount * 2.0 * (state.policies.waterConservation ? 0.75 : 1.0));
  const waterRunwayDays = dailyWaterL > 0 ? Math.floor(totalWaterL / dailyWaterL) : 0;

  // Shelter capacity
  const shelterCapacity = (state.infrastructure.leafHuts || 0) * 4 + (state.infrastructure.thatchedCabins || 0) * 8;
  const shelterOpenBeds = Math.max(0, shelterCapacity - livingCount);
  const shelterDeficit = Math.max(0, livingCount - shelterCapacity);

  // Fuel units
  const fuelUnits = state.resources.fuel?.quantity || 0;

  // Net population growth calculation
  const recentBirths = state.annualBirths > 0 ? state.annualBirths : (state.lastYearBirths || 0);
  const recentDeaths = state.annualDeaths > 0 ? state.annualDeaths : (state.lastYearDeaths || 0);
  const recentMigrants = state.annualImmigration || state.lastYearImmigration || 0;
  const netGrowth = recentBirths + recentMigrants - recentDeaths;
  const isGrowing = netGrowth >= 0;

  // Threat level
  const lastReport = state.annualReports.length > 0 ? state.annualReports[state.annualReports.length - 1] : null;
  const threat: ThreatLevel = lastReport ? lastReport.threatLevel : 'Safe';

  const getThreatBadge = (level: ThreatLevel) => {
    switch (level) {
      case 'Safe':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Concern':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Crisis':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse';
      case 'Catastrophic':
        return 'bg-red-500/25 text-red-300 border-red-500/50 animate-pulse';
    }
  };

  return (
    <div className="bg-stone-950/90 backdrop-blur-md border-b border-amber-950/40 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Left: Key Survival Vitals */}
        <div className="flex items-center gap-4 divide-x divide-stone-800">
          {/* Population Vitals */}
          <button
            onClick={onOpenRoster}
            className="flex items-center gap-2 group hover:bg-stone-900/60 px-2 py-1 rounded-lg transition-colors cursor-pointer text-left"
            title="Click to view full demographic census"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-100 text-sm font-mono">{livingCount}</span>
                <span className="text-[10px] text-stone-400 font-sans">Citizens</span>
                <span
                  className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    isGrowing
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {isGrowing ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                  {netGrowth >= 0 ? `+${netGrowth}` : netGrowth}/yr
                </span>
              </div>
              <div className="text-[10px] text-stone-500">
                {recentBirths} births • {recentMigrants} migrants • {recentDeaths} deaths
              </div>
            </div>
          </button>

          {/* Shelters & Housing */}
          <div className="pl-4 flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                shelterDeficit > 0
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-200 text-sm font-mono">
                  {livingCount} / {shelterCapacity}
                </span>
                <span className="text-[10px] text-stone-400">Housing</span>
              </div>
              <div className="text-[10px]">
                {shelterDeficit > 0 ? (
                  <span className="text-rose-400 font-semibold">{shelterDeficit} unsheltered!</span>
                ) : (
                  <span className="text-emerald-400">{shelterOpenBeds} spare berths</span>
                )}
              </div>
            </div>
          </div>

          {/* Food Stockpiles & Runway */}
          <div className="pl-4 flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                foodRunwayDays < 35
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse'
                  : foodRunwayDays < 60
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-200 text-sm font-mono">
                  {(totalFoodKg / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-stone-400">kg</span>
                </span>
                <span className="text-[10px] text-stone-400">Food</span>
              </div>
              <div className="text-[10px]">
                <span
                  className={`font-semibold ${
                    foodRunwayDays < 35 ? 'text-rose-400' : foodRunwayDays < 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {foodRunwayDays}d runway
                </span>
              </div>
            </div>
          </div>

          {/* Water Stockpiles & Cisterns */}
          <div className="pl-4 flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                waterRunwayDays < 30
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-200 text-sm font-mono">
                  {(totalWaterL / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-stone-400">L</span>
                </span>
                <span className="text-[10px] text-stone-400">Water</span>
              </div>
              <div className="text-[10px] text-cyan-300 font-semibold">{waterRunwayDays}d runway</div>
            </div>
          </div>

          {/* Fuel & Firewood */}
          <div className="pl-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-200 text-sm font-mono">{fuelUnits}</span>
                <span className="text-[10px] text-stone-400">Fuel</span>
              </div>
              <div className="text-[10px] text-stone-400">Hearth burns</div>
            </div>
          </div>
        </div>

        {/* Right: National Guidance & State Health */}
        <div className="flex items-center gap-3">
          {/* Threat Indicator */}
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${getThreatBadge(threat)}`}>
            <Shield className="w-3 h-3" />
            <span>Threat: {threat}</span>
          </div>

          {/* Active Leader Doctrine */}
          {state.leader && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-amber-800/40 text-[11px] text-amber-200">
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="font-semibold text-stone-300">{state.leader.title}:</span>
              <span className="text-amber-300 font-medium">{state.leader.personality}</span>
            </div>
          )}

          {/* National Guidance Focus Tag */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
            <Compass className="w-3 h-3 text-amber-400" />
            <span className="capitalize">{state.nationalFocus?.replace('_', ' ') || 'Balanced'} Focus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
