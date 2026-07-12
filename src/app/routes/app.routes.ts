import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'products',
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
