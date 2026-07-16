import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime } from 'rxjs';
import { ProductDetail } from '../product-detail/product-detail';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { FilterBar } from '../../../shared/components/filter-bar/filter-bar';
import { SelectField } from '../../../shared/components/select-field/select-field';
import { TextField } from '../../../shared/components/text-field/text-field';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { SelectOption } from '../../../shared/models/select-option.model';
import { Product, ProductStatus } from '../product.model';
import { ProductQuery, ProductService } from '../product.service';
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../product.constants';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MediaSrcDirective } from '../../../shared/directives/media-src.directive';
import { PageBreadcrumbItem, PageHeader } from '../../../shared/components/page-header/page-header';

type StockLevel = 'out' | 'low' | 'in-stock';

const LOW_STOCK_THRESHOLD = 10;
const FILTER_DEBOUNCE_MS = 300;

// value rỗng = "tất cả" (bỏ qua tiêu chí đó trong query) — thêm sẵn vào đầu options thay vì coi đây
// là 1 lựa chọn nghiệp vụ thật, nên không đưa vào CATEGORY_OPTIONS/STATUS_OPTIONS dùng chung với form.
const ALL_CATEGORIES_OPTION: SelectOption<string> = {
  label: 'products.filters.all_categories',
  value: '',
};
const ALL_STATUSES_OPTION: SelectOption<string> = {
  label: 'products.filters.all_statuses',
  value: '',
};

@Component({
  selector: 'app-products-page',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzPopconfirmModule,
    NzIconModule,
    NzTagModule,
    NzTooltipModule,
    NzCardModule,
    TranslocoPipe,
    ProductDetail,
    EmptyState,
    FilterBar,
    SelectField,
    TextField,
    Pagination,
    MediaSrcDirective,
    PageHeader,
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly i18nService = inject(I18nService);

  readonly productService = inject(ProductService);

  readonly breadcrumbItems: readonly PageBreadcrumbItem[] = [{ label: 'products.title' }];

  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly viewingProduct = signal<Product | null>(null);

  // Reuse nguyên TextField/SelectField (đã dùng trong product-form) cho toàn bộ thanh bộ lọc —
  // gộp cả tìm-theo-tên vào chung 1 FormGroup với category/status thay vì tách riêng 1 signal, để
  // cả 3 tiêu chí cùng debounce theo 1 pipeline duy nhất và cùng hiển thị đồng nhất (label trên input).
  readonly filterForm = this.fb.group({
    name: this.fb.control(''),
    category: this.fb.control(''),
    status: this.fb.control(''),
  });
  readonly categoryFilterOptions: readonly SelectOption<string>[] = [
    ALL_CATEGORIES_OPTION,
    ...CATEGORY_OPTIONS,
  ];
  readonly statusFilterOptions: readonly SelectOption<string>[] = [
    ALL_STATUSES_OPTION,
    ...STATUS_OPTIONS,
  ];

  private readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });
  readonly hasActiveFilters = computed(() => {
    const { name, category, status } = this.filterFormValue();
    return !!name?.trim() || !!category || !!status;
  });

  constructor() {
    this.filterForm.valueChanges
      .pipe(debounceTime(FILTER_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => {
        this.pageIndex.set(1);
        this.refresh();
      });

    this.refresh();
  }

  onClearFilters(): void {
    this.filterForm.reset({ name: '', category: '', status: '' });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
    this.refresh();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.pageIndex.set(1);
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

  thumbnailUrl(product: Product): string | null {
    const first = product.files[0];
    // Chỉ ảnh mới hiển thị được qua thẻ <img> — video cần <video>, bảng danh sách không có chỗ
    // cho việc đó nên bỏ qua, coi như không có thumbnail.
    return first?.type === 'image' ? first.url : null;
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
    const { name, category, status } = this.filterForm.getRawValue();
    return {
      page: this.pageIndex() - 1,
      size: this.pageSize(),
      name: name.trim() || undefined,
      category: category || undefined,
      status: (status || undefined) as ProductStatus | undefined,
    };
  }

  private refresh(): void {
    // Trong SSR, server không gọi được backend qua localhost của chính container/host
    // (khác network namespace với trình duyệt) — bắt lỗi ở đây để tránh crash log phía
    // server; client sẽ tự gọi lại và hiển thị đúng dữ liệu ngay sau khi hydrate xong.
    this.productService.load(this.currentQuery()).subscribe({ error: () => undefined });
  }
}
