import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { MenuService } from '../menu.service';
import { MenuForm, MenuFormSaveEvent } from '../menu-form/menu-form';
import { NotificationService } from '../../../../core/notification/notification.service';
import {
  PageBreadcrumbItem,
  PageHeader,
} from '../../../../shared/components/page-header/page-header';
import { createEntityByIdLoader } from '../../../../shared/crud/entity-by-id-loader.util';

@Component({
  selector: 'app-menu-form-page',
  imports: [NzCardModule, MenuForm, PageHeader],
  templateUrl: './menu-form-page.html',
  styleUrl: './menu-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFormPage {
  private readonly menuService = inject(MenuService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  // Query param ?parentId=... khi bấm "Thêm menu con" trên cây (menus-page).
  readonly parentId = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly saving = signal(false);

  readonly allMenus = this.menuService.menus;

  readonly breadcrumbItems = computed<readonly PageBreadcrumbItem[]>(() => [
    { label: 'menus.title', link: '/system/menus' },
    {
      label: this.isEditMode()
        ? 'menus.form_page.breadcrumb_edit'
        : 'menus.form_page.breadcrumb_create',
    },
  ]);
  readonly headerTitle = computed(() =>
    this.isEditMode() ? 'menus.form_page.edit_title' : 'menus.form_page.create_title',
  );

  readonly menu = createEntityByIdLoader({
    id: this.id,
    getById: (id) => this.menuService.getById(id),
    onNotFound: () => void this.router.navigate(['/system/menus']),
  });

  constructor() {
    this.menuService.load().subscribe({ error: () => undefined });
  }

  onSave(event: MenuFormSaveEvent): void {
    const editing = this.menu();
    const request$ = editing
      ? this.menuService.update(editing.id, event.input)
      : this.menuService.add(event.input);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success('common.notification.save_success');
        void this.router.navigate(['/system/menus']);
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.error('common.notification.save_error');
      },
    });
  }

  onCancel(): void {
    void this.router.navigate(['/system/menus']);
  }
}
