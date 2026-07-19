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
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { TranslocoPipe } from '@jsverse/transloco';
import { Menu, MenuInput, MenuType } from '../menu.model';
import { CommonStatus } from '../../common-status.model';
import { MENU_TYPE_OPTIONS, STATUS_OPTIONS } from '../menu.constants';
import { buildMenuTree, toTreeNodeOptions } from '../menu.mapper';
import { TextField } from '../../../../shared/components/text-field/text-field';
import { NumberField } from '../../../../shared/components/number-field/number-field';
import { RadioGroupField } from '../../../../shared/components/radio-group-field/radio-group-field';
import { SelectField } from '../../../../shared/components/select-field/select-field';
import { CheckboxField } from '../../../../shared/components/checkbox-field/checkbox-field';
import { IconPickerField } from '../../../../shared/components/icon-picker-field/icon-picker-field';

export interface MenuFormSaveEvent {
  readonly input: MenuInput;
}

@Component({
  selector: 'app-menu-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    NzTreeSelectModule,
    TranslocoPipe,
    TextField,
    NumberField,
    RadioGroupField,
    SelectField,
    CheckboxField,
    IconPickerField,
  ],
  templateUrl: './menu-form.html',
  styleUrl: './menu-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly menu = input<Menu | null>(null);
  readonly allMenus = input<readonly Menu[]>([]);
  // parentId gợi ý khi tạo "menu con" từ nút Thêm trên cây (route ?parentId=...).
  readonly defaultParentId = input<string | null>(null);
  readonly saving = input(false);
  readonly save = output<MenuFormSaveEvent>();
  readonly cancelled = output<void>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly menuTypeOptions = MENU_TYPE_OPTIONS;

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    path: this.fb.control('', [Validators.required]),
    component: this.fb.control(''),
    icon: this.fb.control(''),
    menuType: this.fb.control<MenuType>('MENU', [Validators.required]),
    parentId: this.fb.control<string | null>(null),
    sortOrder: this.fb.control(0, [Validators.required, Validators.min(0)]),
    visible: this.fb.control(true),
    status: this.fb.control<CommonStatus>('ACTIVE'),
  });

  // Không cho chọn chính node đang sửa hoặc bất kỳ hậu duệ nào của nó làm cha (tránh vòng lặp).
  readonly parentTreeNodes = computed(() => {
    const excludedIds = this.descendantIds(this.menu()?.id ?? null);
    const selectable = this.allMenus().filter((candidate) => !excludedIds.has(candidate.id));
    return toTreeNodeOptions(buildMenuTree(selectable));
  });

  constructor() {
    effect(() => {
      const current = this.menu();
      this.form.reset(
        current
          ? {
              name: current.name,
              path: current.path,
              component: current.component,
              icon: current.icon,
              menuType: current.menuType,
              parentId: current.parentId,
              sortOrder: current.sortOrder,
              visible: current.visible,
              status: current.status,
            }
          : {
              name: '',
              path: '',
              component: '',
              icon: '',
              menuType: 'MENU',
              parentId: this.defaultParentId(),
              sortOrder: 0,
              visible: true,
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

  private descendantIds(rootId: string | null): ReadonlySet<string> {
    if (!rootId) {
      return new Set();
    }

    const ids = new Set<string>([rootId]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const candidate of this.allMenus()) {
        if (candidate.parentId && ids.has(candidate.parentId) && !ids.has(candidate.id)) {
          ids.add(candidate.id);
          grew = true;
        }
      }
    }

    return ids;
  }
}
