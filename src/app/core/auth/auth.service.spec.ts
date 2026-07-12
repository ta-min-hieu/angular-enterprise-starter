import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ApiService } from '../http/api.service';
import { TOKEN_STORAGE, TokenStorage } from '../storage/token-storage';
import { AppConfigService } from '../config/app-config.service';
import { LoggerService } from '../logger/logger.service';
import { AuthTokens } from './current-user.model';

function createFakeJwt(payload: Record<string, unknown>): string {
  const base64url = (value: string): string =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const header = base64url(JSON.stringify({ alg: 'RS512' }));
  const body = base64url(JSON.stringify(payload));

  return `${header}.${body}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let apiService: { post: ReturnType<typeof vi.fn> };
  let tokenStorage: TokenStorage;
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  const tokens: AuthTokens = {
    accessToken: createFakeJwt({ sub: 'alice', roles: ['USER'] }),
    refreshToken: 'refresh-token',
  };

  beforeEach(() => {
    apiService = { post: vi.fn() };
    router = { navigateByUrl: vi.fn() };

    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    tokenStorage = {
      getAccessToken: () => accessToken,
      setAccessToken: (token: string) => (accessToken = token),
      getRefreshToken: () => refreshToken,
      setRefreshToken: (token: string) => (refreshToken = token),
      clear: () => {
        accessToken = null;
        refreshToken = null;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiService },
        { provide: TOKEN_STORAGE, useValue: tokenStorage },
        { provide: Router, useValue: router },
        {
          provide: AppConfigService,
          useValue: { config: () => ({ authRedirectPath: '/auth/login' }) },
        },
        { provide: LoggerService, useValue: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be unauthenticated with no stored access token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should store session and derive currentUser from the access token payload after login', () => {
    apiService.post.mockReturnValue(of(tokens));

    service.login({ username: 'alice', password: 'secret' }).subscribe();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({
      id: 'alice',
      username: 'alice',
      roles: ['USER'],
      permissions: [],
    });
    expect(tokenStorage.getAccessToken()).toBe(tokens.accessToken);
  });

  it('should call the refresh-token endpoint with the stored refresh token', () => {
    apiService.post.mockReturnValue(of(tokens));

    service.refreshToken().subscribe();

    expect(apiService.post).toHaveBeenCalledWith(
      'auth/refresh-token',
      { refreshToken: null },
      expect.anything(),
    );
  });

  it('should dedupe concurrent refreshToken() calls into a single HTTP request', () => {
    const pending = new Subject<AuthTokens>();
    apiService.post.mockReturnValue(pending.asObservable());

    let firstResult: unknown;
    let secondResult: unknown;
    service.refreshToken().subscribe((user) => (firstResult = user));
    service.refreshToken().subscribe((user) => (secondResult = user));

    pending.next(tokens);
    pending.complete();

    expect(apiService.post).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual({
      id: 'alice',
      username: 'alice',
      roles: ['USER'],
      permissions: [],
    });
    expect(secondResult).toEqual(firstResult);
  });

  it('should logout and redirect to configured authRedirectPath when refresh fails', () => {
    apiService.post.mockReturnValue(throwError(() => new Error('refresh failed')));

    service.handleUnauthorized().subscribe({ error: () => undefined });

    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should reflect permissions and roles of the current user', () => {
    apiService.post.mockReturnValue(of(tokens));

    service.login({ username: 'alice', password: 'secret' }).subscribe();

    expect(service.hasRole('USER')).toBe(true);
    expect(service.hasRole('ADMIN')).toBe(false);
    expect(service.hasPermission('user.read')).toBe(false);
  });
});
