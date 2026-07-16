import { Injectable, effect, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, map } from 'rxjs';
import { BrowserService } from '../browser/browser.service';
import { LocaleOption } from './locale-option.model';

const LOCALE_STORAGE_KEY = 'app.locale';

export const AVAILABLE_LOCALES: readonly LocaleOption[] = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translocoService = inject(TranslocoService);
  private readonly browserService = inject(BrowserService);

  readonly locale = this.translocoService.activeLang;
  readonly availableLocales = AVAILABLE_LOCALES;

  constructor() {
    // <html lang> phải khớp ngôn ngữ nội dung thật (SEO + accessibility — vd screen reader chọn
    // giọng đọc theo attribute này). Chỉ chạy ở browser (getDocument() null lúc SSR/prerender) —
    // index.html đã hardcode sẵn lang="vi" khớp DEFAULT_LOCALE (i18n.initializer.ts) cho lượt
    // render tĩnh đầu tiên; effect này chỉ cần lo phần đổi ngôn ngữ SAU đó tại client (user bấm
    // LanguageSwitcher, hoặc locale khôi phục từ localStorage khác 'vi').
    effect(() => {
      const document = this.browserService.getDocument();
      if (document) {
        document.documentElement.lang = this.locale();
      }
    });
  }

  setLocale(code: string): void {
    this.translocoService.setActiveLang(code);
    this.browserService.setLocalStorageItem(LOCALE_STORAGE_KEY, code);
  }

  translate(key: string, params?: Record<string, unknown>): string {
    this.locale();
    return this.translocoService.translate(key, params);
  }

  // translate() trả về key thô nếu bản dịch của locale() hiện tại CHƯA tải xong (vd vừa đổi ngôn
  // ngữ) — dùng cho code KHÔNG phải template binding (template tự an toàn nhờ pipe transloco tự
  // đợi), như SeoService set Title/Meta: đợi load() (cached, trả ngay nếu đã có) rồi mới translate().
  whenReady(): Observable<void> {
    return this.translocoService.load(this.locale()).pipe(map(() => undefined));
  }

  resolveInitialLocale(defaultLocale: string): string {
    const stored = this.browserService.getLocalStorageItem(LOCALE_STORAGE_KEY);
    const isSupported = this.availableLocales.some((locale) => locale.code === stored);
    return isSupported && stored ? stored : defaultLocale;
  }
}
