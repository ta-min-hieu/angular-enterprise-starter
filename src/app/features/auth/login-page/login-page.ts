import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { AppError } from '../../../core/error/app-error';
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
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
      error: (error: AppError) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
