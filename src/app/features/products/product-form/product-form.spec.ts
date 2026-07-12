import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { ProductForm } from './product-form';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';

const EMPTY_FORM_VALUE = {
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
};

describe('ProductForm', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [provideNzIcons(REGISTERED_ICONS), provideNzI18n(en_US)],
    });
    return TestBed.createComponent(ProductForm);
  }

  it('should default to an empty form when no product is provided', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(EMPTY_FORM_VALUE);
  });

  it('should patch the form when editing an existing product', () => {
    const fixture = setup();
    const releaseDate = new Date(2025, 0, 15);
    const publishedAt = new Date(2025, 0, 15, 9, 0, 0);
    fixture.componentRef.setInput('product', {
      id: '1',
      name: 'Bàn phím',
      price: 100000,
      stock: 5,
      category: 'accessories',
      tags: ['new'],
      description: 'Mô tả',
      status: 'active',
      featured: true,
      releaseDate,
      publishedAt,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      name: 'Bàn phím',
      price: 100000,
      stock: 5,
      category: 'accessories',
      tags: ['new'],
      description: 'Mô tả',
      status: 'active',
      featured: true,
      releaseDate,
      publishedAt,
    });
  });

  it('should not emit save when the form is invalid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.get('name')?.touched).toBe(true);
  });

  it('should emit save with the form value when valid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);
    fixture.componentInstance.form.setValue({
      name: 'Chuột',
      price: 200000,
      stock: 10,
      category: 'accessories',
      tags: ['new'],
      description: '',
      status: 'active',
      featured: false,
      releaseDate: null,
      publishedAt: null,
    });

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      name: 'Chuột',
      price: 200000,
      stock: 10,
      category: 'accessories',
      tags: ['new'],
      description: '',
      status: 'active',
      featured: false,
      releaseDate: null,
      publishedAt: null,
    });
  });

  it('should emit cancelled when cancel is triggered', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onCancel = vi.fn();
    fixture.componentInstance.cancelled.subscribe(onCancel);

    fixture.componentInstance.onCancel();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
