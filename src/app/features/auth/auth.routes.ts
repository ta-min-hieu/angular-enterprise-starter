import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    data: { seo: { title: 'auth.login.title', description: 'auth.login.subtitle' } },
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPage),
  },
];
