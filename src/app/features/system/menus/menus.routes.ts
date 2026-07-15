import { Routes } from '@angular/router';

export const menusRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./menus-page/menus-page').then((m) => m.MenusPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./menu-form-page/menu-form-page').then((m) => m.MenuFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./menu-form-page/menu-form-page').then((m) => m.MenuFormPage),
  },
];
