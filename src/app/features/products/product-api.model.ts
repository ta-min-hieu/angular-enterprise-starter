import { ProductStatus } from './product.model';
import { UploadFileResponseDto } from '../../core/http/upload-api.model';

// Khớp ProductResponse phía backend (GET /v1/products, /v1/products/{id}) — id là number (Long),
// ngày tháng là string, một số field có thể null (vd description chưa nhập, tags rỗng).
export interface ProductDto {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly category: string;
  readonly tags: readonly string[] | null;
  readonly description: string | null;
  readonly status: ProductStatus;
  readonly featured: boolean;
  readonly releaseDate: string | null;
  readonly publishedAt: string | null;
  readonly files: readonly UploadFileResponseDto[] | null;
}

// Khớp ProductRequest phía backend — gửi trong part 'product' (JSON, Content-Type: application/json)
// của multipart request tạo/sửa sản phẩm (xem ProductService.add/update).
export interface ProductPayloadDto {
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
