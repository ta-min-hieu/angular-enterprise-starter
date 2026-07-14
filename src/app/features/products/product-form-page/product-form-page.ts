import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProductService } from '../product.service';
import { ProductForm, ProductFormSaveEvent } from '../product-form/product-form';
import { MediaAsset } from '../../../shared/models/media-asset.model';

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

  onSave(event: ProductFormSaveEvent): void {
    const editing = this.product();
    const request$ = editing
      ? this.productService.update(editing.id, event.input, event.files, event.fileIds)
      : this.productService.add(event.input, event.files, event.fileIds);

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

  onExistingFileRemoved(asset: MediaAsset): void {
    const editing = this.product();
    if (!editing) {
      return;
    }

    this.productService.removeFile(editing.id, asset.id).subscribe({ error: () => undefined });
  }
}
