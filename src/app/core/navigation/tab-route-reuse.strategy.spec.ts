import { Component, OnDestroy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouteReuseStrategy, RouterOutlet, provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { TabRouteReuseStrategy } from './tab-route-reuse.strategy';

let productsInitCount = 0;
let productsDestroyCount = 0;
@Component({ selector: 'app-stub-products', template: '' })
class StubProductsPage implements OnDestroy {
  value = 0;
  constructor() {
    productsInitCount++;
  }
  ngOnDestroy(): void {
    productsDestroyCount++;
  }
}

let reportsInitCount = 0;
@Component({ selector: 'app-stub-reports', template: '' })
class StubReportsPage {
  constructor() {
    reportsInitCount++;
  }
}

let otherInitCount = 0;
@Component({ selector: 'app-stub-other', template: '' })
class StubOtherPage {
  constructor() {
    otherInitCount++;
  }
}

@Component({ selector: 'app-stub-host', imports: [RouterOutlet], template: '<router-outlet />' })
class StubHost {}

describe('TabRouteReuseStrategy', () => {
  function setup() {
    productsInitCount = 0;
    productsDestroyCount = 0;
    reportsInitCount = 0;
    otherInitCount = 0;

    TestBed.configureTestingModule({
      imports: [StubHost],
      providers: [
        provideRouter([
          { path: 'products', data: { tabsEnabled: true }, component: StubProductsPage },
          { path: 'reports', data: { tabsEnabled: true }, component: StubReportsPage },
          { path: 'other', component: StubOtherPage },
        ]),
        { provide: RouteReuseStrategy, useExisting: TabRouteReuseStrategy },
      ],
    });

    const fixture = TestBed.createComponent(StubHost);
    const router = TestBed.inject(Router);
    const strategy = TestBed.inject(TabRouteReuseStrategy);
    fixture.detectChanges();

    return { fixture, router, strategy };
  }

  function activeComponent<T>(fixture: ReturnType<typeof setup>['fixture']): T {
    return fixture.debugElement.query(By.directive(RouterOutlet)).injector.get(RouterOutlet)
      .component as T;
  }

  async function navigate(
    fixture: ReturnType<typeof setup>['fixture'],
    router: Router,
    url: string,
  ) {
    await router.navigateByUrl(url);
    fixture.detectChanges();
  }

  it('reuses the same component instance and its in-memory state when returning to a tab', async () => {
    const { fixture, router } = setup();

    await navigate(fixture, router, '/products');
    const first = activeComponent<StubProductsPage>(fixture);
    first.value = 42;

    await navigate(fixture, router, '/reports');
    await navigate(fixture, router, '/products');
    const second = activeComponent<StubProductsPage>(fixture);

    expect(second).toBe(first);
    expect(second.value).toBe(42);
    expect(productsInitCount).toBe(1);
    expect(productsDestroyCount).toBe(0);
    expect(reportsInitCount).toBe(1);
  });

  it('does not cache a route without tabsEnabled data', async () => {
    const { fixture, router } = setup();

    await navigate(fixture, router, '/other');
    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/other');

    expect(otherInitCount).toBe(2);
  });

  it('creates a fresh instance and destroys the old one after evict()', async () => {
    const { fixture, router, strategy } = setup();

    await navigate(fixture, router, '/products');
    const first = activeComponent<StubProductsPage>(fixture);
    first.value = 42;

    await navigate(fixture, router, '/reports');
    strategy.evict('/products');
    await navigate(fixture, router, '/products');
    const second = activeComponent<StubProductsPage>(fixture);

    expect(second).not.toBe(first);
    expect(second.value).toBe(0);
    expect(productsInitCount).toBe(2);
    expect(productsDestroyCount).toBe(1);
  });

  it('destroys every cached instance on evictAll()', async () => {
    const { fixture, router, strategy } = setup();

    await navigate(fixture, router, '/products');
    await navigate(fixture, router, '/reports');

    strategy.evictAll();

    expect(productsDestroyCount).toBe(1);
  });

  it('forces a real destroy/recreate for one navigation when bypassCacheFor is armed', async () => {
    const { fixture, router, strategy } = setup();

    await navigate(fixture, router, '/products');
    const first = activeComponent<StubProductsPage>(fixture);
    first.value = 42;

    strategy.bypassCacheFor('/products');
    await router.navigateByUrl('/products', { onSameUrlNavigation: 'reload' });
    fixture.detectChanges();
    strategy.clearBypass();

    const second = activeComponent<StubProductsPage>(fixture);
    expect(second).not.toBe(first);
    expect(second.value).toBe(0);
    expect(productsInitCount).toBe(2);
    expect(productsDestroyCount).toBe(1);
  });

  it('resumes normal caching after the bypass is cleared', async () => {
    const { fixture, router, strategy } = setup();

    await navigate(fixture, router, '/products');
    strategy.bypassCacheFor('/products');
    await router.navigateByUrl('/products', { onSameUrlNavigation: 'reload' });
    fixture.detectChanges();
    strategy.clearBypass();

    const refreshed = activeComponent<StubProductsPage>(fixture);
    refreshed.value = 7;

    await navigate(fixture, router, '/reports');
    await navigate(fixture, router, '/products');
    const third = activeComponent<StubProductsPage>(fixture);

    expect(third).toBe(refreshed);
    expect(third.value).toBe(7);
  });
});
