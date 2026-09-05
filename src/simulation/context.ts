import { CivilizationState } from '../types';
import { SeededRandom } from './utils/Random';

/**
 * Simulation Context
 * 
 * Central context passed to all simulation systems.
 * Contains all state and utilities needed for deterministic simulation.
 * 
 * This prevents hidden global state and ensures all systems
 * use the same RNG instance for reproducibility.
 */
export interface SimulationContext {
  /** Current simulation state (mutable within a season step) */
  state: CivilizationState;
  
  /** Seeded RNG - the ONLY allowed source of randomness */
  rng: SeededRandom;
  
  /** Current year in simulation */
  year: number;
  
  /** Current season in simulation */
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  
  /** Configuration options */
  config: SimulationConfig;
  
  /** Event queue for deferred events */
  eventQueue: SimulationEvent[];
  
  /** Metrics tracking for this step */
  metrics: StepMetrics;
  
  /** Debug/logging utilities */
  debug: SimulationDebug;
}

export interface SimulationConfig {
  /** Base food consumption per person per season (kg) */
  baseFoodConsumption: number;
  
  /** Base water consumption per person per season (Liters) */
  baseWaterConsumption: number;
  
  /** Minimum age for reproduction */
  minReproductionAge: number;
  
  /** Maximum age for reproduction */
  maxReproductionAge: number;
  
  /** Base birth probability per eligible couple per year */
  baseBirthProbability: number;
  
  /** Enable detailed logging */
  enableDebugLogs: boolean;
  
  /** Run validation checks after each step */
  enableValidation: boolean;
}

export interface SimulationEvent {
  id: string;
  type: string;
  year: number;
  season: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  data?: Record<string, unknown>;
}

export interface StepMetrics {
  /** Time taken for this simulation step (ms) */
  executionTimeMs: number;
  
  /** Number of people processed */
  peopleProcessed: number;
  
  /** Number of births this step */
  births: number;
  
  /** Number of deaths this step */
  deaths: number;
  
  /** Food produced this step (kg) */
  foodProduced: number;
  
  /** Food consumed this step (kg) */
  foodConsumed: number;
  
  /** Warnings generated */
  warnings: string[];
  
  /** Errors encountered */
  errors: string[];
}

export interface SimulationDebug {
  log(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: SimulationConfig = {
  baseFoodConsumption: 75, // kg per person per season (~300kg/year)
  baseWaterConsumption: 250, // Liters per person per season (~1000L/year)
  minReproductionAge: 18,
  maxReproductionAge: 45,
  baseBirthProbability: 0.25, // 25% chance per year for eligible couples
  enableDebugLogs: false,
  enableValidation: true,
};

/**
 * Create a new simulation context
 */
export function createSimulationContext(
  state: CivilizationState,
  seed: number,
  config: Partial<SimulationConfig> = {}
): SimulationContext {
  const mergedConfig: SimulationConfig = { ...DEFAULT_CONFIG, ...config };
  const rng = new SeededRandom(seed);
  
  const debug: SimulationDebug = {
    log: (message: string, data?: unknown) => {
      if (mergedConfig.enableDebugLogs) {
        console.log(`[SIM:${state.year}-${state.season}] ${message}`, data ?? '');
      }
    },
    warn: (message: string, data?: unknown) => {
      console.warn(`[SIM:${state.year}-${state.season}] WARN: ${message}`, data ?? '');
    },
    error: (message: string, data?: unknown) => {
      console.error(`[SIM:${state.year}-${state.season}] ERROR: ${message}`, data ?? '');
    },
  };
  
  return {
    state,
    rng,
    year: state.year,
    season: state.season,
    config: mergedConfig,
    eventQueue: [],
    metrics: {
      executionTimeMs: 0,
      peopleProcessed: 0,
      births: 0,
      deaths: 0,
      foodProduced: 0,
      foodConsumed: 0,
      warnings: [],
      errors: [],
    },
    debug,
  };
}

/**
 * Update context for new season
 */
export function updateContextForSeason(context: SimulationContext): void {
  context.year = context.state.year;
  context.season = context.state.season;
}

/**
 * Add an event to the context's event queue
 */
export function addEvent(
  context: SimulationContext,
  type: string,
  description: string,
  severity: 'info' | 'warning' | 'critical' = 'info',
  data?: Record<string, unknown>
): void {
  context.eventQueue.push({
    id: `evt-${context.year}-${context.season}-${context.eventQueue.length}`,
    type,
    year: context.year,
    season: context.season,
    description,
    severity,
    data,
  });
}
