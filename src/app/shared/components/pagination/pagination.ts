import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-pagination',
  imports: [NzPaginationModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly pageIndex = input.required<number>();
  readonly total = input.required<number>();

  readonly pageSize = input(10);
  readonly showSizeChanger = input(false);
  readonly showQuickJumper = input(false);

  readonly pageIndexChange = output<number>();
  readonly pageSizeChange = output<number>();
}
