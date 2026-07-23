import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-textarea-field',
  imports: [ReactiveFormsModule, NzInputModule, NzFormModule],
  templateUrl: './textarea-field.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaField {
  private readonly i18nService = inject(I18nService);

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string>>();

  readonly id = input<string>();
  readonly placeholder = input<string>();
  readonly rows = input(3);
  readonly errorMessage = input<string>();
  readonly required = input(true);

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedPlaceholder = computed(
    () =>
      this.placeholder() ??
      this.i18nService.translate('common.placeholder.enter', { field: this.label() }),
  );
  readonly resolvedErrorMessage = computed(
    () =>
      this.errorMessage() ??
      this.i18nService.translate('common.validation.required_field', { field: this.label() }),
  );
}
