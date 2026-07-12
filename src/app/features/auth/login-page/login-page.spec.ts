import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { LoginPage } from './login-page';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUser } from '../../../core/auth/current-user.model';
import { ErrorCategory } from '../../../core/error/error-category';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const USER: CurrentUser = { id: '1', username: 'alice', roles: ['USER'], permissions: [] };

describe('LoginPage', () => {
  function setup(returnUrl: string | null = null) {
    const authService = { login: vi.fn() };

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ returnUrl }) } },
        },
      ],
    });

    const fixture = TestBed.createComponent(LoginPage);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    return { fixture, router, authService };
  }

  it('should create', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not submit when the form is invalid', () => {
    const { fixture, authService, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should log in and navigate to /products by default on success', () => {
    const { fixture, authService, router } = setup();
    authService.login.mockReturnValue(of(USER));
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({ username: 'alice', password: 'secret' });
    fixture.componentInstance.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/products');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should navigate to the returnUrl when one is provided', () => {
    const { fixture, authService, router } = setup('/products/new');
    authService.login.mockReturnValue(of(USER));
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({ username: 'bob', password: 'secret' });
    fixture.componentInstance.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/products/new');
  });

  it('should show the error message and stop loading when login fails', () => {
    const { fixture, authService, router } = setup();
    authService.login.mockReturnValue(
      throwError(() => ({
        category: ErrorCategory.Authentication,
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid username or password',
        retryable: false,
      })),
    );
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({ username: 'alice', password: 'wrong' });
    fixture.componentInstance.onSubmit();

    expect(fixture.componentInstance.errorMessage()).toBe('Invalid username or password');
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
