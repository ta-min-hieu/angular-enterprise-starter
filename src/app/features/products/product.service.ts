import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { Product, ProductInput } from './product.model';
import { ProductDto } from './product-api.model';
import { toProduct, toProductPayload } from './product.mapper';

export interface ProductQuery {
  readonly page: number;
  readonly size: number;
  readonly name?: string;
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

  add(input: ProductInput): Observable<Product> {
    return this.apiService
      .post<ProductDto>('products', toProductPayload(input))
      .pipe(map(toProduct));
  }

  update(id: string, input: ProductInput): Observable<Product> {
    return this.apiService
      .put<ProductDto>(`products/${id}`, toProductPayload(input))
      .pipe(map(toProduct));
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`products/${id}`);
  }
}
