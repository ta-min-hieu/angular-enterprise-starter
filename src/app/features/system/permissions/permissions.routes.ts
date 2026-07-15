import { Routes } from '@angular/router';

export const permissionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./permissions-page/permissions-page').then((m) => m.PermissionsPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./permission-form-page/permission-form-page').then((m) => m.PermissionFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./permission-form-page/permission-form-page').then((m) => m.PermissionFormPage),
  },
];
