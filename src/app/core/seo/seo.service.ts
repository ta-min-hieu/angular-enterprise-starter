import { Injectable, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { I18nService } from '../i18n/i18n.service';
import { SeoRouteData } from './seo-route-data.model';

const APP_NAME = 'Angular Enterprise Starter';

// Wrapper mỏng quanh Title/Meta của Angular — nơi duy nhất gọi trực tiếp 2 service này, cùng
// nguyên tắc với NotificationService (xem core/notification/notification.service.ts). Cả Title lẫn
// Meta đều là API platform-agnostic (chạy đúng trong SSR/SSG lẫn CSR), không cần BrowserService.
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18nService = inject(I18nService);

  private currentData: SeoRouteData | null = null;

  constructor() {
    // Đổi ngôn ngữ qua LanguageSwitcher KHÔNG tạo NavigationEnd mới nên AppTitleStrategy (chỉ chạy
    // sau điều hướng) không tự gọi lại apply() — effect này áp lại đúng route data đang active mỗi
    // khi locale đổi, để title/meta luôn khớp ngôn ngữ hiện tại thay vì đứng yên ở ngôn ngữ lúc
    // điều hướng gần nhất (như mọi nội dung khác trong template qua pipe transloco).
    effect(() => {
      this.i18nService.locale();
      const data = this.currentData;
      if (data) {
        this.i18nService.whenReady().subscribe(() => this.applyTags(data));
      }
    });
  }

  apply(data: SeoRouteData): void {
    this.currentData = data;
    this.i18nService.whenReady().subscribe(() => this.applyTags(data));
  }

  private applyTags(data: SeoRouteData): void {
    const title = this.i18nService.translate(data.title);
    const fullTitle = `${title} · ${APP_NAME}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ property: 'og:title', content: fullTitle });

    // Không set description/OG cho trang không khai báo — phần lớn route trong app này là Admin
    // CRUD sau đăng nhập, không có gì đáng để mô tả cho search engine/link preview (xem
    // docs/06-rendering-strategy.md § CSR: "không cần SEO"). Giữ nguyên tag description mặc định
    // từ lần set gần nhất thay vì xoá, để tránh nháy nội dung rỗng giữa 2 lần điều hướng.
    if (!data.description) {
      return;
    }

    const description = this.i18nService.translate(data.description);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
