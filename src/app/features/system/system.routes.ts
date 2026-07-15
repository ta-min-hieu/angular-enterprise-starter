import { Routes } from '@angular/router';

export const systemRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes').then((m) => m.usersRoutes),
  },
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.routes').then((m) => m.rolesRoutes),
  },
  {
    path: 'menus',
    loadChildren: () => import('./menus/menus.routes').then((m) => m.menusRoutes),
  },
  {
    path: 'permissions',
    loadChildren: () => import('./permissions/permissions.routes').then((m) => m.permissionsRoutes),
  },
];
