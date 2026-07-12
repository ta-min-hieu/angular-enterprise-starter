import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { NavMenuService } from './nav-menu.service';
import { NAV_MENU_ITEMS } from './nav-menu-items.token';
import { AuthService } from '../auth/auth.service';

describe('NavMenuService', () => {
  function setup(hasPermission: (permission: string) => boolean) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { currentUser: signal(null), hasPermission },
        },
        {
          provide: NAV_MENU_ITEMS,
          useValue: [
            [
              { label: 'Dashboard', route: '/dashboard' },
              { label: 'Users', route: '/users', permission: 'users.read' },
            ],
          ],
        },
      ],
    });

    return TestBed.inject(NavMenuService);
  }

  it('should include items without a permission requirement', () => {
    const service = setup(() => false);

    const labels = service.visibleItems().map((item) => item.label);

    expect(labels).toContain('Dashboard');
    expect(labels).not.toContain('Users');
  });

  it('should include items when the user has the required permission', () => {
    const hasPermission = vi.fn().mockReturnValue(true);
    const service = setup(hasPermission);

    const labels = service.visibleItems().map((item) => item.label);

    expect(labels).toEqual(['Dashboard', 'Users']);
    expect(hasPermission).toHaveBeenCalledWith('users.read');
  });

  it('should return an empty list when no menu groups are registered', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { currentUser: signal(null), hasPermission: () => false },
        },
      ],
    });

    const service = TestBed.inject(NavMenuService);

    expect(service.visibleItems()).toEqual([]);
  });
});
