import { Injectable, effect, inject, signal } from '@angular/core';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { BrowserService } from '../browser/browser.service';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app.theme';
const DARK_STYLESHEET_ID = 'nz-dark-theme';
const DARK_STYLESHEET_HREF = 'ng-zorro-antd.dark.min.css';
const NZ_COLOR_VARIABLES: Record<string, string> = {
  primaryColor: '--color-primary',
  successColor: '--color-success',
  warningColor: '--color-warning',
  errorColor: '--color-danger',
  infoColor: '--color-info',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly browserService = inject(BrowserService);
  private readonly nzConfigService = inject(NzConfigService);

  private readonly themeSignal = signal<ThemeMode>(this.resolveInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    effect(() => {
      this.applyTheme(this.themeSignal());
    });
  }

  setTheme(theme: ThemeMode): void {
    this.themeSignal.set(theme);
  }

  toggle(): void {
    this.themeSignal.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  private resolveInitialTheme(): ThemeMode {
    const stored = this.browserService.getLocalStorageItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    const window = this.browserService.getWindow();
    if (
      typeof window?.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    const document = this.browserService.getDocument();
    if (!document) {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    this.browserService.setLocalStorageItem(THEME_STORAGE_KEY, theme);
    this.toggleDarkStylesheet(document, theme);

    const computedStyle = this.browserService
      .getWindow()
      ?.getComputedStyle(document.documentElement);
    if (!computedStyle) {
      return;
    }

    const nzTheme = Object.fromEntries(
      Object.entries(NZ_COLOR_VARIABLES).map(([nzKey, cssVar]) => [
        nzKey,
        computedStyle.getPropertyValue(cssVar).trim(),
      ]),
    );

    this.nzConfigService.set('theme', nzTheme);
  }

  private toggleDarkStylesheet(document: Document, theme: ThemeMode): void {
    const existing = document.getElementById(DARK_STYLESHEET_ID);

    if (theme === 'dark') {
      if (existing) {
        return;
      }

      const link = document.createElement('link');
      link.id = DARK_STYLESHEET_ID;
      link.rel = 'stylesheet';
      link.href = DARK_STYLESHEET_HREF;
      document.head.appendChild(link);
      return;
    }

    existing?.remove();
  }
}
