import React, { useState } from 'react';
import {
  Boxes,
  RefreshCw,
  AlertOctagon,
  ArrowUpRight,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { CivilizationState, ResourceId, ResourceState } from '../types';

interface ResourcesViewProps {
  state: CivilizationState;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ state }) => {
  const [filter, setFilter] = useState<'all' | 'renewable' | 'non_renewable'>('all');

  const resourceList = (Object.values(state.resources) as ResourceState[]).filter((r: ResourceState) => {
    if (filter === 'all') return true;
    return r.category === filter;
  });

  const getQualityBadge = (quality: number) => {
    if (quality >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (quality >= 50) return 'text-amber-400 bg-amber-950/60 border-amber-800';
    return 'text-red-400 bg-red-950/60 border-red-800';
  };

  return (
    <div id="resources-matrix-view" className="space-y-6">
      {/* Header with filter controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              Resource Matrix & Stockpiles (Sections 2 & 3)
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Track finite vs renewable resources across the biosphere. Overharvesting depletes natural reserves,
              while food and water without proper pottery or smoking suffer seasonal spoilage.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filter === 'all' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All 16 Resources
            </button>
            <button
              onClick={() => setFilter('renewable')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filter === 'renewable' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Renewable
            </button>
            <button
              onClick={() => setFilter('non_renewable')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filter === 'non_renewable' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Non-Renewable
            </button>
          </div>
        </div>
      </div>

      {/* Storage and Spoilage Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-stone-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Granaries & Storage Shelter
          </div>
          <div className="font-mono text-xl font-bold text-stone-100">
            {state.infrastructure.granaryBins * 1500 + 2000} kg capacity
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Protects grains and dried rations against moisture and vermin.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-stone-400 font-semibold mb-1">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            Active Food Spoilage
          </div>
          <div className="font-mono text-xl font-bold text-amber-300">
            {state.technologies.find((t) => t.id === 'tech-smoking')?.discovered ? '8% / season' : '35% / season'}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {state.technologies.find((t) => t.id === 'tech-smoking')?.discovered
              ? 'Smokehouse preserves fish and meat.'
              : 'Uncured meat and fish rot rapidly without smoking racks.'}
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-stone-400 font-semibold mb-1">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            Water Reserve
          </div>
          <div className="font-mono text-xl font-bold text-cyan-300">
            {state.resources.fresh_water.quantity.toLocaleString()} L
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Quality: {state.resources.fresh_water.quality}% • Demand: ~{state.people.filter((p) => p.alive).length * 225} L/season
          </p>
        </div>
      </div>

      {/* Resource Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourceList.map((res) => {
          const isDepleted = res.quantity <= 5;
          const currentSeasonMult = res.seasonality[state.season];

          return (
            <div
              key={res.id}
              className={`bg-stone-900/90 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                isDepleted ? 'border-red-800/80 bg-red-950/20' : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200">{res.name}</h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider ${
                        res.category === 'renewable'
                          ? 'text-emerald-400 bg-emerald-950/80'
                          : 'text-stone-400 bg-stone-800'
                      }`}
                    >
                      {res.category.replace('_', ' ')}
                    </span>
                  </div>

                  <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getQualityBadge(res.quality)}`}>
                    {res.quality}% QL
                  </span>
                </div>

                {/* Stockpile Quantity */}
                <div className="my-3">
                  <div className="text-stone-400 text-xs">Camp Stockpile</div>
                  <div className="text-2xl font-bold font-mono text-amber-200">
                    {res.quantity.toLocaleString()}
                    <span className="text-xs font-normal text-stone-400 ml-1.5">{res.unit}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-stone-400 border-t border-stone-800 pt-2.5">
                  <div className="flex justify-between">
                    <span>Nature Reserve:</span>
                    <span className="font-mono text-stone-200">{res.worldReserve.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regen Rate:</span>
                    <span className="font-mono text-stone-200">
                      {res.regenerationRatePerYear > 0 ? `+${res.regenerationRatePerYear}/yr` : 'None (Finite)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="text-stone-300 truncate max-w-[120px]">{res.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Season Multiplier:</span>
                    <span className="font-mono text-stone-200">{currentSeasonMult}x</span>
                  </div>
                </div>
              </div>

              {res.spoilageRatePerSeason > 0 && (
                <div className="mt-3 pt-2 border-t border-stone-800/80 text-[11px] text-amber-400/80 flex items-center justify-between">
                  <span>Spoilage Rate:</span>
                  <span className="font-mono font-medium">{Math.round(res.spoilageRatePerSeason * 100)}% / season</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
