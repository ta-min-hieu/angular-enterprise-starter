import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from './app-error';
import { ErrorCategory } from './error-category';
import { ApiResponse } from '../http/api-response.model';

function isApiErrorResponse(body: unknown): body is ApiResponse<unknown> {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    (body as { code: unknown }).code !== '200'
  );
}

export function mapHttpErrorToAppError(error: HttpErrorResponse): AppError {
  const apiError = isApiErrorResponse(error.error) ? error.error : undefined;
  const message = apiError?.message ?? error.message;
  const code = apiError?.code;

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
        code: code ?? 'VALIDATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 401:
      return {
        category: ErrorCategory.Authentication,
        code: code ?? 'AUTHENTICATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 403:
      return {
        category: ErrorCategory.Authorization,
        code: code ?? 'AUTHORIZATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 404:
      return {
        category: ErrorCategory.Business,
        code: code ?? 'NOT_FOUND',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 409:
      return {
        category: ErrorCategory.Business,
        code: code ?? 'CONFLICT',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 422:
      return {
        category: ErrorCategory.Validation,
        code: code ?? 'BUSINESS_VALIDATION_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
    case 429:
      return {
        category: ErrorCategory.Network,
        code: code ?? 'TOO_MANY_REQUESTS',
        message,
        retryable: true,
        status: error.status,
        cause: error,
      };
    case 503:
      return {
        category: ErrorCategory.Network,
        code: code ?? 'SERVICE_UNAVAILABLE',
        message,
        retryable: true,
        status: error.status,
        cause: error,
      };
    default:
      return {
        category: ErrorCategory.Unexpected,
        code: code ?? 'SERVER_ERROR',
        message,
        retryable: false,
        status: error.status,
        cause: error,
      };
  }
}
