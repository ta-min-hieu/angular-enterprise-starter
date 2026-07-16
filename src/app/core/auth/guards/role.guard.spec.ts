import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { roleGuard } from './role.guard';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { BrowserService } from '../../browser/browser.service';

describe('roleGuard', () => {
  function setup(
    hasAnyRole: (roles: readonly string[]) => boolean,
    isBrowser = true,
    currentUserRoles: readonly string[] | null = ['SOME_OTHER_ROLE'],
  ) {
    const urlTree = {} as UrlTree;
    const router = { createUrlTree: vi.fn().mockReturnValue(urlTree) };
    const logout = vi.fn();
    const currentUser = vi
      .fn()
      .mockReturnValue(currentUserRoles === null ? null : { roles: currentUserRoles });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { hasAnyRole, currentUser, logout } },
        { provide: Router, useValue: router },
        {
          provide: AppConfigService,
          useValue: { config: () => ({ forbiddenPath: '/forbidden' }) },
        },
        { provide: BrowserService, useValue: { isBrowser } },
      ],
    });

    return { router, urlTree, logout, currentUser };
  }

  it('allows navigation when the route declares no required roles', () => {
    setup(() => false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: {} } as never, {} as never),
    );

    expect(result).toBe(true);
  });

  it('allows navigation when the user has one of the required roles', () => {
    setup((roles) => roles.includes('ADMIN'));

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN', 'MANAGER'] } } as never, {} as never),
    );

    expect(result).toBe(true);
  });

  it('redirects to forbiddenPath when the user has none of the required roles', () => {
    const { router, urlTree } = setup(() => false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as never, {} as never),
    );

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('allows navigation during SSR even when the user has none of the required roles', () => {
    setup(() => false, false);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as never, {} as never),
    );

    expect(result).toBe(true);
  });

  it('logs the user out and cancels navigation instead of showing 403 when the session has no roles at all', () => {
    const { router, logout } = setup(() => false, true, []);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as never, {} as never),
    );

    expect(logout).toHaveBeenCalledOnce();
    expect(result).toBe(false);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
