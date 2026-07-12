import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProductService } from '../product.service';
import { ProductInput } from '../product.model';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-product-form-page',
  imports: [RouterLink, NzCardModule, NzBreadCrumbModule, NzIconModule, TranslocoPipe, ProductForm],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly saving = signal(false);

  private readonly product$ = toObservable(this.id).pipe(
    switchMap((id) => {
      if (!id) {
        return of(null);
      }

      return this.productService.getById(id).pipe(
        catchError(() => {
          void this.router.navigate(['/products']);
          return of(null);
        }),
      );
    }),
  );

  readonly product = toSignal(this.product$, { initialValue: null });

  onSave(value: ProductInput): void {
    const editing = this.product();
    const request$ = editing
      ? this.productService.update(editing.id, value)
      : this.productService.add(value);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/products']);
      },
      error: () => this.saving.set(false),
    });
  }

  onCancel(): void {
    void this.router.navigate(['/products']);
  }
}
