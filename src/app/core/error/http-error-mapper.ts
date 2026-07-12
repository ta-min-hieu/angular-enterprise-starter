import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from './app-error';
import { ErrorCategory } from './error-category';
import { ApiErrorResponse } from '../http/api-response.model';

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    (body as { success: unknown }).success === false
  );
}

export function mapHttpErrorToAppError(error: HttpErrorResponse): AppError {
  const apiError = isApiErrorResponse(error.error) ? error.error.error : undefined;
  const message = apiError?.message ?? error.message;
  const details = apiError?.details;

  if (error.status === 0) {
    return {
      category: ErrorCategory.Network,
      code: 'NETWORK_ERROR',
      message,
      retryable: true,
      status: error.status,
      cause: error,
    };
  }

  switch (error.status) {
    case 400:
      return {
        category: ErrorCategory.Validation,
        code: apiError?.code ?? 'VALIDATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        details,
        cause: error,
      };
    case 401:
      return {
        category: ErrorCategory.Authentication,
        code: apiError?.code ?? 'AUTHENTICATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 403:
      return {
        category: ErrorCategory.Authorization,
        code: apiError?.code ?? 'AUTHORIZATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 404:
      return {
        category: ErrorCategory.Business,
        code: apiError?.code ?? 'NOT_FOUND',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 409:
      return {
        category: ErrorCategory.Business,
        code: apiError?.code ?? 'CONFLICT',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 422:
      return {
        category: ErrorCategory.Validation,
        code: apiError?.code ?? 'BUSINESS_VALIDATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        details,
        cause: error,
      };
    case 429:
      return {
        category: ErrorCategory.Network,
        code: apiError?.code ?? 'TOO_MANY_REQUESTS',
        message,
        retryable: true,
        status: error.status,
        cause: error,
      };
    case 503:
      return {
        category: ErrorCategory.Network,
        code: apiError?.code ?? 'SERVICE_UNAVAILABLE',
        message,
        retryable: true,
        status: error.status,
        cause: error,
      };
    default:
      return {
        category: ErrorCategory.Unexpected,
        code: apiError?.code ?? 'SERVER_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
  }
}
