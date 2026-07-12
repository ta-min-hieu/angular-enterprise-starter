import { Injectable, inject } from '@angular/core';
import { BrowserService } from '../browser/browser.service';
import { TokenStorage } from './token-storage';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

@Injectable({ providedIn: 'root' })
export class LocalTokenStorage implements TokenStorage {
  private readonly browserService = inject(BrowserService);

  getAccessToken(): string | null {
    return this.browserService.getLocalStorageItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    this.browserService.setLocalStorageItem(ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return this.browserService.getLocalStorageItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    this.browserService.setLocalStorageItem(REFRESH_TOKEN_KEY, token);
  }

  clear(): void {
    this.browserService.removeLocalStorageItem(ACCESS_TOKEN_KEY);
    this.browserService.removeLocalStorageItem(REFRESH_TOKEN_KEY);
  }
}
