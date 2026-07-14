import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { ProductDetail } from './product-detail';
import { Product } from '../product.model';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

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
  files: [],
};

describe('ProductDetail', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
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

  it('should fetch each attached image through the authenticated media directive', () => {
    const fixture = setup();
    fixture.componentRef.setInput('product', {
      ...SAMPLE_PRODUCT,
      files: [
        {
          id: 7,
          type: 'image',
          name: 'a.jpg',
          size: 1,
          mimeType: 'image/jpeg',
          url: '/v1/files/7',
        },
      ],
    });
    fixture.detectChanges();

    const req = httpMock.expectOne('/v1/files/7');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['a'], { type: 'image/jpeg' }));
  });
});
