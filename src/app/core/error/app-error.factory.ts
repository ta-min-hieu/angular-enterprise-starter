import { ErrorCategory } from './error-category';
import { AppError } from './app-error';
import { ApiErrorResponse } from '../http/api-response.model';

export function mapApiErrorToAppError(response: ApiErrorResponse): AppError {
  return {
    category: ErrorCategory.Business,
    code: response.error.code,
    message: response.error.message,
    retryable: false,
    details: response.error.details,
  };
}
