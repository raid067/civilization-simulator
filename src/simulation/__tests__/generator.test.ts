import { describe, it, expect } from 'vitest';
import { createInitialCivilization } from '../generator';
import { SeededRandom } from '../utils/Random';

describe('Civilization Generator', () => {
  it('creates initial civilization with exactly 100 living individuals', () => {
    const rng = new SeededRandom(123);
    const civ = createInitialCivilization(rng);

    expect(civ.people.length).toBe(100);
    const living = civ.people.filter((p) => p.alive);
    expect(living.length).toBe(100);
  });

  it('populates balanced gender and age distribution', () => {
    const civ = createInitialCivilization(new SeededRandom(456));
    const females = civ.people.filter((p) => p.gender === 'female');
    const males = civ.people.filter((p) => p.gender === 'male');

    expect(females.length).toBeGreaterThan(30);
    expect(males.length).toBeGreaterThan(30);

    const children = civ.people.filter((p) => p.age < 10);
    const adults = civ.people.filter((p) => p.age >= 10);
    expect(children.length).toBeGreaterThan(0);
    expect(adults.length).toBeGreaterThan(0);
  });

  it('initializes critical survival resources', () => {
    const civ = createInitialCivilization(new SeededRandom(789));
    expect(civ.resources['meat'].quantity).toBeGreaterThan(0);
    expect(civ.resources['fresh_water'].quantity).toBeGreaterThan(0);
    expect(civ.resources['wood'].quantity).toBeGreaterThan(0);
  });
});
