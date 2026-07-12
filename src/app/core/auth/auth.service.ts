import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { ApiService } from '../http/api.service';
import { SKIP_AUTH } from '../http/http-context-tokens';
import { TOKEN_STORAGE } from '../storage/token-storage';
import { AppConfigService } from '../config/app-config.service';
import { LoggerService } from '../logger/logger.service';
import { AuthSession, Credentials, CurrentUser } from './current-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly tokenStorage = inject(TOKEN_STORAGE);
  private readonly appConfigService = inject(AppConfigService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  private readonly accessTokenSignal = signal<string | null>(this.tokenStorage.getAccessToken());
  private readonly currentUserSignal = signal<CurrentUser | null>(null);
  private refreshInFlight$: Observable<CurrentUser> | null = null;

  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  login(credentials: Credentials): Observable<CurrentUser> {
    return this.apiService
      .post<AuthSession>('auth/login', credentials, { context: this.skipAuthContext() })
      .pipe(
        tap((session) => this.applySession(session)),
        map((session) => session.user),
      );
  }

  /** Tạm dùng khi chưa có API `auth/login`; chấp nhận mọi tài khoản để mở đường vào UI. */
  loginWithoutBackend(username: string): void {
    this.applySession({
      accessToken: `local-${username}`,
      refreshToken: `local-${username}`,
      user: { id: username, username, roles: ['admin'], permissions: [] },
    });
  }

  refreshToken(): Observable<CurrentUser> {
    // Dedupe refresh khi nhiều request song song cùng nhận 401 cùng lúc.
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.tokenStorage.getRefreshToken();

    this.refreshInFlight$ = this.apiService
      .post<AuthSession>('auth/refresh', { refreshToken }, { context: this.skipAuthContext() })
      .pipe(
        tap((session) => this.applySession(session)),
        map((session) => session.user),
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
      );

    return this.refreshInFlight$;
  }

  handleUnauthorized(): Observable<CurrentUser> {
    return this.refreshToken().pipe(
      catchError((error: unknown) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.logger.info('User logged out');
    void this.router.navigateByUrl(this.appConfigService.config().authRedirectPath);
  }

  hasRole(role: string): boolean {
    return this.currentUserSignal()?.roles.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    return this.currentUserSignal()?.permissions.includes(permission) ?? false;
  }

  private applySession(session: AuthSession): void {
    this.tokenStorage.setAccessToken(session.accessToken);
    this.tokenStorage.setRefreshToken(session.refreshToken);
    this.accessTokenSignal.set(session.accessToken);
    this.currentUserSignal.set(session.user);
  }

  private skipAuthContext(): HttpContext {
    return new HttpContext().set(SKIP_AUTH, true);
  }
}
