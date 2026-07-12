import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { ProductDetail } from './product-detail';
import { Product } from '../product.model';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';

const SAMPLE_PRODUCT: Product = {
  id: '1',
  name: 'Bàn phím cơ',
  price: 1290000,
  stock: 24,
  category: 'accessories',
  tags: ['new', 'best-seller'],
  description: 'Bàn phím cơ switch đỏ.',
  status: 'active',
  featured: true,
  releaseDate: new Date(2025, 0, 15),
  publishedAt: new Date(2025, 0, 15, 9, 0, 0),
};

describe('ProductDetail', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [provideNzIcons(REGISTERED_ICONS)],
    });
    return TestBed.createComponent(ProductDetail);
  }

  it('should render nothing when no product is provided', () => {
    const fixture = setup();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('');
  });

  it('should resolve the category label for the given product', () => {
    const fixture = setup();
    fixture.componentRef.setInput('product', SAMPLE_PRODUCT);
    fixture.detectChanges();

    expect(fixture.componentInstance.categoryLabel('accessories')).toBe('Phụ kiện');
  });

  it('should resolve the tag label for the given product', () => {
    const fixture = setup();
    fixture.componentRef.setInput('product', SAMPLE_PRODUCT);
    fixture.detectChanges();

    expect(fixture.componentInstance.tagLabel('best-seller')).toBe('Bán chạy');
  });

  it('should render the product name in the description list', () => {
    const fixture = setup();
    fixture.componentRef.setInput('product', SAMPLE_PRODUCT);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Bàn phím cơ');
  });
});
