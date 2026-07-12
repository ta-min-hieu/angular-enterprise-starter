import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { ProductFormPage } from './product-form-page';
import { ProductService } from '../product.service';
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

describe('ProductFormPage', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    const router = TestBed.inject(Router);
    const productService = TestBed.inject(ProductService);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    return { fixture, router, productService };
  }

  it('should be in create mode when no id is provided', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(false);
    expect(fixture.componentInstance.product()).toBeNull();
  });

  it('should load the matching product when an id is provided', () => {
    const { fixture, productService } = setup();
    const existing = productService.products()[0];
    fixture.componentRef.setInput('id', existing.id);
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.product()).toEqual(existing);
  });

  it('should redirect to the list when the id does not match any product', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', 'does-not-exist');
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should add a new product and navigate back when saving in create mode', () => {
    const { fixture, router, productService } = setup();
    fixture.detectChanges();
    const before = productService.products().length;

    fixture.componentInstance.onSave(BASE_INPUT);

    expect(productService.products().length).toBe(before + 1);
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should update the existing product and navigate back when saving in edit mode', () => {
    const { fixture, router, productService } = setup();
    const existing = productService.products()[0];
    fixture.componentRef.setInput('id', existing.id);
    fixture.detectChanges();

    fixture.componentInstance.onSave({ ...BASE_INPUT, name: 'Đã cập nhật', price: 1, stock: 1 });

    expect(productService.getById(existing.id)?.name).toBe('Đã cập nhật');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should navigate back to the list on cancel', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
