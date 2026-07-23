import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PermissionService } from '../permission.service';
import { PermissionForm, PermissionFormSaveEvent } from '../permission-form/permission-form';
import { NotificationService } from '../../../../core/notification/notification.service';
import {
  PageBreadcrumbItem,
  PageHeader,
} from '../../../../shared/components/page-header/page-header';
import { createEntityByIdLoader } from '../../../../shared/crud/entity-by-id-loader.util';

@Component({
  selector: 'app-permission-form-page',
  imports: [NzCardModule, PermissionForm, PageHeader],
  templateUrl: './permission-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionFormPage {
  private readonly permissionService = inject(PermissionService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly saving = signal(false);

  readonly breadcrumbItems = computed<readonly PageBreadcrumbItem[]>(() => [
    { label: 'permissions.title', link: '/system/permissions' },
    {
      label: this.isEditMode()
        ? 'permissions.form_page.breadcrumb_edit'
        : 'permissions.form_page.breadcrumb_create',
    },
  ]);
  readonly headerTitle = computed(() =>
    this.isEditMode() ? 'permissions.form_page.edit_title' : 'permissions.form_page.create_title',
  );

  readonly permission = createEntityByIdLoader({
    id: this.id,
    getById: (id) => this.permissionService.getById(id),
    onNotFound: () => void this.router.navigate(['/system/permissions']),
  });

  onSave(event: PermissionFormSaveEvent): void {
    const editing = this.permission();
    const request$ = editing
      ? this.permissionService.update(editing.id, event.input)
      : this.permissionService.add(event.input);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success('common.notification.save_success');
        void this.router.navigate(['/system/permissions']);
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.error('common.notification.save_error');
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/system/permissions']);
  }
}
