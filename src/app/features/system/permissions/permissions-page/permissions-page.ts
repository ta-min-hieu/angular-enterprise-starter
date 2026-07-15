import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { TranslocoPipe } from '@jsverse/transloco';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import {
  PageBreadcrumbItem,
  PageHeader,
} from '../../../../shared/components/page-header/page-header';
import { createEntityListState } from '../../../../shared/crud/entity-list.util';
import { HttpMethod } from '../permission.model';
import { PermissionService } from '../permission.service';

const METHOD_COLORS: Readonly<Record<HttpMethod, string>> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'purple',
  DELETE: 'red',
  '*': 'default',
};

@Component({
  selector: 'app-permissions-page',
  imports: [
    FormsModule,
    RouterLink,
    NzTableModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzTooltipModule,
    NzCardModule,
    TranslocoPipe,
    EmptyState,
    ErrorState,
    PageHeader,
  ],
  templateUrl: './permissions-page.html',
  styleUrl: './permissions-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsPage {
  readonly permissionService = inject(PermissionService);

  readonly breadcrumbItems: readonly PageBreadcrumbItem[] = [
    { label: 'nav.system' },
    { label: 'permissions.title' },
  ];

  readonly list = createEntityListState({
    items: this.permissionService.permissions,
    load: () => this.permissionService.load(),
    remove: (id) => this.permissionService.remove(id),
    matches: (permission, keyword) =>
      permission.code.toLowerCase().includes(keyword) ||
      permission.name.toLowerCase().includes(keyword) ||
      permission.urlPattern.toLowerCase().includes(keyword),
  });

  methodColor(method: HttpMethod): string {
    return METHOD_COLORS[method];
  }
}
