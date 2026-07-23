import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppError } from '../../../core/error/app-error';
import { ErrorCategory } from '../../../core/error/error-category';

type ResultStatus = '404' | '500' | '403' | 'error' | 'warning';

@Component({
  selector: 'app-error-state',
  imports: [NzResultModule, NzButtonModule, TranslocoPipe],
  templateUrl: './error-state.html',
  host: { class: 'block p-lg' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly error = input.required<AppError>();

  readonly retry = output<void>();

  readonly status = computed<ResultStatus>(() => this.resolveStatus(this.error()));

  onRetry(): void {
    this.retry.emit();
  }

  private resolveStatus(error: AppError): ResultStatus {
    switch (error.category) {
      case ErrorCategory.Authorization:
        return '403';
      case ErrorCategory.Business:
        return error.code === 'NOT_FOUND' ? '404' : 'warning';
      case ErrorCategory.Authentication:
        return 'warning';
      case ErrorCategory.Validation:
        return 'warning';
      case ErrorCategory.Unexpected:
        return '500';
      case ErrorCategory.Network:
      default:
        return 'error';
    }
  }
}
