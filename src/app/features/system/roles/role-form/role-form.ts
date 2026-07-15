import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TranslocoPipe } from '@jsverse/transloco';
import { DataScope, Role, RoleInput } from '../role.model';
import { CommonStatus } from '../../common-status.model';
import { DATA_SCOPE_OPTIONS, STATUS_OPTIONS } from '../role.constants';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { TextareaField } from '../../../../shared/components/textarea-field/textarea-field';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { RadioGroupField } from '../../../../shared/components/radio-group-field/radio-group-field';

export interface RoleFormSaveEvent {
  readonly input: RoleInput;
}

@Component({
  selector: 'app-role-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    TranslocoPipe,
    TextField,
    TextareaField,
    SelectField,
    RadioGroupField,
  ],
  templateUrl: './role-form.html',
  styleUrl: './role-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly role = input<Role | null>(null);
  readonly saving = input(false);
  readonly save = output<RoleFormSaveEvent>();
  readonly cancelled = output<void>();

  readonly dataScopeOptions = DATA_SCOPE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  // roleKey bất biến sau khi tạo — server bỏ qua field này trên PUT (xem role.model.ts).
  readonly isEditMode = computed(() => !!this.role());

  readonly form = this.fb.group({
    roleKey: this.fb.control('', [Validators.required, Validators.pattern(/^[A-Z][A-Z0-9_]*$/)]),
    roleName: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    dataScope: this.fb.control<DataScope>('ALL'),
    status: this.fb.control<CommonStatus>('ACTIVE'),
    sortOrder: this.fb.control(0),
  });

  constructor() {
    effect(() => {
      const current = this.role();
      this.form.reset(
        current
          ? {
              roleKey: current.roleKey,
              roleName: current.roleName,
              description: current.description,
              dataScope: current.dataScope,
              status: current.status,
              sortOrder: current.sortOrder,
            }
          : {
              roleKey: '',
              roleName: '',
              description: '',
              dataScope: 'ALL',
              status: 'ACTIVE',
              sortOrder: 0,
            },
      );

      const roleKeyControl = this.form.controls.roleKey;
      if (current) {
        roleKeyControl.disable({ emitEvent: false });
      } else {
        roleKeyControl.enable({ emitEvent: false });
      }
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
