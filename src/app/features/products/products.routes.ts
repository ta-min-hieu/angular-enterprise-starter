import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    data: { seo: { title: 'products.title' } },
    loadComponent: () => import('./products-page/products-page').then((m) => m.ProductsPage),
  },
  {
    path: 'new',
    data: { seo: { title: 'products.form_page.create_title' } },
    loadComponent: () =>
      import('./product-form-page/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: ':id/edit',
    data: { seo: { title: 'products.form_page.edit_title' } },
    loadComponent: () =>
      import('./product-form-page/product-form-page').then((m) => m.ProductFormPage),
  },
];
