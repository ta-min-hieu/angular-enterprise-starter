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
import { User } from '../user.model';
import { Role } from '../../roles/role.model';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { CheckboxField } from '../../../../shared/components/checkbox-field/checkbox-field';
import { MultiSelectField } from '../../../../shared/components/multi-select-field/multi-select-field';

export interface UserFormSaveEvent {
  readonly username: string;
  readonly password?: string;
  readonly enabled: boolean;
  readonly roleIds: readonly string[];
}

const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    TranslocoPipe,
    TextField,
    CheckboxField,
    MultiSelectField,
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly user = input<User | null>(null);
  readonly roles = input<readonly Role[]>([]);
  readonly saving = input(false);
  readonly save = output<UserFormSaveEvent>();
  readonly cancelled = output<void>();

  readonly isEditMode = computed(() => !!this.user());

  // label = tên Role thật (dữ liệu, không phải i18n key) -> MultiSelectField.translateLabels=false.
  readonly roleOptions = computed<readonly SelectOption<string>[]>(() =>
    this.roles().map((role) => ({ label: role.roleName, value: role.id })),
  );

  readonly form = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control(''),
    enabled: this.fb.control(true),
    roleIds: this.fb.control<string[]>([]),
  });

  constructor() {
    effect(() => {
      const current = this.user();
      this.form.reset(
        current
          ? {
              username: current.username,
              password: '',
              enabled: current.enabled,
              roleIds: current.roles.map((role) => role.id),
            }
          : { username: '', password: '', enabled: true, roleIds: [] },
      );

      // username bất biến sau khi tạo (backend không có field này trên UpdateUserRequest).
      const usernameControl = this.form.controls.username;
      if (current) {
        usernameControl.disable({ emitEvent: false });
      } else {
        usernameControl.enable({ emitEvent: false });
      }

      // password: bắt buộc lúc tạo, tuỳ chọn (để trống = giữ nguyên) lúc sửa.
      const passwordControl = this.form.controls.password;
      passwordControl.setValidators(
        current
          ? [Validators.minLength(MIN_PASSWORD_LENGTH)]
          : [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
      );
      passwordControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((control) => control.updateValueAndValidity());
      return;
    }

    const { username, password, enabled, roleIds } = this.form.getRawValue();
    this.save.emit({ username, password: password || undefined, enabled, roleIds });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
