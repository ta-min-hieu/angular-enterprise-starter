import { ActivatedRouteSnapshot } from '@angular/router';
import { SeoRouteData } from './seo-route-data.model';

// Route con lồng nhau (layout -> feature route -> page) đều có thể khai báo `data.seo` — lấy của
// route lá sâu nhất (khớp đúng trang đang hiển thị), route cha không khai báo thì bỏ qua. Dùng
// chung cho AppTitleStrategy (document.title) và TabsService (nhãn tab trên tab bar).
export function resolveDeepestRouteSeo(route: ActivatedRouteSnapshot): SeoRouteData | undefined {
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
