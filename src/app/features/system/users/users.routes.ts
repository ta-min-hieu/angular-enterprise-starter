import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-page/users-page').then((m) => m.UsersPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form-page/user-form-page').then((m) => m.UserFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./user-form-page/user-form-page').then((m) => m.UserFormPage),
  },
];
