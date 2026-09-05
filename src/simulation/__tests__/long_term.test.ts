import { describe, it, expect } from 'vitest';
import { createInitialCivilization } from '../generator';
import { simulateSeason, initializeRNG } from '../engine';
import { createSimulationContext, DEFAULT_CONFIG } from '../context';
import { runAutonomySystem } from '../systems/autonomy';

describe('Long-Term Multi-Generational Simulation Dynamics', () => {
  it('sustains demographic continuity over 20 solar cycles without extinction', () => {
    initializeRNG(777);
    let state = createInitialCivilization();

    const initialCount = state.people.filter((p) => p.alive).length;
    expect(initialCount).toBe(100);

    for (let season = 0; season < 80; season++) {
      const res = simulateSeason(state);
      state = res.state;

      const ctx = createSimulationContext(state, 777 + season, DEFAULT_CONFIG);
      runAutonomySystem(ctx);

      const living = state.people.filter((p) => p.alive).length;
      expect(living).toBeGreaterThan(0);
    }

    const finalLiving = state.people.filter((p) => p.alive).length;
    expect(finalLiving).toBeGreaterThanOrEqual(50);
    expect(state.year).toBe(20);

    const bornInSim = state.people.filter((p) => p.relationships.parentIds.length >= 2);
    expect(bornInSim.length).toBeGreaterThan(0);

    const knownTechs = state.technologies.filter((t) => t.discovered);
    expect(knownTechs.length).toBeGreaterThanOrEqual(6);
  });
});
