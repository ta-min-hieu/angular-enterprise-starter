import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductDetail } from '../product-detail/product-detail';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { CompactPagination } from '../../../shared/components/compact-pagination/compact-pagination';
import { Product } from '../product.model';
import { ProductQuery, ProductService } from '../product.service';
import { CATEGORY_OPTIONS } from '../product.constants';
import { I18nService } from '../../../core/i18n/i18n.service';

type StockLevel = 'out' | 'low' | 'in-stock';

const LOW_STOCK_THRESHOLD = 10;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-products-page',
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzPopconfirmModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzTooltipModule,
    NzCardModule,
    NzBreadCrumbModule,
    TranslocoPipe,
    ProductDetail,
    EmptyState,
    CompactPagination,
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private readonly i18nService = inject(I18nService);

  readonly productService = inject(ProductService);

  readonly searchTerm = signal('');
  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly viewingProduct = signal<Product | null>(null);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.productService.totalCount() / this.pageSize())),
  );

  private readonly searchTermChanged$ = new Subject<string>();

  constructor() {
    this.searchTermChanged$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.pageIndex.set(1);
        this.refresh();
      });

    this.refresh();
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    this.searchTermChanged$.next(value);
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
    this.refresh();
  }

  onView(product: Product): void {
    this.viewingProduct.set(product);
  }

  onCloseDetail(): void {
    this.viewingProduct.set(null);
  }

  onDelete(product: Product): void {
    this.productService.remove(product.id).subscribe(() => this.refresh());
  }

  categoryLabel(value: string): string {
    const key = CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
    return this.i18nService.translate(key);
  }

  stockLevel(stock: number): StockLevel {
    if (stock === 0) {
      return 'out';
    }

    if (stock <= LOW_STOCK_THRESHOLD) {
      return 'low';
    }

    return 'in-stock';
  }

  stockLabel(stock: number): string {
    switch (this.stockLevel(stock)) {
      case 'out':
        return this.i18nService.translate('products.stock.out_of_stock');
      case 'low':
        return this.i18nService.translate('products.stock.low_stock');
      default:
        return this.i18nService.translate('products.stock.in_stock');
    }
  }

  stockColor(stock: number): string {
    switch (this.stockLevel(stock)) {
      case 'out':
        return 'error';
      case 'low':
        return 'warning';
      default:
        return 'success';
    }
  }

  private currentQuery(): ProductQuery {
    const name = this.searchTerm().trim();
    return {
      page: this.pageIndex() - 1,
      size: this.pageSize(),
      name: name || undefined,
    };
  }

  private refresh(): void {
    // Trong SSR, server không gọi được backend qua localhost của chính container/host
    // (khác network namespace với trình duyệt) — bắt lỗi ở đây để tránh crash log phía
    // server; client sẽ tự gọi lại và hiển thị đúng dữ liệu ngay sau khi hydrate xong.
    this.productService.load(this.currentQuery()).subscribe({ error: () => undefined });
  }
}
