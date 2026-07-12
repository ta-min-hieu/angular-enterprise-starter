import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ErrorCategory } from '../error/error-category';
import { mapHttpErrorToAppError } from '../error/http-error-mapper';
import { LoggerService } from '../logger/logger.service';
import { SKIP_AUTH } from './http-context-tokens';
import { applyRetryStrategy } from './retry-strategy';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const logger = inject(LoggerService);
  const authService = inject(AuthService);

  return applyRetryStrategy(request, next(request)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const appError = mapHttpErrorToAppError(error);
      const logContext = {
        code: appError.code,
        status: appError.status,
        url: request.url,
        correlationId: request.headers.get('X-Correlation-Id') ?? undefined,
      };

      if (appError.category === ErrorCategory.Validation) {
        logger.warn(appError.message, logContext);
      } else {
        logger.error(appError.message, logContext);
      }

      if (error.status === 401 && !request.context.get(SKIP_AUTH)) {
        authService.handleUnauthorized().subscribe({ error: () => undefined });
      }

      return throwError(() => appError);
    }),
  );
};
