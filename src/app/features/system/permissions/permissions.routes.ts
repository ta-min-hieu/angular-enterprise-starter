import { Routes } from '@angular/router';

export const permissionsRoutes: Routes = [
  {
    path: '',
    data: { seo: { title: 'permissions.title' } },
    loadComponent: () =>
      import('./permissions-page/permissions-page').then((m) => m.PermissionsPage),
  },
  {
    path: 'new',
    data: { seo: { title: 'permissions.form_page.create_title' } },
    loadComponent: () =>
      import('./permission-form-page/permission-form-page').then((m) => m.PermissionFormPage),
  },
  {
    path: ':id/edit',
    data: { seo: { title: 'permissions.form_page.edit_title' } },
    loadComponent: () =>
      import('./permission-form-page/permission-form-page').then((m) => m.PermissionFormPage),
  },
];
