import { Injectable, inject, signal } from '@angular/core';
import { Observable, filter, finalize, map } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { Product, ProductInput } from './product.model';
import { ProductDto } from './product-api.model';
import { toProduct, toProductPayload } from './product.mapper';
import { UploadDoneEvent } from '../../core/http/upload-event.model';

export interface ProductQuery {
  readonly page: number;
  readonly size: number;
  readonly name?: string;
}

function isDoneEvent<T>(event: { type: string }): event is UploadDoneEvent<T> {
  return event.type === 'done';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiService = inject(ApiService);

  private readonly productsSignal = signal<readonly Product[]>([]);
  private readonly totalElementsSignal = signal(0);
  private readonly loadingSignal = signal(false);

  readonly products = this.productsSignal.asReadonly();
  readonly totalCount = this.totalElementsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  load(query: ProductQuery): Observable<readonly Product[]> {
    const params: Record<string, string | number> = { page: query.page, size: query.size };
    if (query.name) {
      params['name'] = query.name;
    }

    this.loadingSignal.set(true);

    return this.apiService.getPage<ProductDto[]>('products', { params }).pipe(
      map(({ items, metadata }) => {
        const products = items.map(toProduct);
        this.productsSignal.set(products);
        this.totalElementsSignal.set(metadata.totalElements);
        return products;
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getById(id: string): Observable<Product> {
    return this.apiService.get<ProductDto>(`products/${id}`).pipe(map(toProduct));
  }

  // files: ảnh/video nhỏ (giữ nguyên File trong form, chưa upload) — gửi kèm trực tiếp.
  // fileIds: id các file lớn đã upload xong trước đó qua UploadService.uploadChunked() — chỉ tham chiếu lại.
  add(
    input: ProductInput,
    files: readonly File[] = [],
    fileIds: readonly number[] = [],
  ): Observable<Product> {
    return this.apiService
      .upload<ProductDto>('products', this.buildFormData(input, files, fileIds))
      .pipe(
        filter(isDoneEvent<ProductDto>),
        map((event) => toProduct(event.data)),
      );
  }

  update(
    id: string,
    input: ProductInput,
    files: readonly File[] = [],
    fileIds: readonly number[] = [],
  ): Observable<Product> {
    return this.apiService
      .upload<ProductDto>(`products/${id}`, this.buildFormData(input, files, fileIds), {
        method: 'PUT',
      })
      .pipe(
        filter(isDoneEvent<ProductDto>),
        map((event) => toProduct(event.data)),
      );
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`products/${id}`);
  }

  // Gỡ ngay 1 file đã gắn sẵn với sản phẩm (không đợi submit form) — khớp
  // DELETE /v1/products/{id}/files/{fileId}, xem docs mô tả "NỐI THÊM" ở ProductController.
  removeFile(productId: string, fileId: number): Observable<void> {
    return this.apiService.delete<void>(`products/${productId}/files/${fileId}`);
  }

  private buildFormData(
    input: ProductInput,
    files: readonly File[],
    fileIds: readonly number[],
  ): FormData {
    const formData = new FormData();
    formData.append(
      'product',
      new Blob([JSON.stringify(toProductPayload(input))], { type: 'application/json' }),
    );
    files.forEach((file) => formData.append('files', file, file.name));
    fileIds.forEach((fileId) => formData.append('fileIds', String(fileId)));
    return formData;
  }
}
