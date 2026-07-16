import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { AdminLayout } from './admin-layout';
import { NAV_MENU_ITEMS } from '../../core/navigation/nav-menu-items.token';
import { NavMenuItem } from '../../core/navigation/nav-menu-item.model';
import { TOKEN_STORAGE } from '../../core/storage/token-storage';
import { LocalTokenStorage } from '../../core/storage/local-token-storage';
import { REGISTERED_ICONS } from '../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../core/i18n/testing/provide-transloco-testing';

@Component({ selector: 'app-stub-page', template: '' })
class StubPage {}

const SYSTEM_MENU: NavMenuItem = {
  label: 'nav.system',
  route: '/system/users',
  children: [
    { label: 'nav.system_users', route: '/system/users' },
    { label: 'nav.system_roles', route: '/system/roles' },
  ],
};

// Không khai báo roles/permission — nếu không, NavMenuService lọc bỏ hết vì AuthService thật (dùng
// bên dưới, không stub) không có currentUser() trong test này, hasAnyRole()/hasPermission() sẽ luôn
// false.
const PRODUCTS_MENU: NavMenuItem = { label: 'nav.products', route: '/products' };

describe('AdminLayout', () => {
  function setup(menuItems: readonly NavMenuItem[] = [PRODUCTS_MENU, SYSTEM_MENU]) {
    TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([
          { path: 'system/users', component: StubPage },
          { path: 'system/roles', component: StubPage },
        ]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
        { provide: TOKEN_STORAGE, useClass: LocalTokenStorage },
        { provide: NAV_MENU_ITEMS, multi: true, useValue: menuItems },
      ],
    });

    const fixture = TestBed.createComponent(AdminLayout);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    return { fixture, router };
  }

  it('should create with the sidebar collapsed toggle available', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.collapsed()).toBe(false);

    fixture.componentInstance.toggleCollapsed();
    expect(fixture.componentInstance.collapsed()).toBe(true);
  });

  it('keeps the submenu open when the active route is one of its children', async () => {
    const { fixture, router } = setup();

    await router.navigateByUrl('/system/roles');
    fixture.detectChanges();

    expect(fixture.componentInstance.isSubmenuOpen(SYSTEM_MENU)).toBe(true);
  });

  it('does not auto-open the submenu when no child route is active', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance.isSubmenuOpen(SYSTEM_MENU)).toBe(false);
  });

  it('stays closed after the user manually collapses it, even while a child route is active', async () => {
    const { fixture, router } = setup();

    await router.navigateByUrl('/system/roles');
    fixture.detectChanges();
    fixture.componentInstance.onSubmenuOpenChange(SYSTEM_MENU, false);

    expect(fixture.componentInstance.isSubmenuOpen(SYSTEM_MENU)).toBe(false);

    fixture.componentInstance.onSubmenuOpenChange(SYSTEM_MENU, true);
    expect(fixture.componentInstance.isSubmenuOpen(SYSTEM_MENU)).toBe(true);
  });

  it('shows every visible item unchanged when the menu search term is empty', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance.filteredMenuItems()).toHaveLength(2);
  });

  it('keeps only items whose own label matches the menu search term', () => {
    const { fixture } = setup();

    fixture.componentInstance.onMenuSearchTermChange('products');

    const result = fixture.componentInstance.filteredMenuItems();
    expect(result).toHaveLength(1);
    expect(result[0].route).toBe('/products');
  });

  it('keeps a parent with only its matching children when the parent label itself does not match', () => {
    const { fixture } = setup();

    fixture.componentInstance.onMenuSearchTermChange('roles');

    const result = fixture.componentInstance.filteredMenuItems();
    expect(result).toHaveLength(1);
    expect(result[0].route).toBe('/system/users');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].route).toBe('/system/roles');
  });

  it('returns no items and auto-opens nothing when the menu search term matches nothing', () => {
    const { fixture } = setup();

    fixture.componentInstance.onMenuSearchTermChange('zzz-no-match');

    expect(fixture.componentInstance.filteredMenuItems()).toHaveLength(0);
  });

  it('forces submenus open while a menu search term is active', () => {
    const { fixture } = setup();

    fixture.componentInstance.onSubmenuOpenChange(SYSTEM_MENU, false);
    fixture.componentInstance.onMenuSearchTermChange('roles');

    expect(fixture.componentInstance.isSubmenuOpen(SYSTEM_MENU)).toBe(true);
  });

  it('defaults the sider to 200px when nothing is stored', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance.siderWidth()).toBe(200);
  });

  it('resizes the sider while dragging, clamped to the min/max bounds, and persists on release', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;

    component.onResizeHandleMouseDown({
      clientX: 200,
      preventDefault: () => undefined,
    } as MouseEvent);
    expect(component.resizing()).toBe(true);

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 260 }));
    expect(component.siderWidth()).toBe(260);

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1000 }));
    expect(component.siderWidth()).toBe(360);

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: -1000 }));
    expect(component.siderWidth()).toBe(180);

    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(component.resizing()).toBe(false);
    expect(localStorage.getItem('app.sider_width')).toBe('180');

    localStorage.removeItem('app.sider_width');
  });

  it('stops reacting to mouse movement once the drag has ended', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;

    component.onResizeHandleMouseDown({
      clientX: 200,
      preventDefault: () => undefined,
    } as MouseEvent);
    document.dispatchEvent(new MouseEvent('mouseup'));

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 260 }));
    expect(component.siderWidth()).toBe(200);

    localStorage.removeItem('app.sider_width');
  });

  it('restores the sider width saved from a previous session', () => {
    localStorage.setItem('app.sider_width', '260');

    const { fixture } = setup();
    expect(fixture.componentInstance.siderWidth()).toBe(260);

    localStorage.removeItem('app.sider_width');
  });

  it('falls back to the default width when the stored value is outside the allowed range', () => {
    localStorage.setItem('app.sider_width', '9999');

    const { fixture } = setup();
    expect(fixture.componentInstance.siderWidth()).toBe(200);

    localStorage.removeItem('app.sider_width');
  });
});
