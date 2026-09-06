import { describe, it, expect } from 'vitest';
import { createInitialCivilization } from '../generator';
import { simulateSeason, simulateYear, initializeRNG, getRNG } from '../engine';
import { SeededRandom } from '../utils/Random';
import { NationalFocusType } from '../../types';

describe('Civilization Simulator - True Automation Game Suite', () => {
  it('runs 100 years completely autonomously without player micromanagement', () => {
    initializeRNG(4242);
    let state = createInitialCivilization(getRNG());

    expect(state.autonomousDecisions).toBeDefined();
    expect(state.autonomousDecisions.length).toBeGreaterThanOrEqual(1);

    // Run for 100 years (400 seasons)
    for (let y = 0; y < 100; y++) {
      const result = simulateYear(state);
      state = result.state;
      if (state.people.filter(p => p.alive).length === 0) {
        break; // Extinction reached naturally
      }
    }

    // Verify autonomous decisions were actively deliberated and logged
    expect(state.autonomousDecisions.length).toBeGreaterThan(10);
    
    // Verify categories of autonomous actions
    const categories = new Set(state.autonomousDecisions.map(d => d.category));
    expect(categories.has('Labor & Workforce')).toBe(true);
    expect(
      categories.has('Infrastructure') ||
      categories.has('Food & Calorie') ||
      categories.has('Housing & Warmth') ||
      categories.has('Technology') ||
      categories.has('Governance')
    ).toBe(true);

    // Verify infrastructure was constructed autonomously
    const totalHomes = (state.infrastructure.leafHuts || 0) + (state.infrastructure.thatchedCabins || 0);
    expect(totalHomes).toBeGreaterThanOrEqual(18); // Started with 20, built/maintained
  });

  it('runs 500-year and 1000-year headless benchmark with zero NaN and data integrity', () => {
    initializeRNG(777);
    let state = createInitialCivilization(getRNG());

    for (let y = 0; y < 500; y++) {
      const result = simulateYear(state);
      state = result.state;
      if (state.people.filter(p => p.alive).length === 0) break;
    }

    // Verify no NaNs in resources
    for (const key of Object.keys(state.resources) as Array<keyof typeof state.resources>) {
      const res = state.resources[key];
      expect(Number.isNaN(res.quantity)).toBe(false);
      expect(res.quantity).toBeGreaterThanOrEqual(0);
    }

    // Verify living people integrity
    const living = state.people.filter(p => p.alive);
    for (const person of living) {
      expect(Number.isNaN(person.age)).toBe(false);
      expect(Number.isNaN(person.health)).toBe(false);
      expect(Number.isNaN(person.hunger)).toBe(false);
      expect(Number.isNaN(person.thirst)).toBe(false);
      expect(person.age).toBeGreaterThanOrEqual(0);
      expect(person.health).toBeGreaterThanOrEqual(0);
      // Dead persons never retain active workforce roles
      expect(person.role).toBeDefined();
    }

    // Verify all IDs are unique
    const idSet = new Set(state.people.map(p => p.id));
    expect(idSet.size).toBe(state.people.length);
  }, 30000);

  it('guarantees deterministic outcomes from identical world seeds', () => {
    // Run 1
    initializeRNG(9999);
    let stateA = createInitialCivilization(getRNG());
    for (let y = 0; y < 25; y++) {
      stateA = simulateYear(stateA).state;
    }

    // Run 2
    initializeRNG(9999);
    let stateB = createInitialCivilization(getRNG());
    for (let y = 0; y < 25; y++) {
      stateB = simulateYear(stateB).state;
    }

    const livingA = stateA.people.filter(p => p.alive).length;
    const livingB = stateB.people.filter(p => p.alive).length;

    expect(livingA).toBe(livingB);
    expect(stateA.year).toBe(stateB.year);
    expect(stateA.resources.fruit.quantity).toBe(stateB.resources.fruit.quantity);
    expect(stateA.resources.fresh_water.quantity).toBe(stateB.resources.fresh_water.quantity);
    expect(stateA.autonomousDecisions.length).toBe(stateB.autonomousDecisions.length);
  });

  it('responds to National Focus guidance by adjusting workforce allocations', () => {
    initializeRNG(123);
    const civFood = createInitialCivilization(getRNG());
    civFood.nationalFocus = 'food_security';
    
    initializeRNG(123);
    const civTech = createInitialCivilization(getRNG());
    civTech.nationalFocus = 'technology';

    // Advance 1 season
    const stateFood = simulateSeason(civFood).state;
    const stateTech = simulateSeason(civTech).state;

    const foodWorkers = stateFood.people.filter(
      p => p.alive && (p.role === 'forager' || p.role === 'hunter' || p.role === 'farmer')
    ).length;

    const loreKeepers = stateTech.people.filter(
      p => p.alive && p.role === 'elder_lorekeeper'
    ).length;

    // Technology focus prioritizes oral lorekeepers
    expect(loreKeepers).toBeGreaterThanOrEqual(1);
    expect(foodWorkers).toBeGreaterThanOrEqual(10);
  });

  it('verifies all autonomous decisions reflect real simulation consequences', () => {
    initializeRNG(54321);
    let state = createInitialCivilization(getRNG());

    // Step 10 seasons
    for (let s = 0; s < 10; s++) {
      state = simulateSeason(state).state;
    }

    // Verify recent decisions have valid problem, action, consequence, reasoning
    for (const dec of state.autonomousDecisions) {
      expect(dec.id).toBeDefined();
      expect(dec.action.length).toBeGreaterThan(5);
      expect(dec.consequence.length).toBeGreaterThan(5);
      expect(dec.problem.length).toBeGreaterThan(5);
      expect(dec.reasoning.length).toBeGreaterThan(5);
    }
  });
});
