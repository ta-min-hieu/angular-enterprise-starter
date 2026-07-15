import { Routes } from '@angular/router';

export const rolesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./roles-page/roles-page').then((m) => m.RolesPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./role-form-page/role-form-page').then((m) => m.RoleFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./role-form-page/role-form-page').then((m) => m.RoleFormPage),
  },
];
