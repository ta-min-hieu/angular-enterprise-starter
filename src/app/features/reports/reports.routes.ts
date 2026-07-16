import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const reportsRoutes: Routes = [
  {
    path: '',
    // provideCharts ở route-level (không phải app.config.ts) để chart.js/ng2-charts chỉ nằm trong
    // lazy chunk của Reports, không kéo vào initial bundle — đúng nguyên tắc "Dynamic Import/Lazy
    // Load" ở docs/18-dependency-management.md, tránh vượt budget bundle size chỉ vì 1 route dùng.
    providers: [provideCharts(withDefaultRegisterables())],
    loadComponent: () => import('./reports-page/reports-page').then((m) => m.ReportsPage),
  },
];
