import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { ProductFormPage } from './product-form-page';
import { ProductInput } from '../product.model';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const BASE_INPUT: ProductInput = {
  name: 'Loa',
  price: 300000,
  stock: 4,
  category: 'accessories',
  tags: [],
  description: '',
  status: 'active',
  featured: false,
  releaseDate: null,
  publishedAt: null,
};

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
};

describe('ProductFormPage', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    const router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    return { fixture, router };
  }

  it('should be in create mode when no id is provided', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(false);
    expect(fixture.componentInstance.product()).toBeNull();
  });

  it('should fetch and expose the matching product when an id is provided', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/products/1');
    req.flush({ code: '200', message: 'Success', data: PRODUCT_DTO });
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.product()?.name).toBe('Ban phim co');
  });

  it('should redirect to the list when the id does not match any product', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', 'does-not-exist');
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/products/does-not-exist');
    req.flush(
      { code: '404', message: 'Product not found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should create a new product and navigate back when saving in create mode', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.onSave(BASE_INPUT);

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    req.flush({ code: '200', message: 'Success', data: { ...PRODUCT_DTO, name: BASE_INPUT.name } });

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should update the existing product and navigate back when saving in edit mode', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    httpMock
      .expectOne('/api/products/1')
      .flush({ code: '200', message: 'Success', data: PRODUCT_DTO });
    fixture.detectChanges();

    fixture.componentInstance.onSave({ ...BASE_INPUT, name: 'Đã cập nhật' });

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ code: '200', message: 'Success', data: { ...PRODUCT_DTO, name: 'Đã cập nhật' } });

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should navigate back to the list on cancel', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
