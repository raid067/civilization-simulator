import React from 'react';
import {
  Map,
  Compass,
  Mountain,
  TreePine,
  Waves,
  Wheat,
  ShieldAlert,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { CivilizationState, RegionZone } from '../types';

interface GeographyMapProps {
  state: CivilizationState;
  onDispatchScouts?: () => void;
}

export const GeographyMap: React.FC<GeographyMapProps> = ({ state, onDispatchScouts }) => {
  const scoutsCount = state.people.filter((p) => p.alive && p.role === 'scout').length;

  const getTerrainIcon = (type: RegionZone['terrainType']) => {
    switch (type) {
      case 'River Valley':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'Deep Forest':
        return <TreePine className="w-5 h-5 text-emerald-400" />;
      case 'Mountain Ridge':
        return <Mountain className="w-5 h-5 text-stone-400" />;
      case 'Plains':
        return <Wheat className="w-5 h-5 text-amber-400" />;
      case 'Coastline':
        return <Waves className="w-5 h-5 text-blue-400" />;
      default:
        return <Map className="w-5 h-5 text-stone-400" />;
    }
  };

  return (
    <div id="geography-map-view" className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-400" />
              World Geography & Uneven Resource Distribution (Section 4)
            </h2>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Resources are not evenly spread across the world. Mountains yield flint and native ores, forests yield game
              and timber, the river provides freshwater and clay, and the distant coast holds crucial salt for preserving meat.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 text-xs">
            <Compass className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-stone-400">Active Scouts Ranging</div>
              <div className="font-mono font-bold text-amber-300">{scoutsCount} clan scouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Region Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.regions.map((region) => {
          return (
            <div
              key={region.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                region.explored
                  ? 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                  : 'bg-stone-950/60 border-stone-900 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                      {getTerrainIcon(region.terrainType)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                        {region.name}
                        {region.distanceKm === 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            Home Encampment
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-stone-400">{region.terrainType} • {region.distanceKm} km away</span>
                    </div>
                  </div>

                  {region.explored ? (
                    <span className="text-xs flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Explored
                    </span>
                  ) : (
                    <span className="text-xs flex items-center gap-1 text-amber-400/80 font-medium">
                      <Eye className="w-3.5 h-3.5" /> Uncharted
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-400 leading-relaxed mb-4">{region.description}</p>

                {/* Primary Resource Tags */}
                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    Abundant Regional Wealth
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {region.primaryResources.map((res, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-stone-950 text-amber-200 border border-stone-800"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danger & Travel Logistics */}
              <div className="border-t border-stone-800 pt-3 text-xs text-stone-400 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Beast & Environmental Hazard:
                  </span>
                  <span className="font-mono text-stone-200">{region.dangerLevel}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Accessibility:</span>
                  <span className="font-mono text-stone-200">{region.accessibility}%</span>
                </div>
                {!region.explored && (
                  <div className="mt-2 text-[11px] text-amber-400/90 italic bg-amber-950/20 p-2 rounded border border-amber-900/30">
                    Assign more clan scouts in Labor Allocation to chart this zone and access its resources.
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
