import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TranslocoPipe } from '@jsverse/transloco';
import { HttpMethod, Permission } from '../../permissions/permission.model';

export interface RolePermissionAssignSaveEvent {
  readonly permissionIds: readonly string[];
}

const METHOD_COLORS: Readonly<Record<HttpMethod, string>> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'purple',
  DELETE: 'red',
  '*': 'default',
};

// Permission phía backend không có field nhóm (module) — hiển thị dạng danh sách phẳng, sắp theo
// code, thay vì gom nhóm như thiết kế giả định ban đầu.
@Component({
  selector: 'app-role-permission-assign',
  imports: [NzCheckboxModule, NzButtonModule, NzIconModule, NzTagModule, TranslocoPipe],
  templateUrl: './role-permission-assign.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionAssign {
  readonly permissions = input<readonly Permission[]>([]);
  readonly assignedIds = input<readonly string[]>([]);
  readonly saving = input(false);
  readonly save = output<RolePermissionAssignSaveEvent>();

  // linkedSignal vì đây là state có thể sửa cục bộ (tick/untick checkbox) nhưng phải reset lại
  // theo assignedIds() mỗi khi role đang xem đổi.
  readonly checkedIds = linkedSignal<ReadonlySet<string>>(() => new Set(this.assignedIds()));

  isChecked(id: string): boolean {
    return this.checkedIds().has(id);
  }

  methodColor(method: HttpMethod): string {
    return METHOD_COLORS[method];
  }

  onToggle(id: string, checked: boolean): void {
    const next = new Set(this.checkedIds());
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.checkedIds.set(next);
  }

  onSubmit(): void {
    this.save.emit({ permissionIds: [...this.checkedIds()] });
  }
}
