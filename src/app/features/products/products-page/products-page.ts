import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { ProductService } from '../product.service';
import { Product } from '../product.model';
import { CATEGORY_OPTIONS } from '../product.constants';
import { ProductDetail } from '../product-detail/product-detail';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

type StockLevel = 'out' | 'low' | 'in-stock';

const LOW_STOCK_THRESHOLD = 10;

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
    ProductDetail,
    EmptyState,
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  readonly productService = inject(ProductService);

  readonly searchTerm = signal('');
  readonly viewingProduct = signal<Product | null>(null);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const products = this.productService.products();

    if (!term) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(term));
  });

  onView(product: Product): void {
    this.viewingProduct.set(product);
  }

  onCloseDetail(): void {
    this.viewingProduct.set(null);
  }

  onDelete(product: Product): void {
    this.productService.remove(product.id);
  }

  categoryLabel(value: string): string {
    return CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
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
        return 'Hết hàng';
      case 'low':
        return 'Sắp hết';
      default:
        return 'Còn hàng';
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
}
