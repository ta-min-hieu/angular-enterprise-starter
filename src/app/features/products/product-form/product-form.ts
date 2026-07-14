import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TranslocoPipe } from '@jsverse/transloco';
import { Product, ProductInput, ProductStatus } from '../product.model';
import { CATEGORY_OPTIONS, STATUS_OPTIONS, TAG_OPTIONS } from '../product.constants';
import { TextField } from '../../../shared/components/text-field/text-field';
import { NumberField } from '../../../shared/components/number-field/number-field';
import { SelectField } from '../../../shared/components/select-field/select-field';
import { MultiSelectField } from '../../../shared/components/multi-select-field/multi-select-field';
import { RadioGroupField } from '../../../shared/components/radio-group-field/radio-group-field';
import { CheckboxField } from '../../../shared/components/checkbox-field/checkbox-field';
import { TextareaField } from '../../../shared/components/textarea-field/textarea-field';
import { DateField } from '../../../shared/components/date-field/date-field';
import {
  FileUploadField,
  MediaFieldItem,
} from '../../../shared/components/file-upload-field/file-upload-field';
import { MediaAsset } from '../../../shared/models/media-asset.model';

export interface ProductFormSaveEvent {
  readonly input: ProductInput;
  // File nhỏ giữ trong form (chưa upload) — gửi kèm trực tiếp lúc submit.
  readonly files: readonly File[];
  // Id file lớn đã upload xong (chunked) trong phiên form này — chỉ cần tham chiếu lại.
  readonly fileIds: readonly number[];
}

@Component({
  selector: 'app-product-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    TranslocoPipe,
    TextField,
    NumberField,
    SelectField,
    MultiSelectField,
    RadioGroupField,
    CheckboxField,
    TextareaField,
    DateField,
    FileUploadField,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly product = input<Product | null>(null);
  readonly saving = input(false);
  readonly save = output<ProductFormSaveEvent>();
  readonly cancelled = output<void>();
  // Gỡ ngay 1 file đã gắn sẵn (không đợi submit form) — consumer (ProductFormPage) quyết định
  // gọi ProductService.removeFile ở chế độ sửa.
  readonly existingFileRemoved = output<MediaAsset>();

  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly tagOptions = TAG_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    price: this.fb.control(0, [Validators.required, Validators.min(0)]),
    stock: this.fb.control(0, [Validators.required, Validators.min(0)]),
    category: this.fb.control('', [Validators.required]),
    tags: this.fb.control<string[]>([]),
    description: this.fb.control(''),
    status: this.fb.control<ProductStatus>('active'),
    featured: this.fb.control(false),
    releaseDate: this.fb.control<Date | null>(null),
    publishedAt: this.fb.control<Date | null>(null),
    files: this.fb.control<MediaFieldItem[]>([]),
  });

  readonly priceFormatter = (value: number): string => `${value.toLocaleString('vi-VN')} ₫`;

  readonly priceParser = (value: string): number => Number(value.replace(/[^\d]/g, '')) || 0;

  constructor() {
    effect(() => {
      const current = this.product();
      this.form.reset(
        current
          ? {
              name: current.name,
              price: current.price,
              stock: current.stock,
              category: current.category,
              tags: [...current.tags],
              description: current.description,
              status: current.status,
              featured: current.featured,
              releaseDate: current.releaseDate,
              publishedAt: current.publishedAt,
              files: current.files.map((asset): MediaFieldItem => ({ kind: 'existing', asset })),
            }
          : {
              name: '',
              price: 0,
              stock: 0,
              category: '',
              tags: [],
              description: '',
              status: 'active',
              featured: false,
              releaseDate: null,
              publishedAt: null,
              files: [],
            },
      );
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach((control) => control.updateValueAndValidity());
      return;
    }

    const { files: fieldItems, ...rest } = this.form.getRawValue();
    const files = fieldItems.filter((item) => item.kind === 'pending').map((item) => item.file);
    const fileIds = fieldItems
      .filter((item) => item.kind === 'uploaded')
      .map((item) => item.asset.id);

    this.save.emit({ input: rest, files, fileIds });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onExistingFileRemoved(asset: MediaAsset): void {
    this.existingFileRemoved.emit(asset);
  }
}
