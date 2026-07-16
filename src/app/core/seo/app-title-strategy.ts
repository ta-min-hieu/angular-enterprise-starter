import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from './seo.service';
import { SeoRouteData } from './seo-route-data.model';

// Thay DefaultTitleStrategy (chỉ set document.title từ Route.title tĩnh) — Router tự gọi
// updateTitle() sau MỖI lần điều hướng thành công, nên đây là 1 điểm hook DUY NHẤT, không cần
// subscribe Router.events thủ công ở AppComponent. Route data dùng key i18n (route.title của
// Angular chỉ nhận string tĩnh hoặc ResolveFn, không tự dịch được theo ngôn ngữ đang active).
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly seoService = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const data = this.resolveSeoData(snapshot.root);
    if (data) {
      this.seoService.apply(data);
    }
  }

  // route con lồng nhau (layout -> feature route -> page) đều có thể khai báo `data.seo` — lấy
  // của route lá sâu nhất (khớp đúng trang đang hiển thị), route cha không khai báo thì bỏ qua.
  private resolveSeoData(route: ActivatedRouteSnapshot): SeoRouteData | undefined {
    let current: ActivatedRouteSnapshot | null = route;
    let result: SeoRouteData | undefined;

    while (current) {
      const seo = current.data['seo'] as SeoRouteData | undefined;
      if (seo) {
        result = seo;
      }
      current = current.firstChild;
    }

    return result;
  }
}
