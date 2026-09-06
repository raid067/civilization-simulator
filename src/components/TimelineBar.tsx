import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Calendar,
  Compass,
  Hash,
  Sparkles,
  Crown,
  FastForward,
} from 'lucide-react';
import { CivilizationState, Season, NationalFocusType } from '../types';

interface TimelineBarProps {
  state: CivilizationState;
  isPlaying: boolean;
  playSpeed: number;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: number) => void;
  onStepSeason: () => void;
  onStepYear: () => void;
  onStepDecade?: () => void;
  onStepCentury?: () => void;
  onReset: () => void;
  onUpdateNationalFocus?: (focus: NationalFocusType) => void;
  onNewSeed?: (seed: number) => void;
  onOpenLatestReport?: () => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  state,
  isPlaying,
  playSpeed,
  onTogglePlay,
  onChangeSpeed,
  onStepSeason,
  onStepYear,
  onStepDecade,
  onStepCentury,
  onReset,
  onUpdateNationalFocus,
  onNewSeed,
}) => {
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [customSeedInput, setCustomSeedInput] = useState('');

  const livingCount = state.people.filter((p) => p.alive).length;

  const getSeasonBadge = (season: Season) => {
    switch (season) {
      case 'Spring':
        return (
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="text-sm">🌸</span> Spring
          </span>
        );
      case 'Summer':
        return (
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="text-sm">☀️</span> Summer
          </span>
        );
      case 'Autumn':
        return (
          <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
            <span className="text-sm">🍂</span> Autumn
          </span>
        );
      case 'Winter':
        return (
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="text-sm">❄️</span> Winter
          </span>
        );
    }
  };

  const getSettlementTier = (count: number) => {
    if (count >= 1000) return { name: 'Imperial Metropolis', icon: '👑', color: 'text-amber-300 border-amber-500/50 bg-amber-950/40' };
    if (count >= 350) return { name: 'Fortified City', icon: '🏛️', color: 'text-purple-300 border-purple-500/50 bg-purple-950/40' };
    if (count >= 200) return { name: 'Regional Township', icon: '🏰', color: 'text-indigo-300 border-indigo-500/50 bg-indigo-950/40' };
    if (count >= 120) return { name: 'Large Village', icon: '🏡', color: 'text-blue-300 border-blue-500/50 bg-blue-950/40' };
    if (count >= 60) return { name: 'Settled Hamlet', icon: '🌾', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40' };
    return { name: 'Nomadic Camp', icon: '🏕️', color: 'text-stone-300 border-stone-700 bg-stone-900' };
  };

  const tier = getSettlementTier(livingCount);
  const speeds = [1, 2, 5, 10, 25, 50, 100, 1000];

  const nationalFocusOptions: { id: NationalFocusType; label: string; icon: string }[] = [
    { id: 'balanced', label: 'Balanced Autonomy', icon: '⚖️' },
    { id: 'food_security', label: 'Caloric Abundance', icon: '🌾' },
    { id: 'defense', label: 'Fortification & Defense', icon: '🛡️' },
    { id: 'technology', label: 'Science & Lore Focus', icon: '🔬' },
    { id: 'expansion', label: 'Shelter & Urban Growth', icon: '🏠' },
    { id: 'ecological', label: 'Ecological Harmony', icon: '🌱' },
  ];

  const handleApplySeed = () => {
    const seed = parseInt(customSeedInput, 10);
    if (!isNaN(seed) && onNewSeed) {
      onNewSeed(seed);
      setShowSeedModal(false);
      setCustomSeedInput('');
    }
  };

  return (
    <header className="bg-stone-900/95 backdrop-blur-xl text-stone-100 border-b border-amber-900/40 sticky top-0 z-40 shadow-2xl">
      {/* Top Identity & Status Row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/70">
        {/* Left: Civilization Brand & Tier */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center text-lg">
              {tier.icon}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-amber-100">
                Civilization Simulator
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tier.color}`}>
                {tier.name}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Autonomous Multi-Generational Emergence • Self-Governing Societal Dynamics
            </p>
          </div>
        </div>

        {/* Center: Live Calendar & Weather Dial */}
        <div className="flex items-center gap-3 bg-stone-950/80 px-3.5 py-1.5 rounded-xl border border-stone-800/80 text-xs shadow-inner">
          <div className="flex items-center gap-2 border-r border-stone-800 pr-3">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-sm">YEAR {state.year}</span>
            <span className="text-stone-600">•</span>
            {getSeasonBadge(state.season)}
          </div>

          <div className="flex items-center gap-2 border-r border-stone-800 pr-3">
            {state.weather.isBlizzard ? (
              <Snowflake className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : state.weather.isRaining ? (
              <CloudRain className="w-4 h-4 text-blue-400" />
            ) : state.weather.isDrought ? (
              <Sun className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-mono text-stone-200 font-semibold">{state.weather.currentTempC}°C</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
            <Wind className="w-3.5 h-3.5 text-stone-500" />
            <span>Day {state.dayOfYear} / 360</span>
          </div>
        </div>

        {/* Right: World Seed & Reset */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowSeedModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 rounded-lg transition-colors"
            title="Configure or inspect deterministic World Seed"
          >
            <Hash className="w-3.5 h-3.5 text-amber-400" />
            <span>Seed</span>
          </button>

          <button
            id="btn-reset-simulation"
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-rose-400 border border-stone-800 rounded-lg transition-colors"
            title="Re-seed & Re-initialize Simulation Cohort at Year 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls Row: Play/Pause, Speeds & National Guidance */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Simulation Velocity & Play/Pause */}
        <div className="flex items-center gap-2">
          {/* Primary Play/Pause Button with neon glow */}
          <button
            id="btn-toggle-play"
            onClick={onTogglePlay}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 text-xs cursor-pointer shadow-lg ${
              isPlaying
                ? 'bg-emerald-500 text-stone-950 shadow-emerald-500/25 hover:bg-emerald-400 ring-2 ring-emerald-500/40'
                : 'bg-amber-600 text-stone-950 shadow-amber-600/25 hover:bg-amber-500 ring-1 ring-amber-500/30'
            }`}
            title={isPlaying ? 'Pause Autonomous Simulation [Space]' : 'Start Autonomous Simulation [Space]'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
                <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>AUTO-PLAY</span>
              </>
            )}
          </button>

          {/* Speed Selector Pills */}
          <div className="flex items-center gap-0.5 bg-stone-950 p-1 rounded-xl border border-stone-800/80">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`text-[11px] px-2 py-0.5 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                  playSpeed === s
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
                title={`Simulate at ${s}x speed`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Time Leap / Step Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-step-season"
            onClick={onStepSeason}
            disabled={isPlaying}
            className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 disabled:opacity-40 text-stone-200 border border-stone-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Advance 1 Season (90 days) [Shortcut: S]"
          >
            <span>+Season</span>
            <kbd className="text-[9px] px-1 py-0.2 bg-stone-800 rounded text-stone-400 font-mono">S</kbd>
          </button>

          <button
            id="btn-step-year"
            onClick={onStepYear}
            disabled={isPlaying}
            className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 disabled:opacity-40 text-amber-200 border border-amber-800/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Advance 1 Solar Cycle (4 seasons) [Shortcut: Y]"
          >
            <span>+1 Year</span>
            <kbd className="text-[9px] px-1 py-0.2 bg-amber-900/80 rounded text-amber-300 font-mono">Y</kbd>
          </button>

          {onStepDecade && (
            <button
              id="btn-step-decade"
              onClick={onStepDecade}
              disabled={isPlaying}
              className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/80 disabled:opacity-40 text-purple-200 border border-purple-800/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Advance 1 Decade (10 years) [Shortcut: D]"
            >
              <span>+10y Decade</span>
              <kbd className="text-[9px] px-1 py-0.2 bg-purple-900/80 rounded text-purple-300 font-mono">D</kbd>
            </button>
          )}

          {onStepCentury && (
            <button
              id="btn-step-century"
              onClick={onStepCentury}
              disabled={isPlaying}
              className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 disabled:opacity-40 text-indigo-200 border border-indigo-700/80 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Advance 1 Century (100 years / 400 seasons) [Shortcut: C]"
            >
              <span>+100y Century</span>
              <kbd className="text-[9px] px-1 py-0.2 bg-indigo-900 rounded text-indigo-300 font-mono">C</kbd>
            </button>
          )}
        </div>

        {/* Right: National Focus Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Guidance:
          </span>
          <select
            value={state.nationalFocus || 'balanced'}
            onChange={(e) => onUpdateNationalFocus && onUpdateNationalFocus(e.target.value as NationalFocusType)}
            className="bg-stone-950 text-amber-300 border border-stone-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-hidden focus:border-amber-500 transition-colors cursor-pointer"
            title="Set high-level national guidance to steer autonomous prioritization"
          >
            {nationalFocusOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* World Seed Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-800/40 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-400" />
                World Generation Seed
              </h3>
              <button
                onClick={() => setShowSeedModal(false)}
                className="text-stone-500 hover:text-stone-300 text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every seed creates a unique deterministic ecological and demographic history. Identical seeds yield identical civilizational trajectories.
            </p>
            <input
              type="number"
              placeholder="e.g. 12345"
              value={customSeedInput}
              onChange={(e) => setCustomSeedInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs font-mono text-amber-300 focus:outline-hidden focus:border-amber-500"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleApplySeed}
                disabled={!customSeedInput}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Generate New World
              </button>
              <button
                onClick={() => setShowSeedModal(false)}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
