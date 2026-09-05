import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CivilizationState, Season, ThreatLevel } from '../types';

interface TimelineBarProps {
  state: CivilizationState;
  isPlaying: boolean;
  playSpeed: number;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: number) => void;
  onStepSeason: () => void;
  onStepYear: () => void;
  onReset: () => void;
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
  onReset,
  onOpenLatestReport,
}) => {
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
        return <span className="flex items-center gap-1 text-emerald-700 font-semibold">🌸 Spring</span>;
      case 'Summer':
        return <span className="flex items-center gap-1 text-amber-700 font-semibold">☀️ Summer</span>;
      case 'Autumn':
        return <span className="flex items-center gap-1 text-orange-700 font-semibold">🍂 Autumn</span>;
      case 'Winter':
        return <span className="flex items-center gap-1 text-blue-700 font-semibold">❄️ Winter</span>;
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

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Civilization Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            🌍
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-amber-100 flex items-center gap-2">
              AI Civilization Engine
              <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700 font-mono">
                Clan of the River
              </span>
            </h1>
            <p className="text-xs text-stone-400">Survival, Resources & Emergent Human Evolution</p>
          </div>
        </div>

        {/* Date, Season & Weather Indicators */}
        <div className="flex items-center gap-4 bg-stone-950/80 px-4 py-1.5 rounded-lg border border-stone-800 text-xs">
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
            {state.weather.isDrought && <span className="text-[10px] text-orange-400 bg-orange-950/80 px-1 rounded">Drought</span>}
            {state.weather.isBlizzard && <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1 rounded">Blizzard</span>}
          </div>

          <div className="flex items-center gap-1.5 text-stone-400">
            <Wind className="w-3 h-3 text-stone-500" />
            <span>Forecast reliability: {state.weather.forecastReliabilityPercent}%</span>
          </div>
        </div>

        {/* Population Status & Threat */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-stone-200">
              <span className="text-emerald-400 font-mono text-sm">{livingCount}</span> living
              {deadCount > 0 && <span className="text-stone-500 text-[11px] ml-1.5">({deadCount} dead)</span>}
            </div>
            <div className="text-[10px] text-stone-400">Initial: 100 humans</div>
          </div>

          <div className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1.5 ${getThreatColor(currentThreat)}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {currentThreat}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1.5 rounded-lg border border-stone-800">
          <button
            id="btn-step-season"
            onClick={onStepSeason}
            disabled={isPlaying}
            className="px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 active:bg-stone-900 disabled:opacity-40 rounded text-stone-200 transition-colors"
            title="Advance 1 Season (90 days)"
          >
            +1 Season
          </button>

          <button
            id="btn-step-year"
            onClick={onStepYear}
            disabled={isPlaying}
            className="px-2.5 py-1 text-xs font-medium bg-amber-900/60 hover:bg-amber-800/80 active:bg-amber-950 text-amber-200 border border-amber-700/50 rounded transition-colors"
            title="Simulate full 1 year (4 seasons) and generate Section 30 report"
          >
            +1 Year
          </button>

          <button
            id="btn-toggle-play"
            onClick={onTogglePlay}
            className={`p-1.5 rounded transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-stone-950 font-bold hover:bg-amber-400'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Auto Play Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {isPlaying && (
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSpeed(speed)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    playSpeed === speed ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}

          <button
            id="btn-reset-simulation"
            onClick={onReset}
            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded transition-colors ml-1"
            title="Reset world to Year 0 with 100 fresh humans"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
