import { MediaAsset } from '../../shared/models/media-asset.model';

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
  readonly files: readonly MediaAsset[];
}

// Không gồm `files` — ảnh/video được gửi riêng qua tham số files/fileIds của
// ProductService.add/update (multipart), không nằm trong JSON payload của sản phẩm.
export type ProductInput = Omit<Product, 'id' | 'files'>;
