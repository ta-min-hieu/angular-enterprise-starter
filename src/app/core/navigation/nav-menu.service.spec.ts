import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { NavMenuService } from './nav-menu.service';
import { NAV_MENU_ITEMS } from './nav-menu-items.token';
import { AuthService } from '../auth/auth.service';

describe('NavMenuService', () => {
  function setup(
    hasPermission: (permission: string) => boolean,
    hasAnyRole: (roles: readonly string[]) => boolean = () => false,
  ) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { currentUser: signal(null), hasPermission, hasAnyRole },
        },
        {
          provide: NAV_MENU_ITEMS,
          useValue: [
            [
              { label: 'Dashboard', route: '/dashboard' },
              { label: 'Users', route: '/users', permission: 'users.read' },
              { label: 'Admin', route: '/admin', roles: ['ADMIN'] },
              { label: 'Reports', route: '/reports', roles: ['ADMIN'], permission: 'reports.read' },
            ],
          ],
        },
      ],
    });

    return TestBed.inject(NavMenuService);
  }

  it('should include items without a permission or role requirement', () => {
    const service = setup(() => false);

    const labels = service.visibleItems().map((item) => item.label);

    expect(labels).toContain('Dashboard');
    expect(labels).not.toContain('Users');
    expect(labels).not.toContain('Admin');
  });

  it('should include items when the user has the required permission', () => {
    const hasPermission = vi.fn().mockReturnValue(true);
    const service = setup(hasPermission);

    const labels = service.visibleItems().map((item) => item.label);

    expect(labels).toContain('Users');
    expect(hasPermission).toHaveBeenCalledWith('users.read');
  });

  it('should include items when the user has any of the required roles', () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    const service = setup(() => false, hasAnyRole);

    const labels = service.visibleItems().map((item) => item.label);

    expect(labels).toContain('Admin');
    expect(hasAnyRole).toHaveBeenCalledWith(['ADMIN']);
  });

  it('should require BOTH roles and permission when an item declares both', () => {
    const service = setup(
      (permission) => permission === 'reports.read',
      () => false,
    );

    expect(service.visibleItems().map((item) => item.label)).not.toContain('Reports');
  });

  it('should return an empty list when no menu groups are registered', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null),
            hasPermission: () => false,
            hasAnyRole: () => false,
          },
        },
      ],
    });

    const service = TestBed.inject(NavMenuService);

    expect(service.visibleItems()).toEqual([]);
  });
});
