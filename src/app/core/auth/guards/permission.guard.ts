import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { BrowserService } from '../../browser/browser.service';

export const permissionGuard: CanActivateFn = (route) => {
  const requiredPermission = route.data['permission'] as string | undefined;

  if (!requiredPermission) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const appConfigService = inject(AppConfigService);
  const browserService = inject(BrowserService);

  // Bỏ qua kiểm tra ở SSR — cùng lý do với roleGuard (xem ghi chú ở đó): SSR không đọc được token.
  if (!browserService.isBrowser || authService.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree([appConfigService.config().forbiddenPath]);
};
