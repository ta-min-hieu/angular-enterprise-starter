import { ProductStatus } from './product.model';

// Shape trả về bởi backend (`GET/POST/PUT /products`) — id là number, ngày tháng là string.
export interface ProductDto {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly category: string;
  readonly tags: readonly string[];
  readonly description: string;
  readonly status: ProductStatus;
  readonly featured: boolean;
  readonly releaseDate: string | null;
  readonly publishedAt: string | null;
}

export type ProductPayloadDto = Omit<ProductDto, 'id'>;
