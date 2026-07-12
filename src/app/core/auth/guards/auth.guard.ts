import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AppConfigService } from '../../config/app-config.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const appConfigService = inject(AppConfigService);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([appConfigService.config().authRedirectPath]);
};
