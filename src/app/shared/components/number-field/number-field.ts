import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule } from 'ng-zorro-antd/form';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-number-field',
  imports: [ReactiveFormsModule, NzInputNumberModule, NzFormModule],
  templateUrl: './number-field.html',
  styleUrl: './number-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberField {
  private readonly i18nService = inject(I18nService);

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<number>>();

  readonly id = input<string>();
  readonly min = input(0);
  readonly max = input(Number.MAX_SAFE_INTEGER);
  readonly step = input(1);
  readonly formatter = input<((value: number) => string) | null>(null);
  readonly parser = input<((value: string) => number) | null>(null);
  readonly errorMessage = input<string>();
  readonly required = input(true);

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedErrorMessage = computed(
    () =>
      this.errorMessage() ??
      this.i18nService.translate('common.validation.required_field', { field: this.label() }),
  );
}
