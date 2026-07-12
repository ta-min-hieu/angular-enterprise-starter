import { ErrorCategory } from './error-category';

export interface ValidationErrorDetail {
  readonly field: string;
  readonly message: string;
}

export interface AppError {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly status?: number;
  readonly details?: readonly ValidationErrorDetail[];
  readonly cause?: unknown;
}
