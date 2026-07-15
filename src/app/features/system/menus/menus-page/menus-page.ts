import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppError } from '../../../../core/error/app-error';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import {
  PageBreadcrumbItem,
  PageHeader,
} from '../../../../shared/components/page-header/page-header';
import { NotificationService } from '../../../../core/notification/notification.service';
import { MenuService } from '../menu.service';
import { buildMenuTree, toTreeNodeOptions } from '../menu.mapper';

@Component({
  selector: 'app-menus-page',
  imports: [
    RouterLink,
    NzTreeModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    TranslocoPipe,
    EmptyState,
    ErrorState,
    PageHeader,
  ],
  templateUrl: './menus-page.html',
  styleUrl: './menus-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenusPage {
  private readonly notificationService = inject(NotificationService);

  readonly menuService = inject(MenuService);

  readonly breadcrumbItems: readonly PageBreadcrumbItem[] = [
    { label: 'nav.system' },
    { label: 'menus.title' },
  ];

  readonly error = signal<AppError | null>(null);

  readonly treeNodes = computed(() => toTreeNodeOptions(buildMenuTree(this.menuService.menus())));

  constructor() {
    this.refresh();
  }

  menuStatus(id: string): 'ACTIVE' | 'DISABLED' {
    return this.menuService.menus().find((menu) => menu.id === id)?.status ?? 'ACTIVE';
  }

  onDelete(id: string): void {
    this.menuService.remove(id).subscribe({
      next: () => {
        this.notificationService.success('common.notification.delete_success');
        this.refresh();
      },
      error: () => this.notificationService.error('common.notification.delete_error'),
    });
  }

  onRetry(): void {
    this.refresh();
  }

  private refresh(): void {
    this.error.set(null);
    this.menuService.load().subscribe({ error: (error: AppError) => this.error.set(error) });
  }
}
