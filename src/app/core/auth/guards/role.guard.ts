import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { BrowserService } from '../../browser/browser.service';

// Khai báo qua route data: { roles: ['ADMIN', 'MANAGER'] } — cho qua nếu user có BẤT KỲ role nào
// trong danh sách. Dùng song song permissionGuard khi cần chặn cả ở route (không chỉ ẩn menu item).
export const roleGuard: CanActivateFn = (route) => {
  const requiredRoles = route.data['roles'] as readonly string[] | undefined;

  if (!requiredRoles?.length) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const appConfigService = inject(AppConfigService);
  const browserService = inject(BrowserService);

  // Phía SSR không đọc được token trong localStorage nên không thể biết role thật — bỏ qua kiểm
  // tra ở đây, giống authGuard, để tránh render nhầm trang 403 cho user thực ra CÓ quyền (token
  // chỉ xác định được ở trình duyệt). authGuard đứng trước trong canActivate đã lo phần "chưa đăng
  // nhập" rồi; guard này chỉ cần lo phần "đăng nhập rồi nhưng sai role".
  if (!browserService.isBrowser || authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Token hợp lệ nhưng roles rỗng (vd tài khoản Keycloak chưa được cấp role nghiệp vụ nào) thì
  // KHÔNG route nào trong app truy cập được — hiện /forbidden chỉ tạo vòng lặp chết vì "Về trang
  // chủ" cũng bị chặn tiếp bởi chính guard này. Khác với case có role nhưng không đủ cho route
  // NÀY (vẫn còn trang khác dùng được, hiện 403 là đúng), roles rỗng nghĩa là phiên không dùng
  // được nữa — coi như hết hạn, đăng xuất hẳn và đưa về /auth/login thay vì 403.
  if (authService.currentUser()?.roles.length === 0) {
    authService.logout();
    return false;
  }

  return router.createUrlTree([appConfigService.config().forbiddenPath]);
};
