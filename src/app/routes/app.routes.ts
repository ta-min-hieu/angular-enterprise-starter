import { Routes } from '@angular/router';
import { authGuard } from '../core/auth/guards/auth.guard';

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
    canActivate: [authGuard],
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
