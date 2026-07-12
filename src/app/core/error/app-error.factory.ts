import { ErrorCategory } from './error-category';
import { AppError } from './app-error';
import { ApiResponse } from '../http/api-response.model';

export function mapApiErrorToAppError(response: ApiResponse<unknown>): AppError {
  return {
    category: ErrorCategory.Business,
    code: response.code,
    message: response.message,
    retryable: false,
  };
}
