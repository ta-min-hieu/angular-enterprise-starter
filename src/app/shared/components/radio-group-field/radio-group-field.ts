import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TranslocoPipe } from '@jsverse/transloco';
import { SelectOption } from '../../models/select-option.model';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-radio-group-field',
  imports: [ReactiveFormsModule, NzRadioModule, NzFormModule, TranslocoPipe],
  templateUrl: './radio-group-field.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupField<T = string> {
  private readonly i18nService = inject(I18nService);

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<T>>();
  readonly options = input.required<readonly SelectOption<T>[]>();

  readonly id = input<string>();
  readonly errorMessage = input<string>();
  readonly required = input(true);

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedErrorMessage = computed(
    () =>
      this.errorMessage() ??
      this.i18nService.translate('common.validation.required_selection', {
        field: this.label(),
      }),
  );
}
