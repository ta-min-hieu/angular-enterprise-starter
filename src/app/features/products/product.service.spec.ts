import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProductService } from './product.service';
import { ProductInput } from './product.model';
import { ProductDto } from './product-api.model';

const BASE_INPUT: ProductInput = {
  name: 'Tai nghe',
  price: 890000,
  stock: 12,
  category: 'accessories',
  tags: [],
  description: '',
  status: 'active',
  featured: false,
  releaseDate: null,
  publishedAt: null,
};

const DTO: ProductDto = {
  id: 1,
  name: 'Tai nghe',
  price: 890000,
  stock: 12,
  category: 'accessories',
  tags: [],
  description: '',
  status: 'active',
  featured: false,
  releaseDate: null,
  publishedAt: null,
};

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load a page of products and expose the total count', () => {
    let result: readonly unknown[] | undefined;
    service.load({ page: 0, size: 10 }).subscribe((products) => (result = products));

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/products' && r.params.get('page') === '0' && r.params.get('size') === '10',
    );
    req.flush({
      code: '200',
      message: 'Success',
      data: [DTO],
      metadata: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    });

    expect(result).toHaveLength(1);
    expect(service.products()).toHaveLength(1);
    expect(service.totalCount()).toBe(1);
    expect(service.loading()).toBe(false);
  });

  it('should include the name filter as a query param when searching', () => {
    service.load({ page: 0, size: 10, name: 'ban' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/products' && r.params.get('name') === 'ban',
    );
    req.flush({
      code: '200',
      message: 'Success',
      data: [],
      metadata: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
    });
  });

  it('should fetch a single product by id', () => {
    let result: { id: string } | undefined;
    service.getById('1').subscribe((product) => (result = product));

    const req = httpMock.expectOne('/api/products/1');
    req.flush({ code: '200', message: 'Success', data: DTO });

    expect(result?.id).toBe('1');
  });

  it('should create a product', () => {
    let result: { id: string } | undefined;
    service.add(BASE_INPUT).subscribe((product) => (result = product));

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    req.flush({ code: '200', message: 'Success', data: DTO });

    expect(result?.id).toBe('1');
  });

  it('should update a product', () => {
    service.update('1', { ...BASE_INPUT, name: 'Tai nghe Pro' }).subscribe();

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ code: '200', message: 'Success', data: { ...DTO, name: 'Tai nghe Pro' } });
  });

  it('should remove a product', () => {
    service.remove('1').subscribe();

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success' });
  });
});
