import { Routes } from '@angular/router';
import { authGuard } from '../core/auth/guards/auth.guard';
import { roleGuard } from '../core/auth/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'auth',
    loadComponent: () => import('../layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: '',
        loadChildren: () => import('../features/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  {
    path: 'products',
    canActivate: [authGuard, roleGuard],
    // Role thật duy nhất backend đang cấp qua JWT là "USER" (xem AppUser/app_user_role) — khai báo
    // tường minh ở đây để roleGuard + menu item (app.config.ts) cùng khớp 1 nguồn, sẵn sàng đổi/
    // thêm role khi backend có nhiều role hơn.
    data: { roles: ['USER'] },
    loadComponent: () => import('../layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../features/products/products.routes').then((m) => m.productsRoutes),
      },
    ],
  },
  {
    path: 'system',
    canActivate: [authGuard, roleGuard],
    // "ADMIN" chưa tồn tại trong JWT thật hiện nay (chỉ có "USER") — placeholder hướng tới tương
    // lai, không ai truy cập được cho tới khi backend cấp role này, giống ghi chú ở block 'products'.
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('../layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadChildren: () => import('../features/system/system.routes').then((m) => m.systemRoutes),
      },
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('../shared/pages/forbidden-page/forbidden-page').then((m) => m.ForbiddenPage),
  },
  {
    path: 'server-error',
    loadComponent: () =>
      import('../shared/pages/server-error-page/server-error-page').then((m) => m.ServerErrorPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('../shared/pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
