import { RenderMode, ServerRoute } from '@angular/ssr';

// Chỉ /auth/login dùng SSG (nội dung tĩnh, giống nhau cho mọi người dùng, không phụ thuộc trạng
// thái đăng nhập) — prerender lúc build cho tải nhanh nhất. Mọi route còn lại (Admin/CRUD, yêu cầu
// đăng nhập, dữ liệu đổi liên tục) dùng CSR theo đúng docs/06-rendering-strategy.md § CSR.
export const serverRoutes: ServerRoute[] = [
  { path: 'auth/login', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
