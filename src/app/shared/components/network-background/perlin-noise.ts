// Ken Perlin "Improved Noise" (2002) — thuật toán tham khảo kinh điển, KHÔNG chép bảng permutation
// gốc đã công bố của Perlin mà tự sinh bảng permutation riêng bằng seeded shuffle (Fisher-Yates)
// để tránh rủi ro chép sai số liệu; về mặt toán học, thuật toán chỉ cần một permutation hợp lệ của
// 0..255 để tạo gradient "đủ ngẫu nhiên", không bắt buộc đúng bảng lịch sử của Perlin.
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// PRNG nhỏ, seed được (mulberry32) — chỉ dùng để sinh bảng permutation lúc khởi tạo, không dùng
// trong vòng lặp noise() nóng (hot path).
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class PerlinNoise3D {
  private readonly perm: Uint8Array;

  constructor(seed = 1337) {
    this.perm = PerlinNoise3D.buildPermutationTable(seed);
  }

  // Trả về giá trị xấp xỉ trong khoảng [-1, 1], liên tục và mượt theo x/y/z.
  noise(x: number, y: number, z: number): number {
    const p = this.perm;
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const fz = z - Math.floor(z);
    const u = fade(fx);
    const v = fade(fy);
    const w = fade(fz);

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
      w,
      lerp(
        v,
        lerp(u, grad(p[AA], fx, fy, fz), grad(p[BA], fx - 1, fy, fz)),
        lerp(u, grad(p[AB], fx, fy - 1, fz), grad(p[BB], fx - 1, fy - 1, fz)),
      ),
      lerp(
        v,
        lerp(u, grad(p[AA + 1], fx, fy, fz - 1), grad(p[BA + 1], fx - 1, fy, fz - 1)),
        lerp(u, grad(p[AB + 1], fx, fy - 1, fz - 1), grad(p[BB + 1], fx - 1, fy - 1, fz - 1)),
      ),
    );
  }

  private static buildPermutationTable(seed: number): Uint8Array {
    const random = createSeededRandom(seed);
    const base = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      base[i] = i;
    }
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = base[i];
      base[i] = base[j];
      base[j] = tmp;
    }

    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      perm[i] = base[i % 256];
    }
    return perm;
  }
}
