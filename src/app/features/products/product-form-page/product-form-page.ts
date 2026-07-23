import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ProductService } from '../product.service';
import { ProductForm, ProductFormSaveEvent } from '../product-form/product-form';
import { MediaAsset } from '../../../shared/models/media-asset.model';
import { NotificationService } from '../../../core/notification/notification.service';
import { PageBreadcrumbItem, PageHeader } from '../../../shared/components/page-header/page-header';
import { createEntityByIdLoader } from '../../../shared/crud/entity-by-id-loader.util';

@Component({
  selector: 'app-product-form-page',
  imports: [NzCardModule, ProductForm, PageHeader],
  templateUrl: './product-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage {
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  readonly isEditMode = computed(() => !!this.id());
  readonly saving = signal(false);

  readonly breadcrumbItems = computed<readonly PageBreadcrumbItem[]>(() => [
    { label: 'products.title', link: '/products' },
    {
      label: this.isEditMode()
        ? 'products.form_page.breadcrumb_edit'
        : 'products.form_page.breadcrumb_create',
    },
  ]);
  readonly headerTitle = computed(() =>
    this.isEditMode() ? 'products.form_page.edit_title' : 'products.form_page.create_title',
  );
  readonly headerSubtitle = computed(() =>
    this.isEditMode() ? 'products.form_page.edit_subtitle' : 'products.form_page.create_subtitle',
  );

  readonly product = createEntityByIdLoader({
    id: this.id,
    getById: (id) => this.productService.getById(id),
    onNotFound: () => void this.router.navigate(['/products']),
  });

  onSave(event: ProductFormSaveEvent): void {
    const editing = this.product();
    const request$ = editing
      ? this.productService.update(editing.id, event.input, event.files, event.fileIds)
      : this.productService.add(event.input, event.files, event.fileIds);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success('common.notification.save_success');
        void this.router.navigate(['/products']);
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.error('common.notification.save_error');
      },
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
