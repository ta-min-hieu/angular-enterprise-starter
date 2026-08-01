import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouteReuseStrategy, provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { TabsService } from './tabs.service';
import { NAV_MENU_ITEMS } from './nav-menu-items.token';
import { TabRouteReuseStrategy } from './tab-route-reuse.strategy';
import { TOKEN_STORAGE } from '../storage/token-storage';
import { LocalTokenStorage } from '../storage/local-token-storage';

@Component({ selector: 'app-stub-page', template: '' })
class StubPage {}

@Component({ selector: 'app-stub-host', template: '' })
class StubHost {}

describe('TabsService', () => {
  function setup() {
    localStorage.removeItem('app.open_tabs');

    TestBed.configureTestingModule({
      imports: [StubHost],
      providers: [
        provideRouter([
          {
            path: 'products',
            data: { tabsEnabled: true, seo: { title: 'products.title' } },
            component: StubPage,
          },
          {
            path: 'products/new',
            data: { tabsEnabled: true, seo: { title: 'products.form_page.create_title' } },
            component: StubPage,
          },
          {
            path: 'system/users',
            data: { tabsEnabled: true, seo: { title: 'system.users.title' } },
            component: StubPage,
          },
          {
            path: 'forbidden',
            data: { seo: { title: 'pages.forbidden.title' } },
            component: StubPage,
          },
        ]),
        { provide: RouteReuseStrategy, useExisting: TabRouteReuseStrategy },
        { provide: TOKEN_STORAGE, useClass: LocalTokenStorage },
        { provide: NAV_MENU_ITEMS, multi: true, useValue: [] },
      ],
    });

    const fixture = TestBed.createComponent(StubHost);
    const router = TestBed.inject(Router);
    const tabsService = TestBed.inject(TabsService);
    fixture.detectChanges();

    return { fixture, router, tabsService };
  }

  async function navigate(
    fixture: ReturnType<typeof setup>['fixture'],
    router: Router,
    url: string,
  ) {
    await router.navigateByUrl(url);
    fixture.detectChanges();
  }

  it('opens no tab when the initial route is not tabbable', () => {
    const { tabsService } = setup();

    expect(tabsService.tabs()).toEqual([]);
  });

  it('adds a tab when navigating to a tabbable route', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');

    expect(tabsService.tabs()).toEqual([{ path: '/products', titleKey: 'products.title' }]);
    expect(tabsService.activePath()).toBe('/products');
  });

  it('keeps previously opened tabs when navigating to a new one', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/system/users');

    expect(tabsService.tabs().map((tab) => tab.path)).toEqual(['/products', '/system/users']);
  });

  it('does not open a tab for a route without tabsEnabled data', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/forbidden');

    expect(tabsService.tabs().map((tab) => tab.path)).toEqual(['/products']);
  });

  it('does not duplicate a tab when revisiting the same route', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/system/users');
    await navigate(fixture, router, '/products');

    expect(tabsService.tabs().map((tab) => tab.path)).toEqual(['/products', '/system/users']);
  });

  it('navigates to the neighboring tab and removes it when closing the active tab', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/products/new');
    await navigate(fixture, router, '/system/users');

    tabsService.close('/products/new');
    fixture.detectChanges();

    expect(tabsService.tabs().map((tab) => tab.path)).toEqual(['/products', '/system/users']);
    expect(tabsService.activePath()).toBe('/system/users');
  });

  it('refuses to close the last remaining tab', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');

    tabsService.close('/products');

    expect(tabsService.tabs().map((tab) => tab.path)).toEqual(['/products']);
  });

  it('keeps only the target tab when closing others', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/products/new');
    await navigate(fixture, router, '/system/users');

    tabsService.closeOthers('/products');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(tabsService.tabs().map((tab) => tab.path)).toEqual(['/products']);
    expect(tabsService.activePath()).toBe('/products');
  });

  it('closes every tab and navigates back to the default route', async () => {
    const { fixture, router, tabsService } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/system/users');

    tabsService.closeAll();
    fixture.detectChanges();

    expect(tabsService.tabs()).toEqual([]);
  });

  it('persists open tabs to localStorage and restores them for a new instance', async () => {
    const { fixture, router } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/system/users');

    const persisted = JSON.parse(localStorage.getItem('app.open_tabs') ?? '[]');
    expect(persisted.map((tab: { path: string }) => tab.path)).toEqual([
      '/products',
      '/system/users',
    ]);

    localStorage.removeItem('app.open_tabs');
  });
});
