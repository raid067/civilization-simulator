import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../utils/Random';

describe('SeededRandom (Mulberry32 PRNG)', () => {
  it('produces identical sequence with identical seed', () => {
    const rng1 = new SeededRandom(424242);
    const rng2 = new SeededRandom(424242);
    const s1 = Array.from({ length: 10 }, () => rng1.next());
    const s2 = Array.from({ length: 10 }, () => rng2.next());
    expect(s1).toEqual(s2);
  });

  it('generates numbers within [0, 1) bounds', () => {
    const rng = new SeededRandom(12345);
    for (let i = 0; i < 50; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('supports deterministic forking', () => {
    const parent = new SeededRandom(999);
    const forkA = parent.fork(1);
    const forkB = parent.fork(2);
    expect(forkA.next()).not.toEqual(forkB.next());
  });
});
