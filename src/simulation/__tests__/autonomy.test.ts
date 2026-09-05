import { describe, it, expect } from 'vitest';
import { runAutonomySystem } from '../systems/autonomy';
import { createSimulationContext, DEFAULT_CONFIG } from '../context';
import { createInitialCivilization } from '../generator';
import { SeededRandom } from '../utils/Random';

describe('Tribal Survival Autonomy System', () => {
  it('operates safely without throwing', () => {
    const civ = createInitialCivilization(new SeededRandom(303));
    const ctx = createSimulationContext(civ, 303, DEFAULT_CONFIG);

    expect(() => runAutonomySystem(ctx)).not.toThrow();
  });

  it('mobilizes water carriers when water reserve is depleted', () => {
    const civ = createInitialCivilization(new SeededRandom(404));
    civ.resources['fresh_water'].quantity = 10;
    const ctx = createSimulationContext(civ, 404, DEFAULT_CONFIG);

    runAutonomySystem(ctx);
    const waterFetchers = civ.people.filter((p) => p.alive && p.role === 'water_fetcher');
    expect(waterFetchers.length).toBeGreaterThan(0);
  });
});
