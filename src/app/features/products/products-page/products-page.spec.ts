import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProductsPage } from './products-page';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('ProductsPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });
  });

  it('should render the seeded products from ProductService', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(
      fixture.componentInstance.productService.products().length,
    );
  });

  it('should filter products by name via the search term', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    const firstProduct = fixture.componentInstance.productService.products()[0];

    fixture.componentInstance.searchTerm.set(firstProduct.name);

    expect(fixture.componentInstance.filteredProducts()).toEqual([firstProduct]);
  });

  it('should link the create action to the new product route', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const createLink = el.querySelector('a[routerLink="/products/new"]');

    expect(createLink).not.toBeNull();
  });

  it('should link each row edit action to its product edit route', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    const product = fixture.componentInstance.productService.products()[0];

    const el = fixture.nativeElement as HTMLElement;
    const editLink = el.querySelector(`a[href="/products/${product.id}/edit"]`);

    expect(editLink).not.toBeNull();
  });

  it('should remove a product via ProductService on delete', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    const product = fixture.componentInstance.productService.products()[0];
    const before = fixture.componentInstance.productService.products().length;

    fixture.componentInstance.onDelete(product);

    expect(fixture.componentInstance.productService.products().length).toBe(before - 1);
  });

  it('should resolve the category label for a product', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.categoryLabel('accessories')).toBe('Phụ kiện');
  });

  it('should open and close the product detail popup', () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    const product = fixture.componentInstance.productService.products()[0];

    fixture.componentInstance.onView(product);
    expect(fixture.componentInstance.viewingProduct()).toEqual(product);

    fixture.componentInstance.onCloseDetail();
    expect(fixture.componentInstance.viewingProduct()).toBeNull();
  });
});
