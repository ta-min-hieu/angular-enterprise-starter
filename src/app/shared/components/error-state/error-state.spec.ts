import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './error-state';
import { ErrorCategory } from '../../../core/error/error-category';
import { AppError } from '../../../core/error/app-error';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

function createFixture(error: AppError) {
  TestBed.configureTestingModule({
    imports: [ErrorState],
    providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
  });
  const fixture = TestBed.createComponent(ErrorState);
  fixture.componentRef.setInput('error', error);
  fixture.detectChanges();
  return fixture;
}

describe('ErrorState', () => {
  it('should map Authorization category to 403 status', () => {
    const fixture = createFixture({
      category: ErrorCategory.Authorization,
      code: 'AUTHORIZATION_ERROR',
      message: 'Forbidden',
      retryable: false,
    });

    expect(fixture.componentInstance.status()).toBe('403');
  });

  it('should map NOT_FOUND business error to 404 status', () => {
    const fixture = createFixture({
      category: ErrorCategory.Business,
      code: 'NOT_FOUND',
      message: 'Not found',
      retryable: false,
    });

    expect(fixture.componentInstance.status()).toBe('404');
  });

  it('should map Unexpected category to 500 status', () => {
    const fixture = createFixture({
      category: ErrorCategory.Unexpected,
      code: 'SERVER_ERROR',
      message: 'Server error',
      retryable: false,
    });

    expect(fixture.componentInstance.status()).toBe('500');
  });

  it('should show retry button only when error is retryable and emit retry event on click', () => {
    const fixture = createFixture({
      category: ErrorCategory.Network,
      code: 'NETWORK_ERROR',
      message: 'Network error',
      retryable: true,
    });

    const onRetry = vi.fn();
    fixture.componentInstance.retry.subscribe(onRetry);

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button).toBeTruthy();
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show retry button when error is not retryable', () => {
    const fixture = createFixture({
      category: ErrorCategory.Validation,
      code: 'VALIDATION_ERROR',
      message: 'Invalid',
      retryable: false,
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button).toBeFalsy();
  });
});
