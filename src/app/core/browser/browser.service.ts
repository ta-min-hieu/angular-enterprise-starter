import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class BrowserService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  getWindow(): Window | null {
    return this.isBrowser ? window : null;
  }

  getDocument(): Document | null {
    return this.isBrowser ? document : null;
  }

  getLocalStorageItem(key: string): string | null {
    return this.isBrowser ? window.localStorage.getItem(key) : null;
  }

  setLocalStorageItem(key: string, value: string): void {
    if (this.isBrowser) {
      window.localStorage.setItem(key, value);
    }
  }

  removeLocalStorageItem(key: string): void {
    if (this.isBrowser) {
      window.localStorage.removeItem(key);
    }
  }

  getSessionStorageItem(key: string): string | null {
    return this.isBrowser ? window.sessionStorage.getItem(key) : null;
  }

  setSessionStorageItem(key: string, value: string): void {
    if (this.isBrowser) {
      window.sessionStorage.setItem(key, value);
    }
  }

  removeSessionStorageItem(key: string): void {
    if (this.isBrowser) {
      window.sessionStorage.removeItem(key);
    }
  }

  navigateTo(url: string): void {
    if (this.isBrowser) {
      window.location.href = url;
    }
  }

  reload(): void {
    if (this.isBrowser) {
      window.location.reload();
    }
  }

  getUserAgent(): string | null {
    return this.isBrowser ? window.navigator.userAgent : null;
  }

  isOnline(): boolean {
    return this.isBrowser ? window.navigator.onLine : true;
  }
}
