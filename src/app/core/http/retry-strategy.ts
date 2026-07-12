import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { mapHttpErrorToAppError } from '../error/http-error-mapper';

const MAX_RETRY_COUNT = 2;
const BASE_BACKOFF_MS = 300;
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function computeBackoffMs(error: HttpErrorResponse, attempt: number): number {
  const retryAfterHeader = error.headers?.get('Retry-After');
  const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;

  if (!Number.isNaN(retryAfterSeconds)) {
    return retryAfterSeconds * 1000;
  }

  return BASE_BACKOFF_MS * 2 ** (attempt - 1);
}

export function applyRetryStrategy<T>(
  request: HttpRequest<unknown>,
  source: Observable<T>,
): Observable<T> {
  // Chỉ retry method idempotent để tránh lặp side-effect (ví dụ double-submit POST).
  if (!IDEMPOTENT_METHODS.has(request.method)) {
    return source;
  }

  return source.pipe(
    retry({
      count: MAX_RETRY_COUNT,
      delay: (error: unknown, attempt: number) => {
        if (!(error instanceof HttpErrorResponse)) {
          throw error;
        }

        const appError = mapHttpErrorToAppError(error);
        if (!appError.retryable) {
          throw error;
        }

        return timer(computeBackoffMs(error, attempt));
      },
    }),
  );
}
