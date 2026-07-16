import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TranslocoPipe } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import { BrowserService } from '../../../core/browser/browser.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { PageBreadcrumbItem, PageHeader } from '../../../shared/components/page-header/page-header';
import {
  CategoryBreakdown,
  ReportSummary,
  RevenueTrendPoint,
  StockStatus,
  StockStatusBreakdown,
} from '../report.model';
import { ReportService } from '../report.service';

interface ChartPalette {
  readonly primary: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly textSecondary: string;
  readonly border: string;
}

// Chỉ dùng khi không đọc được CSS custom property (SSR/không có DOM) — bình thường luôn bị override
// bởi resolvePalette() đọc trực tiếp từ token thật (src/styles/tokens/_color.scss), tránh trùng lặp
// một nguồn màu thứ hai lệch tay với theme sáng/tối.
const FALLBACK_PALETTE: ChartPalette = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  border: '#d9d9d9',
};

// Bảng màu định tính (phân biệt từng danh mục) độc lập với token ngữ nghĩa success/warning/danger —
// những token đó dành cho trạng thái (vd tồn kho), dùng cho biểu đồ category sẽ gây hiểu nhầm màu.
const CATEGORY_COLORS: readonly string[] = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
];

const STOCK_STATUS_ORDER: readonly StockStatus[] = ['in_stock', 'low_stock', 'out_of_stock'];

@Component({
  selector: 'app-reports-page',
  imports: [
    DecimalPipe,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzSpinModule,
    BaseChartDirective,
    TranslocoPipe,
    PageHeader,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  private readonly reportService = inject(ReportService);
  private readonly themeService = inject(ThemeService);
  private readonly browserService = inject(BrowserService);
  private readonly i18nService = inject(I18nService);

  readonly breadcrumbItems: readonly PageBreadcrumbItem[] = [{ label: 'reports.title' }];

  readonly loading = signal(true);
  readonly summary = signal<ReportSummary | null>(null);

  private readonly revenueTrend = signal<readonly RevenueTrendPoint[]>([]);
  private readonly categoryBreakdown = signal<readonly CategoryBreakdown[]>([]);
  private readonly stockStatusBreakdown = signal<readonly StockStatusBreakdown[]>([]);

  private readonly palette = computed(() => {
    // Đọc theme() để computed() theo dõi đúng dependency — màu thật lấy trực tiếp từ CSS custom
    // property bên dưới (đã phản ánh theme hiện tại qua [data-theme] do ThemeService gắn vào
    // <html>), không dùng giá trị theme ở đây.
    this.themeService.theme();
    return this.resolvePalette();
  });

  readonly revenueChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const palette = this.palette();
    return {
      labels: this.revenueTrend().map((point) => point.month),
      datasets: [
        {
          label: this.i18nService.translate('reports.charts.revenue_trend.series'),
          data: this.revenueTrend().map((point) => point.revenue),
          borderColor: palette.primary,
          backgroundColor: this.toTranslucent(palette.primary, 0.15),
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    };
  });

  readonly revenueChartOptions = computed<ChartOptions<'line'>>(() => this.buildAxisOptions());

  readonly categoryChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.categoryBreakdown().map((item) =>
      this.i18nService.translate(`products.categories.${item.category}`),
    ),
    datasets: [
      {
        data: this.categoryBreakdown().map((item) => item.productCount),
        backgroundColor: CATEGORY_COLORS,
        hoverOffset: 4,
      },
    ],
  }));

  readonly categoryChartOptions = computed<ChartOptions<'doughnut'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: this.palette().textSecondary } },
    },
  }));

  readonly stockChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const palette = this.palette();
    const colorByStatus: Record<StockStatus, string> = {
      in_stock: palette.success,
      low_stock: palette.warning,
      out_of_stock: palette.danger,
    };
    const byStatus = new Map(this.stockStatusBreakdown().map((item) => [item.status, item]));
    const ordered = STOCK_STATUS_ORDER.map(
      (status) => byStatus.get(status) ?? { status, productCount: 0 },
    );

    return {
      labels: ordered.map((item) =>
        this.i18nService.translate(`reports.stock_status.${item.status}`),
      ),
      datasets: [
        {
          data: ordered.map((item) => item.productCount),
          backgroundColor: ordered.map((item) => colorByStatus[item.status]),
          borderRadius: 4,
          maxBarThickness: 48,
        },
      ],
    };
  });

  readonly stockChartOptions = computed<ChartOptions<'bar'>>(() => ({
    ...this.buildAxisOptions(),
    plugins: { legend: { display: false } },
  }));

  constructor() {
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    forkJoin({
      summary: this.reportService.getSummary(),
      revenueTrend: this.reportService.getRevenueTrend(),
      categoryBreakdown: this.reportService.getCategoryBreakdown(),
      stockStatusBreakdown: this.reportService.getStockStatusBreakdown(),
    }).subscribe(({ summary, revenueTrend, categoryBreakdown, stockStatusBreakdown }) => {
      this.summary.set(summary);
      this.revenueTrend.set(revenueTrend);
      this.categoryBreakdown.set(categoryBreakdown);
      this.stockStatusBreakdown.set(stockStatusBreakdown);
      this.loading.set(false);
    });
  }

  private buildAxisOptions(): ChartOptions<'line'> & ChartOptions<'bar'> {
    const palette = this.palette();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: palette.textSecondary },
          grid: { color: palette.border, display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: palette.textSecondary },
          grid: { color: palette.border },
        },
      },
    };
  }

  // Đọc trực tiếp từ CSS custom property (design token thật) thay vì hard-code hex trùng lặp — cùng
  // cách ThemeService đang làm cho theme của ng-zorro, đảm bảo biểu đồ luôn khớp màu với phần UI
  // còn lại kể cả khi token đổi, và tự cập nhật khi người dùng chuyển sáng/tối.
  private resolvePalette(): ChartPalette {
    const window = this.browserService.getWindow();
    const document = this.browserService.getDocument();
    if (!window || !document) {
      return FALLBACK_PALETTE;
    }

    const style = window.getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string): string =>
      style.getPropertyValue(name).trim() || fallback;

    return {
      primary: read('--color-primary', FALLBACK_PALETTE.primary),
      success: read('--color-success', FALLBACK_PALETTE.success),
      warning: read('--color-warning', FALLBACK_PALETTE.warning),
      danger: read('--color-danger', FALLBACK_PALETTE.danger),
      textSecondary: read('--color-text-secondary', FALLBACK_PALETTE.textSecondary),
      border: read('--color-border', FALLBACK_PALETTE.border),
    };
  }

  private toTranslucent(color: string, alpha: number): string {
    // Token màu trong project luôn là hex (#rrggbb) — parse trực tiếp, không cần thư viện màu.
    const hex = color.replace('#', '');
    if (hex.length !== 6) {
      return color;
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
