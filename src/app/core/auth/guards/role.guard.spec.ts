import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { roleGuard } from './role.guard';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';

describe('roleGuard', () => {
  function setup(hasAnyRole: (roles: readonly string[]) => boolean) {
    const urlTree = {} as UrlTree;
    const router = { createUrlTree: vi.fn().mockReturnValue(urlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { hasAnyRole } },
        { provide: Router, useValue: router },
        {
          provide: AppConfigService,
          useValue: { config: () => ({ forbiddenPath: '/forbidden' }) },
        },
      ],
    });

    return { router, urlTree };
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
});
