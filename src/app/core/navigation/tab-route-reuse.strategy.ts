import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { TABS_ENABLED_DATA_KEY } from './tabs-enabled-route-data';

// Cache Component của trang lá (KHÔNG cache node trung gian: Admin Layout, route rỗng pass-through)
// khi rời 1 tab, để quay lại tab đó KHÔNG destroy/recreate Component -> giữ nguyên scroll/state tạm/
// dữ liệu đã load, không gọi lại API. Chỉ áp dụng cho route nằm trong Admin Layout (đánh dấu qua
// data.tabsEnabled, xem routes/app.routes.ts) — route một lần (auth, forbidden...) vẫn dùng hành vi
// mặc định của Angular (destroy hẳn khi rời đi).
//
// Đăng ký qua { provide: RouteReuseStrategy, useExisting: TabRouteReuseStrategy } (app.config.ts) —
// PHẢI dùng useExisting (không phải useClass) để TabsService thao tác đúng 1 instance DUY NHẤT với
// Router, không tạo ra 2 cache lệch nhau.
@Injectable({ providedIn: 'root' })
export class TabRouteReuseStrategy extends RouteReuseStrategy {
  private readonly stored = new Map<string, DetachedRouteHandle>();

  // Path đang bị "bỏ qua cache" cho ĐÚNG 1 lượt điều hướng rời khỏi nó (xem bypassCacheFor) — dùng
  // khi TabsService chủ động đóng tab đó (không muốn giữ lại) hoặc làm mới nó (muốn tạo instance
  // mới hoàn toàn), tránh việc nó bị detach+store lại vào cache ngay trong chính lượt điều hướng đó.
  private bypassCacheKey: string | null = null;

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const key = this.keyFor(route);
    return key !== null && key !== this.bypassCacheKey;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.keyFor(route);
    if (!key) {
      return;
    }
    if (handle) {
      this.stored.set(key, handle);
    } else {
      // Router tự gọi store(route, null) ngay sau khi retrieve() để "lấy ra khỏi kho" — dọn theo.
      this.stored.delete(key);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.keyFor(route);
    return key !== null && this.stored.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.keyFor(route);
    return key ? (this.stored.get(key) ?? null) : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const key = this.keyFor(curr);
    if (key && key === this.bypassCacheKey) {
      return false;
    }
    return future.routeConfig === curr.routeConfig;
  }

  // Route mặc định của Angular coi "điều hướng tới đúng URL đang đứng" là giữ nguyên Component sống
  // (không destroy) — cần chặn đúng 1 lần để TabsService.refresh() thực sự tạo instance mới.
  bypassCacheFor(path: string): void {
    this.bypassCacheKey = path;
  }

  clearBypass(): void {
    this.bypassCacheKey = null;
  }

  // Đóng tab thì bỏ luôn cache của nó — không cache thì không tốn RAM, và Angular KHÔNG tự gọi
  // ngOnDestroy cho Component đã detach (RouteReuseStrategy không có hook "destroy" ở API public),
  // nên phải tự gọi componentRef.destroy() để dọn subscription/effect còn sống trong Component đó.
  evict(path: string): void {
    this.destroyHandle(this.stored.get(path));
    this.stored.delete(path);
  }

  evictAll(): void {
    for (const handle of this.stored.values()) {
      this.destroyHandle(handle);
    }
    this.stored.clear();
  }

  private destroyHandle(handle: DetachedRouteHandle | undefined): void {
    // DetachedRouteHandle là type rỗng ({}) ở API public — shape thật { componentRef, route,
    // contexts } thuộc phần nội bộ ổn định của Angular Router (bắt buộc phải dùng để dọn Component
    // đã detach, không có API public thay thế; cùng cách ng-alain reuse-tab và các implementation
    // RouteReuseStrategy có cache thật khác đang làm).
    (
      handle as unknown as { componentRef?: { destroy(): void } } | undefined
    )?.componentRef?.destroy();
  }

  private keyFor(route: ActivatedRouteSnapshot): string | null {
    if (route.children.length > 0) {
      return null;
    }

    const isTabbable = route.pathFromRoot.some((node) => node.data[TABS_ENABLED_DATA_KEY] === true);
    if (!isTabbable) {
      return null;
    }

    const segments = route.pathFromRoot.flatMap((node) => node.url).map((segment) => segment.path);
    return segments.length ? `/${segments.join('/')}` : null;
  }
}
