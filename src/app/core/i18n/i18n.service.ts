import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
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

  setLocale(code: string): void {
    this.translocoService.setActiveLang(code);
    this.browserService.setLocalStorageItem(LOCALE_STORAGE_KEY, code);
  }

  translate(key: string, params?: Record<string, unknown>): string {
    this.locale();
    return this.translocoService.translate(key, params);
  }

  resolveInitialLocale(defaultLocale: string): string {
    const stored = this.browserService.getLocalStorageItem(LOCALE_STORAGE_KEY);
    const isSupported = this.availableLocales.some((locale) => locale.code === stored);
    return isSupported && stored ? stored : defaultLocale;
  }
}
