export interface ReportSummary {
  readonly totalProducts: number;
  readonly totalStock: number;
  readonly totalRevenue: number;
  readonly lowStockCount: number;
}

export interface RevenueTrendPoint {
  readonly month: string;
  readonly revenue: number;
}

export interface CategoryBreakdown {
  readonly category: string;
  readonly productCount: number;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockStatusBreakdown {
  readonly status: StockStatus;
  readonly productCount: number;
}
