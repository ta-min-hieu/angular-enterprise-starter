import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TranslocoPipe } from '@jsverse/transloco';
import { SelectOption } from '../../models/select-option.model';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule, NzSelectModule, NzFormModule, TranslocoPipe],
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectField<T = string> {
  private readonly i18nService = inject(I18nService);

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<T>>();
  readonly options = input.required<readonly SelectOption<T>[]>();

  readonly id = input<string>();
  readonly placeholder = input<string>();
  readonly errorMessage = input<string>();
  readonly required = input(true);

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedPlaceholder = computed(
    () =>
      this.placeholder() ??
      this.i18nService.translate('common.placeholder.select', { field: this.label() }),
  );
  readonly resolvedErrorMessage = computed(
    () =>
      this.errorMessage() ??
      this.i18nService.translate('common.validation.required_selection', {
        field: this.label(),
      }),
  );
}
