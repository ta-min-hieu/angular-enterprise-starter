import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProductService } from '../product.service';
import { ProductInput } from '../product.model';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-product-form-page',
  imports: [RouterLink, NzCardModule, NzBreadCrumbModule, NzIconModule, ProductForm],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());

  readonly product = computed(() => {
    const id = this.id();
    return id ? (this.productService.getById(id) ?? null) : null;
  });

  constructor() {
    effect(() => {
      if (this.isEditMode() && !this.product()) {
        this.router.navigate(['/products']);
      }
    });
  }

  onSave(value: ProductInput): void {
    const editing = this.product();

    if (editing) {
      this.productService.update(editing.id, value);
    } else {
      this.productService.add(value);
    }

    this.router.navigate(['/products']);
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}
