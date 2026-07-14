import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'auth/login', renderMode: RenderMode.Server },
  { path: 'products', renderMode: RenderMode.Server },
  { path: 'products/new', renderMode: RenderMode.Server },
  { path: 'products/:id/edit', renderMode: RenderMode.Server },
  { path: 'forbidden', renderMode: RenderMode.Server, status: 403 },
  { path: 'server-error', renderMode: RenderMode.Server, status: 500 },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
