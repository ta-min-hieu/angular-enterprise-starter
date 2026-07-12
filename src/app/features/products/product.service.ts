import { Injectable, computed, signal } from '@angular/core';
import { Product, ProductInput } from './product.model';

const SEED_PRODUCTS: readonly Product[] = [
  {
    id: crypto.randomUUID(),
    name: 'Bàn phím cơ',
    price: 1290000,
    stock: 24,
    category: 'accessories',
    tags: ['new', 'best-seller'],
    description: 'Bàn phím cơ switch đỏ, keycap PBT, kết nối có dây.',
    status: 'active',
    featured: true,
    releaseDate: new Date(2025, 0, 15),
    publishedAt: new Date(2025, 0, 15, 9, 0, 0),
  },
  {
    id: crypto.randomUUID(),
    name: 'Chuột không dây',
    price: 450000,
    stock: 58,
    category: 'accessories',
    tags: ['best-seller'],
    description: 'Chuột không dây, pin sử dụng lên đến 12 tháng.',
    status: 'active',
    featured: false,
    releaseDate: new Date(2024, 5, 1),
    publishedAt: new Date(2024, 5, 1, 8, 30, 0),
  },
  {
    id: crypto.randomUUID(),
    name: 'Màn hình 27 inch',
    price: 5200000,
    stock: 7,
    category: 'monitors',
    tags: ['discount'],
    description: 'Màn hình 27 inch, độ phân giải 2K, tần số quét 165Hz.',
    status: 'inactive',
    featured: false,
    releaseDate: new Date(2023, 10, 20),
    publishedAt: null,
  },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsSignal = signal<readonly Product[]>(SEED_PRODUCTS);

  readonly products = this.productsSignal.asReadonly();
  readonly totalCount = computed(() => this.productsSignal().length);

  getById(id: string): Product | undefined {
    return this.productsSignal().find((product) => product.id === id);
  }

  add(input: ProductInput): Product {
    const product: Product = { id: crypto.randomUUID(), ...input };
    this.productsSignal.update((products) => [...products, product]);
    return product;
  }

  update(id: string, input: ProductInput): void {
    this.productsSignal.update((products) =>
      products.map((product) => (product.id === id ? { id, ...input } : product)),
    );
  }

  remove(id: string): void {
    this.productsSignal.update((products) => products.filter((product) => product.id !== id));
  }
}
