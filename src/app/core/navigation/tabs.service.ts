import { Injectable, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { BrowserService } from '../browser/browser.service';
import { resolveDeepestRouteSeo } from '../seo/resolve-deepest-route-seo';
import { NavMenuService } from './nav-menu.service';
import { OpenTab } from './open-tab.model';
import { TabRouteReuseStrategy } from './tab-route-reuse.strategy';
import { TABS_ENABLED_DATA_KEY } from './tabs-enabled-route-data';

const STORAGE_KEY = 'app.open_tabs';

// Quản lý danh sách tab kiểu trình duyệt cho Admin Layout — mỗi trang đã ghé qua giữ 1 tab, click
// tab để điều hướng lại. Component instance của từng tab được TabRouteReuseStrategy cache lại khi
// rời tab (xem file đó) — chuyển tab KHÔNG destroy/recreate Component, giữ nguyên scroll/state
// tạm/dữ liệu đã load, không gọi lại API.
@Injectable({ providedIn: 'root' })
export class TabsService {
  private readonly router = inject(Router);
  private readonly browserService = inject(BrowserService);
  private readonly navMenuService = inject(NavMenuService);
  private readonly tabRouteReuseStrategy = inject(TabRouteReuseStrategy);

  readonly tabs = signal<readonly OpenTab[]>(this.restoreTabs());
  readonly activePath = signal(this.router.url);

  // Seed bằng router.url vì service có thể được khởi tạo (lần đầu ai đó inject nó, vd AdminLayout)
  // SAU KHI NavigationEnd đầu tiên đã bắn xong — nếu không sẽ bỏ lỡ tab của trang đang đứng.
  private readonly navigationUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      const url = this.navigationUrl();
      if (!this.isCurrentRouteTabbable()) {
        return;
      }

      const titleKey = resolveDeepestRouteSeo(this.router.routerState.snapshot.root)?.title;
      if (!titleKey) {
        return;
      }

      this.upsertTab(url, titleKey);
      this.activePath.set(url);
    });

    effect(() => {
      this.browserService.setLocalStorageItem(STORAGE_KEY, JSON.stringify(this.tabs()));
    });
  }

  iconFor(path: string): string {
    const flattened = this.navMenuService
      .visibleItems()
      .flatMap((item) => [item, ...(item.children ?? [])]);

    const match = flattened
      .filter((item) => path === item.route || path.startsWith(`${item.route}/`))
      .sort((a, b) => b.route.length - a.route.length)[0];

    return match?.icon ?? 'file';
  }

  activate(path: string): void {
    if (path === this.activePath()) {
      return;
    }
    void this.router.navigateByUrl(path);
  }

  close(path: string): void {
    const currentTabs = this.tabs();
    const closingIndex = currentTabs.findIndex((tab) => tab.path === path);
    if (closingIndex === -1) {
      return;
    }

    const remaining = currentTabs.filter((tab) => tab.path !== path);
    // Luôn giữ lại ít nhất 1 tab — không cho đóng hết để tránh màn hình trắng không lối thoát.
    if (remaining.length === 0) {
      return;
    }

    // Bỏ cache của tab vừa đóng — không thì rò rỉ RAM/subscription (component bị đóng nhưng vẫn
    // sống trong TabRouteReuseStrategy mãi mãi vì không còn ai gọi evict() cho nó nữa).
    this.tabRouteReuseStrategy.evict(path);
    this.tabs.set(remaining);

    if (path !== this.activePath()) {
      return;
    }

    // Trượt sang tab liền kề còn lại (giống hành vi đóng tab trình duyệt): ưu tiên tab bên phải vừa
    // trượt vào đúng vị trí tab bị đóng, hết thì lấy tab cuối cùng còn lại. bypassCacheFor: tab đang
    // active vừa bị đóng chưa nằm trong cache (chỉ tab KHÔNG active mới bị detach+lưu) — không chặn
    // thì Angular sẽ tự detach+lưu lại nó ngay trong lượt điều hướng rời đi này, âm thầm phá vỡ
    // evict() vừa gọi ở trên.
    const fallbackIndex = Math.min(closingIndex, remaining.length - 1);
    this.tabRouteReuseStrategy.bypassCacheFor(path);
    void this.router
      .navigateByUrl(remaining[fallbackIndex].path)
      .finally(() => this.tabRouteReuseStrategy.clearBypass());
  }

  closeOthers(path: string): void {
    const currentTabs = this.tabs();
    const keep = currentTabs.find((tab) => tab.path === path);
    if (!keep) {
      return;
    }

    for (const tab of currentTabs) {
      if (tab.path !== path) {
        this.tabRouteReuseStrategy.evict(tab.path);
      }
    }

    this.tabs.set([keep]);
    this.activate(path);
  }

  closeAll(): void {
    const activePath = this.activePath();
    this.tabRouteReuseStrategy.evictAll();
    this.tabs.set([]);

    // '/' luôn redirect về trang mặc định (xem routes/app.routes.ts) — không hardcode 1 feature cụ
    // thể ở đây để TabsService không phụ thuộc ngược vào route nghiệp vụ nào. bypassCacheFor: xem
    // giải thích ở close() — tab đang active cũng phải bị chặn không cho lọt lại vào cache.
    this.tabRouteReuseStrategy.bypassCacheFor(activePath);
    void this.router.navigateByUrl('/').finally(() => this.tabRouteReuseStrategy.clearBypass());
  }

  refresh(path: string): void {
    if (path !== this.activePath()) {
      this.activate(path);
      return;
    }

    // Router mặc định coi "điều hướng tới đúng URL hiện tại" là giữ nguyên component đang sống
    // (không destroy) — bypassCacheFor ép TabRouteReuseStrategy trả false cho đúng path này trong
    // đúng 1 lượt điều hướng, để component thực sự bị destroy/recreate (gọi lại API), không đổi
    // hành vi các điều hướng khác.
    this.tabRouteReuseStrategy.bypassCacheFor(path);
    void this.router
      .navigateByUrl(path, { onSameUrlNavigation: 'reload' })
      .finally(() => this.tabRouteReuseStrategy.clearBypass());
  }

  private isCurrentRouteTabbable(): boolean {
    let current: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (current) {
      if (current.data[TABS_ENABLED_DATA_KEY] === true) {
        return true;
      }
      current = current.firstChild;
    }
    return false;
  }

  private upsertTab(path: string, titleKey: string): void {
    this.tabs.update((tabs) => {
      const existingIndex = tabs.findIndex((tab) => tab.path === path);
      if (existingIndex === -1) {
        return [...tabs, { path, titleKey }];
      }
      if (tabs[existingIndex].titleKey === titleKey) {
        return tabs;
      }
      const next = [...tabs];
      next[existingIndex] = { path, titleKey };
      return next;
    });
  }

  private restoreTabs(): readonly OpenTab[] {
    const raw = this.browserService.getLocalStorageItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(
        (item): item is OpenTab =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as OpenTab).path === 'string' &&
          typeof (item as OpenTab).titleKey === 'string',
      );
    } catch {
      return [];
    }
  }
}
