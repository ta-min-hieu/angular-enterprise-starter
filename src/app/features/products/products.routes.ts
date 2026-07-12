import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-page/products-page').then((m) => m.ProductsPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./product-form-page/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./product-form-page/product-form-page').then((m) => m.ProductFormPage),
  },
];
