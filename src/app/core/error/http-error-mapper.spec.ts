import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { mapHttpErrorToAppError } from './http-error-mapper';
import { ErrorCategory } from './error-category';

function createHttpError(status: number, error?: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error, statusText: 'error' });
}

describe('mapHttpErrorToAppError', () => {
  it('should map status 0 to retryable Network error', () => {
    const result = mapHttpErrorToAppError(createHttpError(0));

    expect(result.category).toBe(ErrorCategory.Network);
    expect(result.retryable).toBe(true);
  });

  it('should map 400 to non-retryable Validation error', () => {
    const result = mapHttpErrorToAppError(createHttpError(400));

    expect(result.category).toBe(ErrorCategory.Validation);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.retryable).toBe(false);
  });

  it('should map 401 to Authentication error', () => {
    const result = mapHttpErrorToAppError(createHttpError(401));

    expect(result.category).toBe(ErrorCategory.Authentication);
  });

  it('should map 403 to Authorization error', () => {
    const result = mapHttpErrorToAppError(createHttpError(403));

    expect(result.category).toBe(ErrorCategory.Authorization);
  });

  it('should map 404 to Business error with NOT_FOUND code', () => {
    const result = mapHttpErrorToAppError(createHttpError(404));

    expect(result.category).toBe(ErrorCategory.Business);
    expect(result.code).toBe('NOT_FOUND');
  });

  it('should map 422 to retryable=false Validation error with BUSINESS_VALIDATION_ERROR code', () => {
    const result = mapHttpErrorToAppError(createHttpError(422));

    expect(result.category).toBe(ErrorCategory.Validation);
    expect(result.code).toBe('BUSINESS_VALIDATION_ERROR');
    expect(result.retryable).toBe(false);
  });

  it('should map 429 to retryable Network error', () => {
    const result = mapHttpErrorToAppError(createHttpError(429));

    expect(result.category).toBe(ErrorCategory.Network);
    expect(result.code).toBe('TOO_MANY_REQUESTS');
    expect(result.retryable).toBe(true);
  });

  it('should map 503 to retryable Network error', () => {
    const result = mapHttpErrorToAppError(createHttpError(503));

    expect(result.retryable).toBe(true);
    expect(result.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('should map unknown status to Unexpected error', () => {
    const result = mapHttpErrorToAppError(createHttpError(500));

    expect(result.category).toBe(ErrorCategory.Unexpected);
    expect(result.retryable).toBe(false);
  });

  it('should extract code and message from the API error envelope', () => {
    const result = mapHttpErrorToAppError(
      createHttpError(400, { code: 'FIELD_REQUIRED', message: 'Username is required', data: null }),
    );

    expect(result.code).toBe('FIELD_REQUIRED');
    expect(result.message).toBe('Username is required');
  });
});
