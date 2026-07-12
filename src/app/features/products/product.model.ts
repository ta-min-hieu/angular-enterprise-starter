export type ProductStatus = 'active' | 'inactive';

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly category: string;
  readonly tags: readonly string[];
  readonly description: string;
  readonly status: ProductStatus;
  readonly featured: boolean;
  readonly releaseDate: Date | null;
  readonly publishedAt: Date | null;
}

export type ProductInput = Omit<Product, 'id'>;
