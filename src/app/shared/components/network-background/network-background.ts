import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { BrowserService } from '../../../core/browser/browser.service';
import {
  DEFAULT_NETWORK_BACKGROUND_CONFIG,
  NetworkBackgroundConfig,
} from './network-background.config';
import { NetworkBackgroundEngine } from './network-background-engine';

// Background toàn màn hình mô phỏng mạng lưới AI (particles + đường nối + bloom), dựng bằng
// Three.js. Chỉ mang tính trang trí ở phần host (aria-hidden trên canvas, pointer-events: none ở
// :host) — không cản trở đọc/tương tác với nội dung phía trước; riêng bản thân canvas bật lại
// pointer-events để bắt được click tương tác với hạt (xem network-background.scss). Toàn bộ
// animation/WebGL nằm ở NetworkBackgroundEngine (thuần TypeScript, tách khỏi Angular) — component
// này chỉ lo vòng đời (tạo/huỷ engine đúng lúc) và các sự kiện DOM (resize, di chuyển con trỏ, click).
//
// Nơi dùng nên bọc bằng `@defer (on immediate)`: nặng (Three.js) và chỉ có ý nghĩa ở trình duyệt —
// @defer tự tách thành lazy chunk riêng và không render nội dung deferred lúc SSR/prerender.
@Component({
  selector: 'app-network-background',
  templateUrl: './network-background.html',
  host: { class: 'absolute inset-0 block overflow-hidden pointer-events-none' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkBackground implements OnDestroy {
  private readonly browserService = inject(BrowserService);

  readonly config = input<Partial<NetworkBackgroundConfig>>({});

  private readonly resolvedConfig = computed<NetworkBackgroundConfig>(() => ({
    ...DEFAULT_NETWORK_BACKGROUND_CONFIG,
    ...this.config(),
  }));

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private engine: NetworkBackgroundEngine | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private canvasEl: HTMLCanvasElement | null = null;

  constructor() {
    // afterNextRender: chỉ chạy ở trình duyệt (no-op lúc SSR) và đảm bảo view (canvas) đã gắn vào
    // DOM thật, đọc được clientWidth/clientHeight chính xác — đúng use case được Angular khuyến
    // nghị cho việc khởi tạo thư viện DOM/WebGL bên thứ ba.
    afterNextRender(() => this.setupEngine());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.engine?.dispose();
    if (this.browserService.isBrowser) {
      window.removeEventListener('pointermove', this.onPointerMove);
      this.canvasEl?.removeEventListener('click', this.onCanvasClick);
    }
  }

  private setupEngine(): void {
    const canvas = this.canvasRef().nativeElement;
    this.canvasEl = canvas;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const engine = new NetworkBackgroundEngine(canvas, this.resolvedConfig(), width, height);
    this.engine = engine;
    engine.start();

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    canvas.addEventListener('click', this.onCanvasClick);

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width: w, height: h } = entry.contentRect;
      engine.resize(w, h);
    });
    this.resizeObserver.observe(canvas);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    this.engine?.setPointer(x, y);
  };

  // Toạ độ click chuẩn hoá theo CHÍNH canvas (getBoundingClientRect), không phải window — raycast
  // trong engine cần NDC khớp đúng camera/viewport của canvas, khác với parallax (dùng toàn màn hình).
  private readonly onCanvasClick = (event: MouseEvent): void => {
    if (!this.canvasEl) {
      return;
    }
    const rect = this.canvasEl.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this.engine?.handleClick(x, y);
  };
}
