import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { BrowserService } from '../../browser/browser.service';

describe('authGuard', () => {
  function setup(isAuthenticated: boolean, isBrowser = true) {
    const urlTree = {} as UrlTree;
    const router = { createUrlTree: vi.fn().mockReturnValue(urlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } },
        { provide: Router, useValue: router },
        {
          provide: AppConfigService,
          useValue: { config: () => ({ authRedirectPath: '/auth/login' }) },
        },
        { provide: BrowserService, useValue: { isBrowser } },
      ],
    });

    return { router, urlTree };
  }

  it('allows navigation when authenticated', () => {
    setup(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/products' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirects to authRedirectPath with returnUrl when not authenticated', () => {
    const { router, urlTree } = setup(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/products/new' } as never),
    );

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/products/new' },
    });
  });

  it('allows navigation during SSR even when not authenticated', () => {
    setup(false, false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/products' } as never),
    );

    expect(result).toBe(true);
  });
});
