import { HttpErrorResponse } from '@angular/common/http';
import { AppError, ValidationErrorDetail } from './app-error';
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

// Backend (GlobalExceptionHandler) trả lỗi validate dưới dạng `data: { [field]: string[] }` (mỗi field
// có thể vi phạm nhiều ràng buộc) thay vì mảng {field, message} phẳng — làm phẳng lại ở đây để UI
// (vd Product Form) hiển thị được lỗi theo từng field.
function extractValidationDetails(data: unknown): readonly ValidationErrorDetail[] | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const details: ValidationErrorDetail[] = [];
  for (const [field, messages] of Object.entries(data as Record<string, unknown>)) {
    if (!Array.isArray(messages)) {
      continue;
    }
    for (const message of messages) {
      if (typeof message === 'string') {
        details.push({ field, message });
      }
    }
  }

  return details.length > 0 ? details : undefined;
}

export function mapHttpErrorToAppError(error: HttpErrorResponse): AppError {
  const apiError = isApiErrorResponse(error.error) ? error.error : undefined;
  const message = apiError?.message ?? error.message;
  const code = apiError?.code;
  const details = extractValidationDetails(apiError?.data);

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
        details,
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
        details,
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
