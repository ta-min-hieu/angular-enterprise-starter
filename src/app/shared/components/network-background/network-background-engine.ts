import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { NetworkBackgroundConfig } from './network-background.config';
import { PerlinNoise3D } from './perlin-noise';

// Trần devicePixelRatio — tránh render quá nặng trên màn hình retina/mobile DPR cao (3x).
const MAX_PIXEL_RATIO = 2;
// Trần delta time mỗi frame (giây) — khi tab bị ẩn rồi quay lại, delta có thể rất lớn, cắt để hạt
// không "nhảy cóc" một bước dài bất thường.
const MAX_DELTA_SECONDS = 1 / 20;
// Số cell lưới không gian ước lượng theo mỗi cạnh — dùng để giới hạn số cặp hạt phải so khoảng
// cách mỗi frame xuống O(n) thay vì O(n^2) thô.
const GRID_CELL_PADDING = 1;
// Thời gian (giây) 1 hạt "trượt" từ vị trí cũ sang vị trí mới sau khi bị click.
const SLIDE_DURATION_SECONDS = 0.9;
// Khoảng đệm sau khi hạt tới nơi mới trước khi nó được phép nối lại — tránh cảm giác nối lại
// "ngay lập tức" thiếu tự nhiên.
const ISOLATION_BUFFER_SECONDS = 0.15;
// Ngưỡng bắt trúng hạt khi raycast (world unit) = particleSize * hệ số này — nhân lên để dễ click
// trúng hơn kích thước hiển thị thật (chấm quá nhỏ, click chính xác pixel-perfect sẽ khó chịu).
const RAYCAST_THRESHOLD_MULTIPLIER = 3;

interface GridCell {
  readonly indices: number[];
}

const enum ParticleMotionState {
  Drifting = 0,
  Sliding = 1,
}

// Toàn bộ logic Three.js (scene/particle/animation/parallax/bloom/tương tác click) tách khỏi
// Angular — class thuần TypeScript, không phụ thuộc @angular/core, để tái sử dụng được ở bất kỳ
// nơi nào có <canvas> (không chỉ NetworkBackground component), và dễ test/thay thế độc lập.
export class NetworkBackgroundEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly composer: EffectComposer;
  private readonly bloomPass: UnrealBloomPass;
  private readonly clock = new THREE.Clock();
  private readonly noise = new PerlinNoise3D();
  private readonly raycaster = new THREE.Raycaster();

  private readonly particleCount: number;
  private readonly positions: Float32Array;
  private readonly particleGeometry: THREE.BufferGeometry;
  private readonly points: THREE.Points;

  private readonly linePositions: Float32Array;
  private readonly lineColors: Float32Array;
  private readonly lineGeometry: THREE.BufferGeometry;
  private readonly lines: THREE.LineSegments;

  // Trạng thái tương tác click: hạt đang SLIDING thì bỏ qua noise-drift, nội suy thẳng từ vị trí
  // lúc bị click tới vị trí đích mới; isolatedUntil khiến hạt bị loại khỏi buildSpatialGrid (=
  // "mất liên kết" hoàn toàn, không hạt nào tìm thấy nó và ngược lại) cho tới khi mốc thời gian đó
  // trôi qua, sau đó nó tự nhiên nối lại theo khoảng cách như mọi hạt khác — không cần code riêng.
  private readonly motionState: Uint8Array;
  private readonly slideStartPositions: Float32Array;
  private readonly slideTargetPositions: Float32Array;
  private readonly slideStartTimes: Float32Array;
  private readonly isolatedUntil: Float32Array;

  // Lực đẩy tách hạt, tích luỹ trong updateConnections() (tận dụng luôn vòng lặp cặp-hạt-gần-nhau
  // đã có sẵn ở đó, không cần build thêm 1 lưới không gian riêng) rồi ÁP DỤNG ở updateParticles()
  // của FRAME KẾ TIẾP — trễ đúng 1 frame (~16ms, không nhận ra được) nhưng đổi lại chỉ cần 1 lần
  // build lưới mỗi frame thay vì 2. Ngăn hạt bị trường Perlin Noise "cuốn" dồn cụm lại 1 chỗ.
  private readonly separationForceX: Float32Array;
  private readonly separationForceY: Float32Array;

  // Gán giá trị thật ngay trong constructor qua updateViewBounds() trước khi bất kỳ code nào khác
  // đọc tới — dùng definite assignment assertion thay vì giá trị mặc định vì phụ thuộc
  // config.viewHeight (chưa có lúc field initializer chạy, trước cả khi tham số constructor được
  // gán vào this.config).
  private halfWidth!: number;
  private halfHeight!: number;

  private pointerX = 0;
  private pointerY = 0;
  private parallaxX = 0;
  private parallaxY = 0;

  private animationFrameId: number | null = null;
  private disposed = false;

  // Cache sẵn 1 lần trong constructor — writeLineVertex() gọi rất nhiều lần mỗi frame (tới
  // maxConnections * 2), tránh new THREE.Color()/tính toán lại màu ở hot path.
  private readonly lineColorRgb: readonly [number, number, number];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: NetworkBackgroundConfig,
    width: number,
    height: number,
  ) {
    this.particleCount = config.particleCount;
    const seedColor = new THREE.Color(config.particleColors[0]);
    this.lineColorRgb = [seedColor.r, seedColor.g, seedColor.b];
    // Phải tính đúng halfWidth/halfHeight theo aspect THẬT trước khi sinh vị trí hạt — nếu để mặc
    // định vuông (viewHeight/2 x viewHeight/2) rồi mới resize() sau, hạt sẽ dồn ở giữa màn hình
    // rộng và phải mất một lúc trôi dạt mới lấp đầy 2 bên (nhìn thưa/lỗi lúc mới tải trang).
    this.updateViewBounds(width, height);

    this.motionState = new Uint8Array(this.particleCount);
    this.slideStartPositions = new Float32Array(this.particleCount * 3);
    this.slideTargetPositions = new Float32Array(this.particleCount * 3);
    this.slideStartTimes = new Float32Array(this.particleCount);
    this.isolatedUntil = new Float32Array(this.particleCount);
    this.separationForceX = new Float32Array(this.particleCount);
    this.separationForceY = new Float32Array(this.particleCount);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    this.renderer.setClearColor(new THREE.Color(config.backgroundColor), 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.z = 10;

    this.raycaster.params.Points = {
      threshold: config.particleSize * RAYCAST_THRESHOLD_MULTIPLIER,
    };

    const particles = this.createParticles();
    this.positions = particles.positions;
    this.particleGeometry = particles.geometry;
    this.points = particles.points;
    this.scene.add(this.points);

    const connections = this.createConnectionLines();
    this.linePositions = connections.positions;
    this.lineColors = connections.colors;
    this.lineGeometry = connections.geometry;
    this.lines = connections.lines;
    this.scene.add(this.lines);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      config.bloomStrength,
      config.bloomRadius,
      config.bloomThreshold,
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    this.resize(width, height);
    // Tạm dừng vòng lặp render khi tab không hiển thị — tiết kiệm CPU/pin, không có lý do gì để vẽ
    // 60 FPS cho một tab đang ẩn.
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  start(): void {
    if (this.animationFrameId !== null || this.disposed) {
      return;
    }
    this.clock.start();
    this.tick();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    this.updateViewBounds(width, height);
    this.camera.left = -this.halfWidth;
    this.camera.right = this.halfWidth;
    this.camera.top = this.halfHeight;
    this.camera.bottom = -this.halfHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  }

  // x/y đã chuẩn hoá trong khoảng [-1, 1] (vd (clientX/innerWidth)*2-1) — do nơi gọi (component)
  // tự tính từ toạ độ con trỏ thật, engine không cần biết về DOM event.
  setPointer(x: number, y: number): void {
    this.pointerX = x;
    this.pointerY = y;
  }

  // x/y đã chuẩn hoá trong khoảng [-1, 1] TÍNH THEO CHÍNH CANVAS (không phải window) — nơi gọi tự
  // tính từ getBoundingClientRect() của canvas. Trả về true nếu có bắt trúng 1 hạt.
  handleClick(ndcX: number, ndcY: number): boolean {
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hits = this.raycaster.intersectObject(this.points);
    const hit = hits[0];
    if (hit?.index === undefined) {
      return false;
    }

    this.perturbParticle(hit.index);
    return true;
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.particleGeometry.dispose();
    this.lineGeometry.dispose();
    (this.points.material as THREE.Material).dispose();
    (this.lines.material as THREE.Material).dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  };

  private tick = (): void => {
    this.animationFrameId = requestAnimationFrame(this.tick);
    const delta = Math.min(this.clock.getDelta(), MAX_DELTA_SECONDS);
    const elapsed = this.clock.getElapsedTime();

    this.updateParticles(delta, elapsed);
    this.updateConnections(elapsed);
    this.updateParallax();

    this.composer.render();
  };

  // Click vào hạt `index`: cho nó "trượt" tới 1 vị trí ngẫu nhiên khác trong khung nhìn hiện tại,
  // và cô lập (loại khỏi lưới kết nối) trong suốt quá trình trượt + một khoảng đệm sau khi tới nơi
  // — đúng hiệu ứng "mất liên kết, trượt ra chỗ khác, rồi tự nối lại với hạt khác ở đó".
  private perturbParticle(index: number): void {
    const idx = index * 3;
    const positions = this.positions;
    const elapsed = this.clock.getElapsedTime();

    this.slideStartPositions[idx] = positions[idx];
    this.slideStartPositions[idx + 1] = positions[idx + 1];
    this.slideStartPositions[idx + 2] = positions[idx + 2];

    const target = this.pickSlideTarget(positions[idx], positions[idx + 1]);
    this.slideTargetPositions[idx] = target[0];
    this.slideTargetPositions[idx + 1] = target[1];
    this.slideTargetPositions[idx + 2] = target[2];

    this.slideStartTimes[index] = elapsed;
    this.motionState[index] = ParticleMotionState.Sliding;
    this.isolatedUntil[index] = elapsed + SLIDE_DURATION_SECONDS + ISOLATION_BUFFER_SECONDS;
  }

  // Chọn 1 điểm ngẫu nhiên trong khung nhìn, thử lại tối đa vài lần nếu vô tình quá gần vị trí cũ
  // (tránh trường hợp hiếm gặp "trượt" mà gần như không di chuyển, nhìn giống bug hơn là hiệu ứng).
  private pickSlideTarget(fromX: number, fromY: number): readonly [number, number, number] {
    const minDistance = Math.min(this.halfWidth, this.halfHeight) * 0.6;
    let x = fromX;
    let y = fromY;

    for (let attempt = 0; attempt < 4; attempt++) {
      x = (Math.random() * 2 - 1) * this.halfWidth;
      y = (Math.random() * 2 - 1) * this.halfHeight;
      const dx = x - fromX;
      const dy = y - fromY;
      if (dx * dx + dy * dy >= minDistance * minDistance) {
        break;
      }
    }

    return [x, y, (Math.random() * 2 - 1) * 1];
  }

  private updateParticles(delta: number, elapsed: number): void {
    const { driftSpeed, noiseSpaceFrequency: freq, noiseTimeFrequency: timeFreq } = this.config;
    const t = elapsed * timeFreq;
    const positions = this.positions;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      if (this.motionState[i] === ParticleMotionState.Sliding) {
        const progress = (elapsed - this.slideStartTimes[i]) / SLIDE_DURATION_SECONDS;
        if (progress >= 1) {
          positions[idx] = this.slideTargetPositions[idx];
          positions[idx + 1] = this.slideTargetPositions[idx + 1];
          positions[idx + 2] = this.slideTargetPositions[idx + 2];
          this.motionState[i] = ParticleMotionState.Drifting;
        } else {
          const eased = easeInOutCubic(Math.max(0, progress));
          positions[idx] = lerp(
            this.slideStartPositions[idx],
            this.slideTargetPositions[idx],
            eased,
          );
          positions[idx + 1] = lerp(
            this.slideStartPositions[idx + 1],
            this.slideTargetPositions[idx + 1],
            eased,
          );
          positions[idx + 2] = lerp(
            this.slideStartPositions[idx + 2],
            this.slideTargetPositions[idx + 2],
            eased,
          );
        }
        continue;
      }

      const x = positions[idx];
      const y = positions[idx + 1];
      const z = positions[idx + 2];

      // 2 mẫu noise lệch offset lớn cho x/y để 2 thành phần vận tốc không tương quan trực tiếp với
      // nhau (nếu dùng chung 1 mẫu, hạt sẽ luôn di chuyển theo đường chéo cố định thay vì "cuộn"
      // tự nhiên theo trường flow-field).
      const vx = this.noise.noise(x * freq, y * freq, t);
      const vy = this.noise.noise(x * freq + 37.1, y * freq + 37.1, t);
      const vz = this.noise.noise(x * freq + 91.7, y * freq + 91.7, t) * 0.3;

      // + lực đẩy tách hạt (tích luỹ ở frame trước, xem ghi chú tại khai báo separationForceX/Y) —
      // đây là thứ chính giữ 40 hạt dàn trải đều thay vì bị noise cuốn dồn cụm lại 1 vùng theo
      // thời gian.
      let nx = x + (vx * driftSpeed + this.separationForceX[i]) * delta;
      let ny = y + (vy * driftSpeed + this.separationForceY[i]) * delta;
      let nz = z + vz * driftSpeed * delta;

      // Wrap quanh biên viewport — giữ mật độ hạt luôn đều, không bị "trôi hết" ra ngoài theo thời
      // gian và không cần reset đột ngột (reset sẽ gây giật hình).
      if (nx > this.halfWidth) nx -= this.halfWidth * 2;
      else if (nx < -this.halfWidth) nx += this.halfWidth * 2;
      if (ny > this.halfHeight) ny -= this.halfHeight * 2;
      else if (ny < -this.halfHeight) ny += this.halfHeight * 2;
      nz = Math.max(-1, Math.min(1, nz));

      positions[idx] = nx;
      positions[idx + 1] = ny;
      positions[idx + 2] = nz;
    }

    this.particleGeometry.attributes['position'].needsUpdate = true;
  }

  private updateConnections(elapsed: number): void {
    const { connectionDistance, separationDistance, separationStrength, maxConnections } =
      this.config;
    const positions = this.positions;
    const cellSize = Math.max(connectionDistance, 0.01);
    const grid = this.buildSpatialGrid(cellSize, elapsed);

    // Tính lại từ đầu mỗi frame (không cộng dồn qua nhiều frame) — updateParticles() ở đầu tick()
    // của CHÍNH frame này đã đọc và dùng xong giá trị của frame trước rồi, giờ an toàn để reset.
    this.separationForceX.fill(0);
    this.separationForceY.fill(0);

    const maxDistanceSq = connectionDistance * connectionDistance;
    const separationDistanceSq = separationDistance * separationDistance;
    let vertexCount = 0;
    const maxVertices = maxConnections * 2;
    let connectionCapReached = false;

    for (const [key, cell] of grid) {
      const [cx, cy] = key.split(',').map(Number);
      for (let dx = -GRID_CELL_PADDING; dx <= GRID_CELL_PADDING; dx++) {
        for (let dy = -GRID_CELL_PADDING; dy <= GRID_CELL_PADDING; dy++) {
          const neighborKey = `${cx + dx},${cy + dy}`;
          const neighborCell = grid.get(neighborKey);
          if (!neighborCell) {
            continue;
          }

          for (const i of cell.indices) {
            for (const j of neighborCell.indices) {
              if (j <= i) {
                continue;
              }

              const ix = i * 3;
              const jx = j * 3;
              const ddx = positions[ix] - positions[jx];
              const ddy = positions[ix + 1] - positions[jx + 1];
              const ddz = positions[ix + 2] - positions[jx + 2];
              const distSq = ddx * ddx + ddy * ddy + ddz * ddz;
              if (distSq >= maxDistanceSq) {
                continue;
              }

              const dist = Math.sqrt(distSq);

              // Lực đẩy: áp dụng độc lập với việc còn "ngân sách" vẽ đường nối hay không — đây là
              // vật lý giữ hạt dàn đều, không phải hiệu ứng hiển thị nên không được phép bị cap
              // maxConnections chặn giữa chừng.
              if (dist > 0.0001 && distSq < separationDistanceSq) {
                const push = separationStrength * (1 - dist / separationDistance);
                const pushX = (ddx / dist) * push;
                const pushY = (ddy / dist) * push;
                this.separationForceX[i] += pushX;
                this.separationForceY[i] += pushY;
                this.separationForceX[j] -= pushX;
                this.separationForceY[j] -= pushY;
              }

              if (connectionCapReached || vertexCount >= maxVertices) {
                connectionCapReached = true;
                continue;
              }

              const proximity = 1 - dist / connectionDistance;
              this.writeLineVertex(vertexCount, positions, ix, proximity);
              this.writeLineVertex(vertexCount + 1, positions, jx, proximity);
              vertexCount += 2;
            }
          }
        }
      }
    }

    this.lineGeometry.setDrawRange(0, vertexCount);
    this.lineGeometry.attributes['position'].needsUpdate = true;
    this.lineGeometry.attributes['color'].needsUpdate = true;
  }

  private writeLineVertex(
    vertexIndex: number,
    positions: Float32Array,
    sourceIndex: number,
    proximity: number,
  ): void {
    const posIdx = vertexIndex * 3;
    this.linePositions[posIdx] = positions[sourceIndex];
    this.linePositions[posIdx + 1] = positions[sourceIndex + 1];
    this.linePositions[posIdx + 2] = positions[sourceIndex + 2];

    // Đường càng gần thì càng sáng (proximity gần 1), càng xa thì mờ dần về 0 — đúng yêu cầu
    // "mờ dần theo khoảng cách" mà không cần shader riêng, tận dụng vertexColors + additive blending.
    const [r, g, b] = this.lineColorRgb;
    this.lineColors[posIdx] = r * proximity;
    this.lineColors[posIdx + 1] = g * proximity;
    this.lineColors[posIdx + 2] = b * proximity;
  }

  private updateParallax(): void {
    const { parallaxStrength, parallaxDamping } = this.config;
    const targetX = this.pointerX * parallaxStrength;
    const targetY = -this.pointerY * parallaxStrength;

    // Easing (lerp về target mỗi frame với hệ số nhỏ) thay vì gán thẳng toạ độ con trỏ — tạo cảm
    // giác mượt/trễ nhẹ ("phản ứng nhẹ theo parallax, không rung lắc mạnh") thay vì bám chuột cứng.
    this.parallaxX += (targetX - this.parallaxX) * parallaxDamping;
    this.parallaxY += (targetY - this.parallaxY) * parallaxDamping;

    this.camera.position.x = this.parallaxX;
    this.camera.position.y = this.parallaxY;
  }

  private updateViewBounds(width: number, height: number): void {
    const aspect = width / height;
    const viewHeight = this.config.viewHeight;
    this.halfWidth = (viewHeight * aspect) / 2;
    this.halfHeight = viewHeight / 2;
  }

  // Hạt đang bị cô lập (isolatedUntil > elapsed, tức đang trượt hoặc vừa tới nơi) bị loại HẲN khỏi
  // lưới — không hạt nào tìm thấy nó (và nó cũng không tìm thấy ai) cho tới khi hết thời gian cô
  // lập, đúng yêu cầu "mất liên kết" trong lúc di chuyển.
  private buildSpatialGrid(cellSize: number, elapsed: number): Map<string, GridCell> {
    const grid = new Map<string, GridCell>();
    const positions = this.positions;

    for (let i = 0; i < this.particleCount; i++) {
      if (this.isolatedUntil[i] > elapsed) {
        continue;
      }

      const idx = i * 3;
      const cx = Math.floor(positions[idx] / cellSize);
      const cy = Math.floor(positions[idx + 1] / cellSize);
      const key = `${cx},${cy}`;
      const cell = grid.get(key);
      if (cell) {
        cell.indices.push(i);
      } else {
        grid.set(key, { indices: [i] });
      }
    }

    return grid;
  }

  private createParticles(): {
    positions: Float32Array;
    geometry: THREE.BufferGeometry;
    points: THREE.Points;
  } {
    const count = this.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorA = new THREE.Color(this.config.particleColors[0]);
    const colorB = new THREE.Color(this.config.particleColors[1]);
    const mixedColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() * 2 - 1) * this.halfWidth;
      positions[idx + 1] = (Math.random() * 2 - 1) * this.halfHeight;
      positions[idx + 2] = (Math.random() * 2 - 1) * 1;

      mixedColor.copy(colorA).lerp(colorB, Math.random());
      colors[idx] = mixedColor.r;
      colors[idx + 1] = mixedColor.g;
      colors[idx + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: this.config.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { positions, geometry, points: new THREE.Points(geometry, material) };
  }

  private createConnectionLines(): {
    positions: Float32Array;
    colors: Float32Array;
    geometry: THREE.BufferGeometry;
    lines: THREE.LineSegments;
  } {
    const maxVertices = this.config.maxConnections * 2;
    const positions = new Float32Array(maxVertices * 3);
    const colors = new Float32Array(maxVertices * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { positions, colors, geometry, lines: new THREE.LineSegments(geometry, material) };
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
