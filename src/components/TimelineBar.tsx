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
  Sliders,
  Sparkles,
  Download,
  Upload,
  Hash,
} from 'lucide-react';
import { CivilizationState, Season, ThreatLevel, NationalFocusType } from '../types';

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
  onOpenLatestReport,
}) => {
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [customSeedInput, setCustomSeedInput] = useState('');

  const livingCount = state.people.filter((p) => p.alive).length;
  const deadCount = state.people.length - livingCount;

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case 'Safe':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Concern':
        return 'bg-amber-500/15 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Crisis':
        return 'bg-orange-500/15 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      case 'Catastrophic':
        return 'bg-red-500/15 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
    }
  };

  const getSeasonBadge = (season: Season) => {
    switch (season) {
      case 'Spring':
        return <span className="flex items-center gap-1 text-emerald-400 font-semibold">🌸 Spring</span>;
      case 'Summer':
        return <span className="flex items-center gap-1 text-amber-400 font-semibold">☀️ Summer</span>;
      case 'Autumn':
        return <span className="flex items-center gap-1 text-orange-400 font-semibold">🍂 Autumn</span>;
      case 'Winter':
        return <span className="flex items-center gap-1 text-blue-400 font-semibold">❄️ Winter</span>;
    }
  };

  const currentThreat: ThreatLevel =
    state.annualReports.length > 0
      ? state.annualReports[state.annualReports.length - 1].threatLevel
      : livingCount < 50
      ? 'Crisis'
      : livingCount < 80
      ? 'Concern'
      : 'Safe';

  const speeds = [1, 2, 5, 10, 25, 50, 100, 1000];

  const nationalFocusOptions: { id: NationalFocusType; label: string; icon: string }[] = [
    { id: 'balanced', label: 'Autonomous Free Will', icon: '⚖️' },
    { id: 'food_security', label: 'Caloric Abundance', icon: '🌾' },
    { id: 'defense', label: 'Defensive Vigilance', icon: '🛡️' },
    { id: 'technology', label: 'Science & Lore', icon: '🔬' },
    { id: 'expansion', label: 'Urban Growth', icon: '🏠' },
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
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner: Status & Environmental Indicators */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/60">
        {/* Title & Civilization Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            🏛️
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-amber-100 flex items-center gap-2">
              Autonomous Civilization Engine
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700 font-mono">
                {state.leader ? `${state.leader.title} ${state.leader.name}` : 'Tribal Council'}
              </span>
            </h1>
            <p className="text-[11px] text-stone-400">Pure Simulation & Idle Observation • Self-Governing Societal Dynamics</p>
          </div>
        </div>

        {/* Date, Season & Weather Indicators */}
        <div className="flex items-center gap-3 bg-stone-950/80 px-3 py-1 rounded-lg border border-stone-800 text-xs">
          <div className="flex items-center gap-2 border-r border-stone-800 pr-3">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-sm">YEAR {state.year}</span>
            <span className="text-stone-500">•</span>
            {getSeasonBadge(state.season)}
          </div>

          <div className="flex items-center gap-2 border-r border-stone-800 pr-3">
            {state.weather.isBlizzard ? (
              <Snowflake className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            ) : state.weather.isRaining ? (
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            ) : state.weather.isDrought ? (
              <Sun className="w-3.5 h-3.5 text-orange-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-mono text-stone-200">{state.weather.currentTempC}°C</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
            <Wind className="w-3 h-3 text-stone-500" />
            <span>{state.weather.forecastReliabilityPercent}% forecast</span>
          </div>
        </div>

        {/* Population Status & Threat */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-stone-200">
              <span className="text-emerald-400 font-mono text-sm">{livingCount}</span> living agents
              {deadCount > 0 && <span className="text-stone-500 text-[11px] ml-1.5">({deadCount} ancestors)</span>}
            </div>
            <div className="text-[10px] text-stone-400">
              Epoch: {livingCount >= 350 ? 'Early City' : livingCount >= 200 ? 'Township' : livingCount >= 120 ? 'Large Village' : livingCount >= 60 ? 'Settled Hamlet' : 'Nomadic Band'}
            </div>
          </div>

          <div className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1.5 ${getThreatColor(currentThreat)}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {currentThreat}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar: High-Level Guidance & Simulation Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Optional High-Level Intervention: National Focus */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-400">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            National Guidance:
          </span>
          <select
            value={state.nationalFocus || 'balanced'}
            onChange={(e) => onUpdateNationalFocus && onUpdateNationalFocus(e.target.value as NationalFocusType)}
            className="bg-stone-950 text-amber-300 border border-stone-800 rounded-md px-2.5 py-1 text-xs font-medium focus:outline-hidden focus:border-amber-600 transition-colors"
            title="Societal Guidance: High-level doctrine that biases autonomous decisions without player micromanagement."
          >
            {nationalFocusOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1">
          <button
            id="btn-step-season"
            onClick={onStepSeason}
            disabled={isPlaying}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 disabled:opacity-40 rounded text-stone-200 transition-colors text-[11px] font-medium"
            title="Advance 1 Season (90 days) [Shortcut: S]"
          >
            +90d Season
          </button>

          <button
            id="btn-step-year"
            onClick={onStepYear}
            disabled={isPlaying}
            className="px-2 py-1 bg-amber-900/60 hover:bg-amber-800/80 active:bg-amber-950 disabled:opacity-40 text-amber-200 border border-amber-700/50 rounded transition-colors text-[11px] font-medium"
            title="Advance 1 Solar Cycle (4 seasons) [Shortcut: Y]"
          >
            +1y Solar
          </button>

          {onStepDecade && (
            <button
              id="btn-step-decade"
              onClick={onStepDecade}
              disabled={isPlaying}
              className="px-2 py-1 bg-purple-950/70 hover:bg-purple-900/90 active:bg-purple-950 disabled:opacity-40 text-purple-200 border border-purple-800/50 rounded transition-colors text-[11px] font-medium"
              title="Advance 1 Decade (10 years) [Shortcut: D]"
            >
              +10y Decade
            </button>
          )}

          {onStepCentury && (
            <button
              id="btn-step-century"
              onClick={onStepCentury}
              disabled={isPlaying}
              className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 active:bg-indigo-950 disabled:opacity-40 text-indigo-200 border border-indigo-700 rounded transition-colors text-[11px] font-bold"
              title="Advance 1 Century (100 years / 400 seasons) [Shortcut: C]"
            >
              +100y Century
            </button>
          )}
        </div>

        {/* Play / Pause & Full Speed Palette (1x to 1000x) */}
        <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
          <button
            id="btn-toggle-play"
            onClick={onTogglePlay}
            className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 text-xs ${
              isPlaying
                ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
            title={isPlaying ? 'Pause Idle Simulation [Space]' : 'Start Autonomous Simulation [Space]'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Speeds palette */}
          <div className="flex items-center gap-0.5 border-l border-stone-800 pl-1.5 ml-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                  playSpeed === s
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
                title={`Run at ${s}x simulation velocity`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Seed Modal Trigger */}
          <button
            onClick={() => setShowSeedModal(true)}
            className="p-1 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded transition-colors border-l border-stone-800 pl-1.5 ml-1"
            title="Configure World Seed / New World"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          {/* Reset Simulation */}
          <button
            id="btn-reset-simulation"
            onClick={onReset}
            className="p-1 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded transition-colors"
            title="Re-seed & Re-initialize Simulation Cohort at Year 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* World Seed Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
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
              placeholder="e.g. 424242"
              value={customSeedInput}
              onChange={(e) => setCustomSeedInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs font-mono text-amber-300 focus:outline-hidden focus:border-amber-500"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleApplySeed}
                disabled={!customSeedInput}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-lg transition-colors"
              >
                Generate New World
              </button>
              <button
                onClick={() => setShowSeedModal(false)}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition-colors"
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

