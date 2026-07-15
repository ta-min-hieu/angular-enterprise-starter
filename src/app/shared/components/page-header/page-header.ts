import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoPipe } from '@jsverse/transloco';

export interface PageBreadcrumbItem {
  readonly label: string;
  readonly link?: string;
}

// Breadcrumb + tiêu đề trang, dùng chung cho mọi màn list/form CRUD (roles/permissions/menus/users,
// products...) — gộp lại từ 10 bản HTML/SCSS gần như giống hệt nhau trước đây.
@Component({
  selector: 'app-page-header',
  imports: [RouterLink, NzBreadCrumbModule, NzButtonModule, NzIconModule, TranslocoPipe],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly breadcrumbItems = input.required<readonly PageBreadcrumbItem[]>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly addLink = input<string>();
  readonly addLabel = input<string>();
}
