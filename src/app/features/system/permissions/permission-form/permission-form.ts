import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TranslocoPipe } from '@jsverse/transloco';
import { HttpMethod, Permission, PermissionInput } from '../permission.model';
import { CommonStatus } from '../../common-status.model';
import { HTTP_METHOD_OPTIONS, STATUS_OPTIONS } from '../permission.constants';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../shared/components/textarea-field/textarea-field';
import { RadioGroupField } from '../../../../shared/components/radio-group-field/radio-group-field';

export interface PermissionFormSaveEvent {
  readonly input: PermissionInput;
}

@Component({
  selector: 'app-permission-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    TranslocoPipe,
    TextField,
    SelectField,
    TextareaField,
    RadioGroupField,
  ],
  templateUrl: './permission-form.html',
  styleUrl: './permission-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly permission = input<Permission | null>(null);
  readonly saving = input(false);
  readonly save = output<PermissionFormSaveEvent>();
  readonly cancelled = output<void>();

  readonly httpMethodOptions = HTTP_METHOD_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly form = this.fb.group({
    code: this.fb.control('', [Validators.required]),
    name: this.fb.control('', [Validators.required]),
    httpMethod: this.fb.control<HttpMethod>('GET'),
    urlPattern: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    status: this.fb.control<CommonStatus>('ACTIVE'),
  });

  constructor() {
    effect(() => {
      const current = this.permission();
      this.form.reset(
        current
          ? {
              code: current.code,
              name: current.name,
              httpMethod: current.httpMethod,
              urlPattern: current.urlPattern,
              description: current.description,
              status: current.status,
            }
          : {
              code: '',
              name: '',
              httpMethod: 'GET',
              urlPattern: '',
              description: '',
              status: 'ACTIVE',
            },
      );
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((control) => control.updateValueAndValidity());
      return;
    }

    this.save.emit({ input: this.form.getRawValue() });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
