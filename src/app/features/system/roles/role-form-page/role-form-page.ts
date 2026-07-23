import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { TranslocoPipe } from '@jsverse/transloco';
import { RoleService } from '../role.service';
import { RoleForm, RoleFormSaveEvent } from '../role-form/role-form';
import {
  RolePermissionAssign,
  RolePermissionAssignSaveEvent,
} from '../role-permission-assign/role-permission-assign';
import { RoleMenuAssign, RoleMenuAssignSaveEvent } from '../role-menu-assign/role-menu-assign';
import { PermissionService } from '../../permissions/permission.service';
import { MenuService } from '../../menus/menu.service';
import { NotificationService } from '../../../../core/notification/notification.service';
import {
  PageBreadcrumbItem,
  PageHeader,
} from '../../../../shared/components/page-header/page-header';
import { createEntityByIdLoader } from '../../../../shared/crud/entity-by-id-loader.util';

@Component({
  selector: 'app-role-form-page',
  imports: [
    NzCardModule,
    NzTabsModule,
    TranslocoPipe,
    RoleForm,
    RolePermissionAssign,
    RoleMenuAssign,
    PageHeader,
  ],
  templateUrl: './role-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleFormPage {
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly menuService = inject(MenuService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly saving = signal(false);
  readonly savingPermissions = signal(false);
  readonly savingMenus = signal(false);

  readonly allPermissions = this.permissionService.permissions;
  readonly allMenus = this.menuService.menus;

  readonly breadcrumbItems = computed<readonly PageBreadcrumbItem[]>(() => [
    { label: 'roles.title', link: '/system/roles' },
    {
      label: this.isEditMode()
        ? 'roles.form_page.breadcrumb_edit'
        : 'roles.form_page.breadcrumb_create',
    },
  ]);
  readonly headerTitle = computed(() =>
    this.isEditMode() ? 'roles.form_page.edit_title' : 'roles.form_page.create_title',
  );

  readonly role = createEntityByIdLoader({
    id: this.id,
    getById: (id) => this.roleService.getById(id),
    onNotFound: () => void this.router.navigate(['/system/roles']),
  });

  private readonly role$ = toObservable(this.role);

  // RoleResponse không mang permissionIds/menuIds — tải riêng qua roles/{id}/permissions|menus
  // (trả về đối tượng đầy đủ) mỗi khi role đang xem thay đổi (bao gồm cả khi role còn null lúc tạo).
  readonly assignedPermissionIds = toSignal(
    this.role$.pipe(
      switchMap((role) => (role ? this.roleService.getPermissions(role.id) : of([]))),
      map((permissions) => permissions.map((permission) => permission.id)),
    ),
    { initialValue: [] },
  );

  readonly assignedMenuIds = toSignal(
    this.role$.pipe(
      switchMap((role) => (role ? this.roleService.getMenus(role.id) : of([]))),
      map((menus) => menus.map((menu) => menu.id)),
    ),
    { initialValue: [] },
  );

  constructor() {
    this.permissionService.load().subscribe({ error: () => undefined });
    this.menuService.load().subscribe({ error: () => undefined });
  }

  onSave(event: RoleFormSaveEvent): void {
    const editing = this.role();
    const request$ = editing
      ? this.roleService.update(editing.id, event.input)
      : this.roleService.add(event.input);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success('common.notification.save_success');
        void this.router.navigate(['/system/roles']);
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.error('common.notification.save_error');
      },
    });
  }

  onSavePermissions(event: RolePermissionAssignSaveEvent): void {
    const editing = this.role();
    if (!editing) {
      return;
    }

    this.savingPermissions.set(true);
    this.roleService.updatePermissions(editing.id, event.permissionIds).subscribe({
      next: () => {
        this.savingPermissions.set(false);
        this.notificationService.success('common.notification.save_success');
      },
      error: () => {
        this.savingPermissions.set(false);
        this.notificationService.error('common.notification.save_error');
      },
    });
  }

  onSaveMenus(event: RoleMenuAssignSaveEvent): void {
    const editing = this.role();
    if (!editing) {
      return;
    }

    this.savingMenus.set(true);
    this.roleService.updateMenus(editing.id, event.menuIds).subscribe({
      next: () => {
        this.savingMenus.set(false);
        this.notificationService.success('common.notification.save_success');
      },
      error: () => {
        this.savingMenus.set(false);
        this.notificationService.error('common.notification.save_error');
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/system/roles']);
  }
}
