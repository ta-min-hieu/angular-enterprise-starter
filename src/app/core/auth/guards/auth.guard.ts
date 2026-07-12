import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { BrowserService } from '../../browser/browser.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const appConfigService = inject(AppConfigService);
  const browserService = inject(BrowserService);

  // Token đăng nhập được lưu ở localStorage, phía server (SSR) không đọc được nên
  // không thể xác định đúng trạng thái đăng nhập — bỏ qua kiểm tra ở SSR, chỉ chặn
  // ở trình duyệt (nơi có thể đọc localStorage chính xác), tránh F5 bị bật ngược về login.
  if (!browserService.isBrowser || authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([appConfigService.config().authRedirectPath], {
    queryParams: { returnUrl: state.url },
  });
};
