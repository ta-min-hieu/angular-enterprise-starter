import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProductService } from './product.service';
import { ProductInput } from './product.model';

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

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should seed initial products', () => {
    expect(service.products().length).toBeGreaterThan(0);
    expect(service.totalCount()).toBe(service.products().length);
  });

  it('should add a new product', () => {
    const before = service.totalCount();

    const created = service.add(BASE_INPUT);

    expect(service.totalCount()).toBe(before + 1);
    expect(service.getById(created.id)).toEqual(created);
  });

  it('should update an existing product', () => {
    const created = service.add({ ...BASE_INPUT, name: 'Webcam', price: 650000, stock: 5 });

    service.update(created.id, { ...BASE_INPUT, name: 'Webcam Pro', price: 990000, stock: 3 });

    expect(service.getById(created.id)).toEqual({
      ...BASE_INPUT,
      id: created.id,
      name: 'Webcam Pro',
      price: 990000,
      stock: 3,
    });
  });

  it('should remove a product', () => {
    const created = service.add({ ...BASE_INPUT, name: 'Đế tản nhiệt', price: 199000, stock: 20 });
    const before = service.totalCount();

    service.remove(created.id);

    expect(service.totalCount()).toBe(before - 1);
    expect(service.getById(created.id)).toBeUndefined();
  });

  it('should return undefined when getting a non-existent product', () => {
    expect(service.getById('non-existent-id')).toBeUndefined();
  });
});
