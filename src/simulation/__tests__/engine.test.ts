import { describe, it, expect } from 'vitest';
import { simulateSeason, simulateYear } from '../engine';
import { createInitialCivilization } from '../generator';
import { SeededRandom } from '../utils/Random';

describe('Civilization Engine Core Tick', () => {
  it('cycles through seasons sequentially', () => {
    const rng = new SeededRandom(101);
    let state = createInitialCivilization(rng);
    expect(state.season).toBe('Spring');

    const tick1 = simulateSeason(state);
    expect(tick1.state.season).toBe('Summer');

    const tick2 = simulateSeason(tick1.state);
    expect(tick2.state.season).toBe('Autumn');

    const tick3 = simulateSeason(tick2.state);
    expect(tick3.state.season).toBe('Winter');

    const tick4 = simulateSeason(tick3.state);
    expect(tick4.state.season).toBe('Spring');
    expect(tick4.state.year).toBe(1);
  });

  it('generates annual Section 30 report when completing a full year', () => {
    const rng = new SeededRandom(202);
    const initial = createInitialCivilization(rng);
    const { state, report } = simulateYear(initial);

    expect(report.year).toBe(0);
    expect(state.year).toBe(1);
    expect(state.annualReports.length).toBe(1);
    expect(report.threatLevel).toBeDefined();
  });
});
