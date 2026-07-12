import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ApiService } from '../http/api.service';
import { TOKEN_STORAGE, TokenStorage } from '../storage/token-storage';
import { AppConfigService } from '../config/app-config.service';
import { LoggerService } from '../logger/logger.service';
import { AuthSession } from './current-user.model';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: { post: ReturnType<typeof vi.fn> };
  let tokenStorage: TokenStorage;
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  const session: AuthSession = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: { id: '1', username: 'alice', roles: ['admin'], permissions: ['user.read'] },
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

  it('should store session and expose currentUser after login', () => {
    apiService.post.mockReturnValue(of(session));

    service.login({ username: 'alice', password: 'secret' }).subscribe();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(session.user);
    expect(tokenStorage.getAccessToken()).toBe('access-token');
  });

  it('should dedupe concurrent refreshToken() calls into a single HTTP request', () => {
    const pending = new Subject<AuthSession>();
    apiService.post.mockReturnValue(pending.asObservable());

    let firstResult: AuthSession | undefined;
    let secondResult: AuthSession | undefined;
    service.refreshToken().subscribe((user) => (firstResult = user as unknown as AuthSession));
    service.refreshToken().subscribe((user) => (secondResult = user as unknown as AuthSession));

    pending.next(session);
    pending.complete();

    expect(apiService.post).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual(session.user);
    expect(secondResult).toEqual(session.user);
  });

  it('should logout and redirect to configured authRedirectPath when refresh fails', () => {
    apiService.post.mockReturnValue(throwError(() => new Error('refresh failed')));

    service.handleUnauthorized().subscribe({ error: () => undefined });

    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should reflect permissions and roles of the current user', () => {
    apiService.post.mockReturnValue(of(session));

    service.login({ username: 'alice', password: 'secret' }).subscribe();

    expect(service.hasRole('admin')).toBe(true);
    expect(service.hasPermission('user.read')).toBe(true);
    expect(service.hasPermission('user.delete')).toBe(false);
  });
});
