import {
  CategoryBreakdown,
  ReportSummary,
  RevenueTrendPoint,
  StockStatusBreakdown,
} from './report.model';

// Dữ liệu giả lập cho màn Báo cáo — backend CHƯA có endpoint report nào (chỉ có CRUD Product/RBAC).
// Xây trước giao diện theo shape này; khi API thật ra đời chỉ cần đổi phần thân các method trong
// report.service.ts sang gọi ApiService, KHÔNG cần sửa report.model.ts hay reports-page.
export const MOCK_REPORT_SUMMARY: ReportSummary = {
  totalProducts: 128,
  totalStock: 4360,
  totalRevenue: 812_450_000,
  lowStockCount: 9,
};

export const MOCK_REVENUE_TREND: readonly RevenueTrendPoint[] = [
  { month: 'T1', revenue: 52_000_000 },
  { month: 'T2', revenue: 61_500_000 },
  { month: 'T3', revenue: 58_200_000 },
  { month: 'T4', revenue: 74_800_000 },
  { month: 'T5', revenue: 69_300_000 },
  { month: 'T6', revenue: 83_100_000 },
  { month: 'T7', revenue: 91_600_000 },
  { month: 'T8', revenue: 87_400_000 },
  { month: 'T9', revenue: 95_900_000 },
  { month: 'T10', revenue: 102_300_000 },
  { month: 'T11', revenue: 98_700_000 },
  { month: 'T12', revenue: 113_450_000 },
];

// Trùng khớp CATEGORY_OPTIONS (product.constants.ts) để tái dùng i18n key 'products.categories.*'
// thay vì tạo một danh sách category song song, dễ lệch dữ liệu.
export const MOCK_CATEGORY_BREAKDOWN: readonly CategoryBreakdown[] = [
  { category: 'accessories', productCount: 42 },
  { category: 'monitors', productCount: 35 },
  { category: 'laptops', productCount: 28 },
  { category: 'other', productCount: 23 },
];

export const MOCK_STOCK_STATUS_BREAKDOWN: readonly StockStatusBreakdown[] = [
  { status: 'in_stock', productCount: 96 },
  { status: 'low_stock', productCount: 23 },
  { status: 'out_of_stock', productCount: 9 },
];
