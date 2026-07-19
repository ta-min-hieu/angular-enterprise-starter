import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { I18nService } from '../../../core/i18n/i18n.service';
import { NAV_ICON_OPTIONS } from './nav-icon.constants';

@Component({
  selector: 'app-icon-picker-field',
  imports: [ReactiveFormsModule, NzSelectModule, NzFormModule, NzIconModule, TranslocoPipe],
  templateUrl: './icon-picker-field.html',
  styleUrl: './icon-picker-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPickerField {
  private readonly i18nService = inject(I18nService);

  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string>>();

  readonly id = input<string>();
  readonly placeholder = input<string>();
  readonly required = input(false);

  readonly options = NAV_ICON_OPTIONS;

  readonly resolvedId = computed(() => this.id() ?? this.name());
  readonly resolvedPlaceholder = computed(
    () =>
      this.placeholder() ??
      this.i18nService.translate('common.placeholder.select', { field: this.label() }),
  );
}
