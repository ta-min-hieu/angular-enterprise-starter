import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { I18nService } from '../../../core/i18n/i18n.service';

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';

@Component({
  selector: 'app-date-field',
  imports: [ReactiveFormsModule, NzDatePickerModule, NzFormModule],
  templateUrl: './date-field.html',
  styleUrl: './date-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateField {
  private readonly i18nService = inject(I18nService);

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<Date | null>>();

  readonly id = input<string>();
  readonly placeholder = input<string>();
  readonly showTime = input(false);
  readonly format = input<string>();
  readonly errorMessage = input<string>();

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedFormat = computed(
    () => this.format() ?? (this.showTime() ? DATE_TIME_FORMAT : DATE_FORMAT),
  );
  readonly resolvedPlaceholder = computed(() => this.placeholder() ?? this.resolvedFormat());
  readonly required = computed(() => this.control().hasValidator(Validators.required));
  readonly resolvedErrorMessage = computed(
    () =>
      this.errorMessage() ??
      this.i18nService.translate('common.validation.required_selection', {
        field: this.label(),
      }),
  );
}
