import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { UserService } from '../user.service';
import { UserForm, UserFormSaveEvent } from '../user-form/user-form';
import { RoleService } from '../../roles/role.service';
import { NotificationService } from '../../../../core/notification/notification.service';
import {
  PageBreadcrumbItem,
  PageHeader,
} from '../../../../shared/components/page-header/page-header';
import { createEntityByIdLoader } from '../../../../shared/crud/entity-by-id-loader.util';

@Component({
  selector: 'app-user-form-page',
  imports: [NzCardModule, UserForm, PageHeader],
  templateUrl: './user-form-page.html',
  styleUrl: './user-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormPage {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly saving = signal(false);

  readonly allRoles = this.roleService.roles;

  readonly breadcrumbItems = computed<readonly PageBreadcrumbItem[]>(() => [
    { label: 'users.title', link: '/system/users' },
    {
      label: this.isEditMode()
        ? 'users.form_page.breadcrumb_edit'
        : 'users.form_page.breadcrumb_create',
    },
  ]);
  readonly headerTitle = computed(() =>
    this.isEditMode() ? 'users.form_page.edit_title' : 'users.form_page.create_title',
  );

  readonly user = createEntityByIdLoader({
    id: this.id,
    getById: (id) => this.userService.getById(id),
    onNotFound: () => void this.router.navigate(['/system/users']),
  });

  constructor() {
    this.roleService.load().subscribe({ error: () => undefined });
  }

  onSave(event: UserFormSaveEvent): void {
    const editing = this.user();
    // CreateUserRequest/UpdateUserRequest không có roleIds — lưu user trước, gán role là bước
    // riêng ngay sau đó (PUT rbac/users/{id}/roles), giống cách Role gán Permission/Menu.
    const save$ = editing
      ? this.userService.update(editing.id, { enabled: event.enabled, password: event.password })
      : this.userService.add({
          username: event.username,
          password: event.password ?? '',
          enabled: event.enabled,
        });

    this.saving.set(true);
    save$
      .pipe(
        switchMap((user) =>
          this.userService.updateRoles(user.id, event.roleIds).pipe(map(() => user)),
        ),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notificationService.success('common.notification.save_success');
          void this.router.navigate(['/system/users']);
        },
        error: () => {
          this.saving.set(false);
          this.notificationService.error('common.notification.save_error');
        },
      });
  }

  onCancel(): void {
    void this.router.navigate(['/system/users']);
  }
}
