import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    data: { seo: { title: 'users.title' } },
    loadComponent: () => import('./users-page/users-page').then((m) => m.UsersPage),
  },
  {
    path: 'new',
    data: { seo: { title: 'users.form_page.create_title' } },
    loadComponent: () => import('./user-form-page/user-form-page').then((m) => m.UserFormPage),
  },
  {
    path: ':id/edit',
    data: { seo: { title: 'users.form_page.edit_title' } },
    loadComponent: () => import('./user-form-page/user-form-page').then((m) => m.UserFormPage),
  },
];
