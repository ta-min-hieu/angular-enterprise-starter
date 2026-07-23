import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey } from 'ng-zorro-antd/core/tree';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { Menu } from '../../menus/menu.model';
import { buildMenuTree, toTreeNodeOptions } from '../../menus/menu.mapper';

export interface RoleMenuAssignSaveEvent {
  readonly menuIds: readonly string[];
}

@Component({
  selector: 'app-role-menu-assign',
  imports: [NzTreeModule, NzButtonModule, NzIconModule, TranslocoPipe],
  templateUrl: './role-menu-assign.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleMenuAssign {
  readonly menus = input<readonly Menu[]>([]);
  readonly assignedIds = input<readonly string[]>([]);
  readonly saving = input(false);
  readonly save = output<RoleMenuAssignSaveEvent>();

  // Kiểu mutable string[] (không phải readonly) để khớp NzTreeNodeKey[] mà nz-tree yêu cầu cho
  // [nzCheckedKeys]/(nzCheckedKeysChange). linkedSignal vì đây là state có thể sửa cục bộ (tick/untick
  // trên cây) nhưng phải reset lại theo assignedIds() mỗi khi role đang xem đổi.
  readonly checkedKeys = linkedSignal(() => [...this.assignedIds()]);

  readonly treeNodes = computed(() => toTreeNodeOptions(buildMenuTree(this.menus())));

  // Menu id (key trong cây) luôn là string ở phía FE (xem Menu.id) — nz-tree khai báo kiểu key
  // rộng hơn (NzTreeNodeKey = string | number) nên convert tường minh ở biên component này.
  onCheckedKeysChange(keys: NzTreeNodeKey[]): void {
    this.checkedKeys.set(keys.map(String));
  }

  onSubmit(): void {
    this.save.emit({ menuIds: this.checkedKeys() });
  }
}
