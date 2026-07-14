import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';

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

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.createUrlTree([appConfigService.config().forbiddenPath]);
};
