import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from './seo.service';
import { resolveDeepestRouteSeo } from './resolve-deepest-route-seo';

// Thay DefaultTitleStrategy (chỉ set document.title từ Route.title tĩnh) — Router tự gọi
// updateTitle() sau MỖI lần điều hướng thành công, nên đây là 1 điểm hook DUY NHẤT, không cần
// subscribe Router.events thủ công ở AppComponent. Route data dùng key i18n (route.title của
// Angular chỉ nhận string tĩnh hoặc ResolveFn, không tự dịch được theo ngôn ngữ đang active).
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly seoService = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const data = resolveDeepestRouteSeo(snapshot.root);
    if (data) {
      this.seoService.apply(data);
    }
  }
}
