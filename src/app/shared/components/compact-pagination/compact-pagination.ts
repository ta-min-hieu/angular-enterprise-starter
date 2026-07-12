import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

export type PageItem = number | 'ellipsis';

@Component({
  selector: 'app-compact-pagination',
  imports: [NzButtonModule],
  templateUrl: './compact-pagination.html',
  styleUrl: './compact-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompactPagination {
  readonly pageIndex = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageIndexChange = output<number>();

  // [1] ... [current-1][current][current+1] ... [total] — gộp khoảng trống thành 1 dấu "...".
  readonly pageItems = computed<readonly PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.pageIndex();

    const pages = new Set<number>([1, total, current]);
    if (current > 1) {
      pages.add(current - 1);
    }
    if (current < total) {
      pages.add(current + 1);
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const items: PageItem[] = [];

    sorted.forEach((page, index) => {
      if (index > 0 && page - sorted[index - 1] > 1) {
        items.push('ellipsis');
      }
      items.push(page);
    });

    return items;
  });

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.pageIndex()) {
      this.pageIndexChange.emit(page);
    }
  }
}
