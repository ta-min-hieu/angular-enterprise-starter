import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { TabBar } from './tab-bar';
import { NAV_MENU_ITEMS } from '../../../core/navigation/nav-menu-items.token';
import { TabsService } from '../../../core/navigation/tabs.service';
import { TabRouteReuseStrategy } from '../../../core/navigation/tab-route-reuse.strategy';
import { TOKEN_STORAGE } from '../../../core/storage/token-storage';
import { LocalTokenStorage } from '../../../core/storage/local-token-storage';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

@Component({ selector: 'app-stub-page', template: '' })
class StubPage {}

describe('TabBar', () => {
  function setup() {
    localStorage.removeItem('app.open_tabs');

    TestBed.configureTestingModule({
      imports: [TabBar],
      providers: [
        provideRouter([
          {
            path: 'products',
            data: { tabsEnabled: true, seo: { title: 'products.title' } },
            component: StubPage,
          },
          {
            path: 'system/users',
            data: { tabsEnabled: true, seo: { title: 'system.users.title' } },
            component: StubPage,
          },
        ]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
        { provide: RouteReuseStrategy, useExisting: TabRouteReuseStrategy },
        { provide: TOKEN_STORAGE, useClass: LocalTokenStorage },
        { provide: NAV_MENU_ITEMS, multi: true, useValue: [] },
      ],
    });

    const fixture = TestBed.createComponent(TabBar);
    const router = TestBed.inject(Router);
    const tabsService = TestBed.inject(TabsService);
    fixture.detectChanges();

    return { fixture, router, tabsService };
  }

  it('renders nothing when there is no open tab', () => {
    const { fixture } = setup();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('renders one chip per open tab', async () => {
    const { fixture, router } = setup();

    await router.navigateByUrl('/products');
    fixture.detectChanges();
    await router.navigateByUrl('/system/users');
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('.app-tab-bar__tab');
    expect(chips.length).toBe(2);
  });

  it('activates a tab when clicked', async () => {
    const { fixture, router, tabsService } = setup();

    await router.navigateByUrl('/products');
    fixture.detectChanges();
    await router.navigateByUrl('/system/users');
    fixture.detectChanges();

    const firstTabRow = fixture.nativeElement.querySelector('.app-tab-bar__tab');
    firstTabRow.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(tabsService.activePath()).toBe('/products');
  });

  it('does not activate the tab when the close icon is clicked', async () => {
    const { fixture, router, tabsService } = setup();

    await router.navigateByUrl('/products');
    fixture.detectChanges();
    await router.navigateByUrl('/system/users');
    fixture.detectChanges();

    const closeIcon = fixture.nativeElement.querySelector('.app-tab-bar__close');
    closeIcon.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(tabsService.tabs().map((tab: { path: string }) => tab.path)).toEqual(['/system/users']);
    expect(tabsService.activePath()).toBe('/system/users');
  });
});
