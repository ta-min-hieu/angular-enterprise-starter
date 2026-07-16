import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsPage } from './reports-page';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const MOCK_LATENCY_MS = 300;

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        provideCharts(withDefaultRegisterables()),
        ...provideTranslocoTesting(),
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show loading until the mock report data resolves, then populate the summary', () => {
    const fixture = TestBed.createComponent(ReportsPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(true);
    expect(fixture.componentInstance.summary()).toBeNull();

    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.summary()).not.toBeNull();
    expect(fixture.componentInstance.summary()?.totalProducts).toBeGreaterThan(0);
  });

  it('should build revenue and stock chart data from the resolved report', () => {
    const fixture = TestBed.createComponent(ReportsPage);
    fixture.detectChanges();
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    fixture.detectChanges();

    const revenueData = fixture.componentInstance.revenueChartData();
    expect(revenueData.labels?.length).toBeGreaterThan(0);
    expect(revenueData.datasets[0].data.length).toBe(revenueData.labels?.length);

    const stockData = fixture.componentInstance.stockChartData();
    expect(stockData.labels).toHaveLength(3);
    expect(stockData.datasets[0].data).toHaveLength(3);
  });
});
