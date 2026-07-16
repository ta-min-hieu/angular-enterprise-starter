import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ApiService } from '../http/api.service';
import { TOKEN_STORAGE, TokenStorage } from '../storage/token-storage';
import { AppConfigService } from '../config/app-config.service';
import { LoggerService } from '../logger/logger.service';
import { AuthTokens } from './current-user.model';

function createFakeJwt(payload: Record<string, unknown>): string {
  const base64url = (value: string): string =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const header = base64url(JSON.stringify({ alg: 'RS256' }));
  const body = base64url(JSON.stringify(payload));

  return `${header}.${body}.signature`;
}

function createTokenStorage(initialAccessToken: string | null = null): TokenStorage {
  let accessToken = initialAccessToken;
  let refreshToken: string | null = null;
  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token: string) => (accessToken = token),
    getRefreshToken: () => refreshToken,
    setRefreshToken: (token: string) => (refreshToken = token),
    clear: () => {
      accessToken = null;
      refreshToken = null;
    },
  };
}

describe('AuthService', () => {
  let apiService: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  const tokens: AuthTokens = {
    accessToken: createFakeJwt({
      sub: 'a1b2c3',
      preferred_username: 'qa_admin',
      realm_access: { roles: ['ADMIN'] },
    }),
    refreshToken: 'refresh-token',
  };

  function setup(tokenStorage: TokenStorage = createTokenStorage()) {
    apiService = { post: vi.fn(), get: vi.fn().mockReturnValue(of([])) };
    router = { navigateByUrl: vi.fn() };

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

    return { service: TestBed.inject(AuthService), tokenStorage };
  }

  it('should be unauthenticated with no stored access token', () => {
    const { service } = setup();

    expect(service.isAuthenticated()).toBe(false);
  });

  it('should post to v2/auth/login and derive currentUser from the Keycloak token payload', () => {
    const { service, tokenStorage } = setup();
    apiService.post.mockReturnValue(of(tokens));

    service.login({ username: 'qa_admin', password: 'secret' }).subscribe();

    expect(apiService.post).toHaveBeenCalledWith(
      'v2/auth/login',
      { username: 'qa_admin', password: 'secret' },
      expect.anything(),
    );
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({
      id: 'a1b2c3',
      username: 'qa_admin',
      roles: ['ADMIN'],
      permissions: [],
    });
    expect(tokenStorage.getAccessToken()).toBe(tokens.accessToken);
  });

  it('should fall back to sub as username when the token has no preferred_username claim', () => {
    const { service } = setup();
    apiService.post.mockReturnValue(
      of({
        accessToken: createFakeJwt({ sub: 'a1b2c3', realm_access: { roles: [] } }),
        refreshToken: 'r',
      }),
    );

    service.login({ username: 'x', password: 'y' }).subscribe();

    expect(service.currentUser()?.username).toBe('a1b2c3');
  });

  it('should populate permissions from GET rbac/me/permissions after login', () => {
    const { service } = setup();
    apiService.post.mockReturnValue(of(tokens));
    apiService.get.mockReturnValue(
      of([{ code: 'user.read', httpMethod: 'GET', urlPattern: '/v1/users/**' }]),
    );

    service.login({ username: 'qa_admin', password: 'secret' }).subscribe();

    expect(apiService.get).toHaveBeenCalledWith('rbac/me/permissions');
    expect(service.currentUser()?.permissions).toEqual(['user.read']);
    expect(service.hasPermission('user.read')).toBe(true);
  });

  it('should restore currentUser from a stored token on construction (e.g. page reload)', () => {
    const { service } = setup(createTokenStorage(tokens.accessToken));

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.roles).toEqual(['ADMIN']);
    expect(apiService.get).toHaveBeenCalledWith('rbac/me/permissions');
  });

  it('should clear an expired stored token on construction instead of restoring a session from it', () => {
    const expiredToken = createFakeJwt({
      sub: 'a1b2c3',
      preferred_username: 'qa_admin',
      realm_access: { roles: ['ADMIN'] },
      exp: Math.floor(Date.now() / 1000) - 3600,
    });
    const { service, tokenStorage } = setup(createTokenStorage(expiredToken));

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('should clear a malformed stored token on construction instead of throwing', () => {
    const { service, tokenStorage } = setup(createTokenStorage('not-a-jwt'));

    expect(service.isAuthenticated()).toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('should call v2/auth/refresh-token with the stored refresh token and apply the new session', () => {
    const { service, tokenStorage } = setup();
    apiService.post.mockReturnValue(of(tokens));

    service.refreshToken().subscribe();

    expect(apiService.post).toHaveBeenCalledWith(
      'v2/auth/refresh-token',
      { refreshToken: null },
      expect.anything(),
    );
    expect(tokenStorage.getAccessToken()).toBe(tokens.accessToken);
    expect(tokenStorage.getRefreshToken()).toBe(tokens.refreshToken);
  });

  it('should dedupe concurrent refreshToken() calls into a single HTTP request', () => {
    const { service } = setup();
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
      id: 'a1b2c3',
      username: 'qa_admin',
      roles: ['ADMIN'],
      permissions: [],
    });
    expect(secondResult).toEqual(firstResult);
  });

  it('should logout and redirect to configured authRedirectPath when handleUnauthorized fails to refresh', () => {
    const { service } = setup();
    apiService.post.mockReturnValue(throwError(() => new Error('refresh failed')));

    service.handleUnauthorized().subscribe({ error: () => undefined });

    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should clear the session and redirect to authRedirectPath on logout', () => {
    const { service, tokenStorage } = setup();
    apiService.post.mockReturnValue(of(tokens));
    service.login({ username: 'qa_admin', password: 'secret' }).subscribe();

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should reflect roles of the current user', () => {
    const { service } = setup();
    apiService.post.mockReturnValue(of(tokens));

    service.login({ username: 'qa_admin', password: 'secret' }).subscribe();

    expect(service.hasRole('ADMIN')).toBe(true);
    expect(service.hasRole('USER')).toBe(false);
  });

  it('should match hasAnyRole when the user has at least one of the given roles', () => {
    const { service } = setup();
    apiService.post.mockReturnValue(of(tokens));

    service.login({ username: 'qa_admin', password: 'secret' }).subscribe();

    expect(service.hasAnyRole(['ADMIN', 'USER'])).toBe(true);
    expect(service.hasAnyRole(['USER', 'MANAGER'])).toBe(false);
    expect(service.hasAnyRole([])).toBe(false);
  });
});
