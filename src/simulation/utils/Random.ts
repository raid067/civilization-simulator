/**
 * Seeded Random Number Generator
 * Uses Mulberry32 algorithm for deterministic pseudo-random numbers
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0; // Ensure unsigned 32-bit integer
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  integer(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
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
  pick<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  /**
   * Shuffle an array in place using Fisher-Yates
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate a new seed
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
}
