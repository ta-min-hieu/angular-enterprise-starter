import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  selector: 'app-checkbox-field',
  imports: [ReactiveFormsModule, NzCheckboxModule, NzFormModule],
  templateUrl: './checkbox-field.html',
  styleUrl: './checkbox-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxField {
  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<boolean>>();

  readonly id = input<string>();

  readonly resolvedId = computed(() => this.id() ?? this.name());
}
