import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { ErrorCategory } from '../../../core/error/error-category';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TextField } from '../../../shared/components/text-field/text-field';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzAlertModule,
    TranslocoPipe,
    TextField,
  ],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18nService = inject(I18nService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((control) => control.updateValueAndValidity());
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(error));
      },
    });
  }

  // Không hiển thị message kỹ thuật gốc từ backend/lỗi cấu hình (vd exception message của
  // ApiService khi apiName sai) trực tiếp cho người dùng cuối — chỉ phân biệt đúng 1 trường hợp
  // nghiệp vụ (sai tài khoản/mật khẩu, ErrorCategory.Authentication), còn lại quy về thông báo
  // chung chung để không lộ chi tiết hạ tầng.
  private resolveErrorMessage(error: unknown): string {
    const category =
      typeof error === 'object' && error !== null && 'category' in error
        ? (error as { category: ErrorCategory }).category
        : undefined;

    return category === ErrorCategory.Authentication
      ? this.i18nService.translate('auth.login.errors.invalid_credentials')
      : this.i18nService.translate('auth.login.errors.generic');
  }
}
