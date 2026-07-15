import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { ApiService } from '../http/api.service';
import { SKIP_AUTH } from '../http/http-context-tokens';
import { TOKEN_STORAGE } from '../storage/token-storage';
import { AppConfigService } from '../config/app-config.service';
import { LoggerService } from '../logger/logger.service';
import { AuthSession, AuthTokens, Credentials, CurrentUser } from './current-user.model';
import { decodeJwtPayload } from './jwt.util';
import { KeycloakAccessTokenPayload, toCurrentUser } from './keycloak-token.util';

// Khớp PermissionResource phía backend (GET /v1/rbac/me/permissions) — resource gọn (không phải
// Permission đầy đủ) của người dùng đang đăng nhập, hợp nhất từ mọi role hiện có.
interface PermissionResource {
  readonly code: string;
  readonly httpMethod: string;
  readonly urlPattern: string;
}

// Đăng nhập qua Keycloak (POST /v2/auth/login) — backend truyền thẳng access token của Keycloak,
// không re-sign, nên decode ở đây phải theo shape chuẩn Keycloak (keycloak-token.util.ts), khác
// hẳn payload phẳng {sub, roles} của v1. Bản triển khai v1 cũ được backup ở
// core/auth/legacy/auth.service.v1.ts.bak.
//
// POST /v2/auth/refresh-token (thêm sau, cũng nằm ở gốc backend như /v2/auth/login) refresh được
// token Keycloak thật — Keycloak tự xoay refresh token mỗi lần refresh nên luôn phải lưu lại
// refreshToken MỚI trong response, không tái dùng refreshToken cũ (xem applySession()).
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

  constructor() {
    // Khôi phục currentUser (role/permission) từ token đã lưu khi tải lại trang — nếu không, sau
    // reload accessToken vẫn còn (isAuthenticated() = true) nhưng currentUser() rỗng, khiến UI theo
    // role/permission "quên" người dùng cho tới lần đăng nhập kế tiếp.
    const storedToken = this.accessTokenSignal();
    if (storedToken) {
      this.restoreSession(storedToken);
    }
  }

  login(credentials: Credentials): Observable<CurrentUser> {
    return this.apiService
      .post<AuthTokens>('v2/auth/login', credentials, {
        apiName: 'base',
        context: this.skipAuthContext(),
      })
      .pipe(
        map((tokens) => this.toSession(tokens)),
        tap((session) => this.applySession(session)),
        map((session) => session.user),
        tap(() => this.loadPermissions()),
      );
  }

  refreshToken(): Observable<CurrentUser> {
    // Dedupe refresh khi nhiều request song song cùng nhận 401 cùng lúc.
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.tokenStorage.getRefreshToken();

    this.refreshInFlight$ = this.apiService
      .post<AuthTokens>(
        'v2/auth/refresh-token',
        { refreshToken },
        { apiName: 'base', context: this.skipAuthContext() },
      )
      .pipe(
        map((tokens) => this.toSession(tokens)),
        tap((session) => this.applySession(session)),
        map((session) => session.user),
        tap(() => this.loadPermissions()),
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

  hasAnyRole(roles: readonly string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    return this.currentUserSignal()?.permissions.includes(permission) ?? false;
  }

  private restoreSession(accessToken: string): void {
    this.currentUserSignal.set(
      toCurrentUser(decodeJwtPayload<KeycloakAccessTokenPayload>(accessToken)),
    );
    this.loadPermissions();
  }

  private applySession(session: AuthSession): void {
    this.tokenStorage.setAccessToken(session.accessToken);
    this.tokenStorage.setRefreshToken(session.refreshToken);
    this.accessTokenSignal.set(session.accessToken);
    this.currentUserSignal.set(session.user);
  }

  // Token Keycloak không tự mang permission (chỉ có role ở realm_access.roles) — nạp riêng qua
  // endpoint dựng sẵn cho việc này, hợp nhất từ mọi role hiện có của user.
  private loadPermissions(): void {
    this.apiService.get<PermissionResource[]>('rbac/me/permissions').subscribe({
      next: (permissions) => {
        const current = this.currentUserSignal();
        if (!current) {
          return;
        }
        this.currentUserSignal.set({
          ...current,
          permissions: permissions.map((permission) => permission.code),
        });
      },
      error: () => undefined,
    });
  }

  private skipAuthContext(): HttpContext {
    return new HttpContext().set(SKIP_AUTH, true);
  }

  private toSession(tokens: AuthTokens): AuthSession {
    return {
      ...tokens,
      user: toCurrentUser(decodeJwtPayload<KeycloakAccessTokenPayload>(tokens.accessToken)),
    };
  }
}
