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
import { RoleService } from '../role.service';

@Component({
  selector: 'app-roles-page',
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
  templateUrl: './roles-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPage {
  readonly roleService = inject(RoleService);

  readonly breadcrumbItems: readonly PageBreadcrumbItem[] = [
    { label: 'nav.system' },
    { label: 'roles.title' },
  ];

  readonly list = createEntityListState({
    items: this.roleService.roles,
    load: () => this.roleService.load(),
    remove: (id) => this.roleService.remove(id),
    matches: (role, keyword) =>
      role.roleKey.toLowerCase().includes(keyword) || role.roleName.toLowerCase().includes(keyword),
  });
}
