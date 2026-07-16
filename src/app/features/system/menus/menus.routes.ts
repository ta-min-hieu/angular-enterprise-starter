import { Routes } from '@angular/router';

export const menusRoutes: Routes = [
  {
    path: '',
    data: { seo: { title: 'menus.title' } },
    loadComponent: () => import('./menus-page/menus-page').then((m) => m.MenusPage),
  },
  {
    path: 'new',
    data: { seo: { title: 'menus.form_page.create_title' } },
    loadComponent: () => import('./menu-form-page/menu-form-page').then((m) => m.MenuFormPage),
  },
  {
    path: ':id/edit',
    data: { seo: { title: 'menus.form_page.edit_title' } },
    loadComponent: () => import('./menu-form-page/menu-form-page').then((m) => m.MenuFormPage),
  },
];
