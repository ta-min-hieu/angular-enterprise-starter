import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsPage } from './products-page';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const PRODUCT_DTO = {
  id: 1,
  name: 'Ban phim co',
  price: 1290000,
  stock: 24,
  category: 'accessories',
  tags: [],
  description: '',
  status: 'active',
  featured: false,
  releaseDate: null,
  publishedAt: null,
  files: [],
};

describe('ProductsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  function flushList(data: readonly unknown[] = [PRODUCT_DTO]) {
    const req = httpMock.expectOne((r) => r.url === '/api/products');
    req.flush({
      code: '200',
      message: 'Success',
      data,
      metadata: { page: 0, size: 10, totalElements: data.length, totalPages: 1 },
    });
  }

  it('should load and render products from the API on init', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.componentInstance.productService.totalCount()).toBe(1);
  });

  it('should debounce the search term and reload with the name filter', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.onSearchTermChange('ban');
    vi.advanceTimersByTime(300);

    const req = httpMock.expectOne(
      (r) => r.url === '/api/products' && r.params.get('name') === 'ban',
    );
    req.flush({
      code: '200',
      message: 'Success',
      data: [PRODUCT_DTO],
      metadata: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    });

    expect(fixture.componentInstance.pageIndex()).toBe(1);
    vi.useRealTimers();
  });

  it('should reload immediately (no debounce) when the page index changes', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.onPageIndexChange(2);

    const req = httpMock.expectOne(
      (r) => r.url === '/api/products' && r.params.get('page') === '1',
    );
    req.flush({
      code: '200',
      message: 'Success',
      data: [],
      metadata: { page: 1, size: 10, totalElements: 1, totalPages: 2 },
    });
  });

  it('should link the create action to the new product route', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[routerLink="/products/new"]')).not.toBeNull();
  });

  it('should link each row edit action to its product edit route', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector(`a[href="/products/${PRODUCT_DTO.id}/edit"]`)).not.toBeNull();
  });

  it('should remove a product via ProductService and reload the list', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.onDelete({
      id: '1',
      name: 'Ban phim co',
      price: 1290000,
      stock: 24,
      category: 'accessories',
      tags: [],
      description: '',
      status: 'active',
      featured: false,
      releaseDate: null,
      publishedAt: null,
      files: [],
    });

    const deleteReq = httpMock.expectOne('/api/products/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ code: '200', message: 'Success' });

    flushList([]);
  });

  it('should resolve the category label for a product', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();

    expect(fixture.componentInstance.categoryLabel('accessories')).toBe('Phụ kiện');
  });

  it('should open and close the product detail popup', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    flushList();
    const product = fixture.componentInstance.productService.products()[0];

    fixture.componentInstance.onView(product);
    expect(fixture.componentInstance.viewingProduct()).toEqual(product);

    fixture.componentInstance.onCloseDetail();
    expect(fixture.componentInstance.viewingProduct()).toBeNull();
  });
});
