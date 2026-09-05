/**
 * Seeded Random Number Generator
 * Uses Mulberry32 algorithm for deterministic pseudo-random numbers
 * 
 * This is the ONLY source of randomness allowed in simulation systems.
 * All simulation randomness MUST go through this class.
 */
export class SeededRandom {
  private seed: number;
  private readonly originalSeed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0; // Ensure unsigned 32-bit integer
    this.originalSeed = seed;
  }

  /**
   * Generate next random number between 0 and 1 (exclusive)
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random float between min and max
   */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  integer(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  /**
   * Return true with given probability (0-1)
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return items[this.integer(0, items.length - 1)];
  }

  /**
   * Shuffle an array in place using Fisher-Yates
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.integer(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Weighted choice - picks an item based on weights array
   * Higher weight = higher chance of being picked
   */
  weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length === 0 || weights.length === 0 || items.length !== weights.length) {
      throw new Error('Invalid items/weights for weightedChoice');
    }
    
    const totalWeight = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
    if (totalWeight <= 0) {
      return items[0]; // Fallback
    }
    
    let random = this.next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= Math.max(0, weights[i]);
      if (random <= 0) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }

  /**
   * Generate a new seed from current time (for initial world generation only)
   * NOT for use in simulation - use constructor with explicit seed instead
   */
  static generateSeed(): number {
    return Math.floor(Math.random() * 2147483647);
  }

  /**
   * Get current seed value
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * Get original seed value
   */
  getOriginalSeed(): number {
    return this.originalSeed;
  }

  /**
   * Reset to original seed
   */
  reset(): void {
    this.seed = this.originalSeed;
  }

  /**
   * Create a fork/substream with a derived seed
   * Useful for independent random streams in different systems
   */
  fork(subSeed: number = 0): SeededRandom {
    const newSeed = (this.seed + subSeed) >>> 0;
    return new SeededRandom(newSeed);
  }
}
