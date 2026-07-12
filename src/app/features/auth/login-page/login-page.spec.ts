import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './login-page';
import { AuthService } from '../../../core/auth/auth.service';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('LoginPage', () => {
  function setup(returnUrl: string | null = null) {
    const authService = { loginWithoutBackend: vi.fn() };

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

    expect(authService.loginWithoutBackend).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should log in with any credentials and navigate to /products by default', () => {
    const { fixture, authService, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({ username: 'alice', password: 'anything' });
    fixture.componentInstance.onSubmit();

    expect(authService.loginWithoutBackend).toHaveBeenCalledWith('alice');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/products');
  });

  it('should navigate to the returnUrl when one is provided', () => {
    const { fixture, router } = setup('/products/new');
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({ username: 'bob', password: 'anything' });
    fixture.componentInstance.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/products/new');
  });
});
