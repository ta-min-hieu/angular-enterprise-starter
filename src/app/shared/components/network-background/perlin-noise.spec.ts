import { describe, expect, it } from 'vitest';
import { PerlinNoise3D } from './perlin-noise';

describe('PerlinNoise3D', () => {
  it('should return deterministic output for the same seed and coordinates', () => {
    const a = new PerlinNoise3D(42);
    const b = new PerlinNoise3D(42);

    expect(a.noise(1.23, 4.56, 7.89)).toBe(b.noise(1.23, 4.56, 7.89));
  });

  it('should return values within the expected [-1, 1] range across many samples', () => {
    const noise = new PerlinNoise3D(7);

    for (let i = 0; i < 500; i++) {
      const value = noise.noise(i * 0.37, i * 0.51, i * 0.13);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('should vary smoothly rather than jumping abruptly between nearby samples', () => {
    const noise = new PerlinNoise3D(99);
    const a = noise.noise(2.5, 3.5, 1.1);
    const b = noise.noise(2.501, 3.5, 1.1);

    expect(Math.abs(a - b)).toBeLessThan(0.05);
  });

  it('should produce different fields for different seeds', () => {
    const a = new PerlinNoise3D(1);
    const b = new PerlinNoise3D(2);

    expect(a.noise(1.1, 2.2, 3.3)).not.toBe(b.noise(1.1, 2.2, 3.3));
  });
});
