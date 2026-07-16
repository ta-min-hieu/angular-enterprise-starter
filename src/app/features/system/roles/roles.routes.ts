import { Routes } from '@angular/router';

export const rolesRoutes: Routes = [
  {
    path: '',
    data: { seo: { title: 'roles.title' } },
    loadComponent: () => import('./roles-page/roles-page').then((m) => m.RolesPage),
  },
  {
    path: 'new',
    data: { seo: { title: 'roles.form_page.create_title' } },
    loadComponent: () => import('./role-form-page/role-form-page').then((m) => m.RoleFormPage),
  },
  {
    path: ':id/edit',
    data: { seo: { title: 'roles.form_page.edit_title' } },
    loadComponent: () => import('./role-form-page/role-form-page').then((m) => m.RoleFormPage),
  },
];
