import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  MOCK_CATEGORY_BREAKDOWN,
  MOCK_REPORT_SUMMARY,
  MOCK_REVENUE_TREND,
  MOCK_STOCK_STATUS_BREAKDOWN,
} from './report-mock.data';
import {
  CategoryBreakdown,
  ReportSummary,
  RevenueTrendPoint,
  StockStatusBreakdown,
} from './report.model';

// Backend chưa có endpoint report — trả dữ liệu giả lập (report-mock.data.ts) qua Observable để
// ReportsPage gọi giống hệt một service thật (bao gồm cả độ trễ giả lập cho loading state). Khi
// backend có API thật, chỉ cần đổi thân 4 method dưới đây sang gọi ApiService.get(...), không phải
// sửa gì ở ReportsPage hay report.model.ts.
const MOCK_LATENCY_MS = 300;

@Injectable({ providedIn: 'root' })
export class ReportService {
  getSummary(): Observable<ReportSummary> {
    return of(MOCK_REPORT_SUMMARY).pipe(delay(MOCK_LATENCY_MS));
  }

  getRevenueTrend(): Observable<readonly RevenueTrendPoint[]> {
    return of(MOCK_REVENUE_TREND).pipe(delay(MOCK_LATENCY_MS));
  }

  getCategoryBreakdown(): Observable<readonly CategoryBreakdown[]> {
    return of(MOCK_CATEGORY_BREAKDOWN).pipe(delay(MOCK_LATENCY_MS));
  }

  getStockStatusBreakdown(): Observable<readonly StockStatusBreakdown[]> {
    return of(MOCK_STOCK_STATUS_BREAKDOWN).pipe(delay(MOCK_LATENCY_MS));
  }
}
