import { Product, ProductInput } from './product.model';
import { ProductDto, ProductPayloadDto } from './product-api.model';
import { toMediaAsset } from '../../core/http/media-asset.mapper';

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${formatDateOnly(date)}T${hours}:${minutes}:${seconds}`;
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: String(dto.id),
    name: dto.name,
    price: dto.price,
    stock: dto.stock,
    category: dto.category,
    tags: dto.tags ?? [],
    description: dto.description ?? '',
    status: dto.status,
    featured: dto.featured,
    releaseDate: dto.releaseDate ? parseDateOnly(dto.releaseDate) : null,
    publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    files: (dto.files ?? []).map(toMediaAsset),
  };
}

export function toProductPayload(input: ProductInput): ProductPayloadDto {
  return {
    name: input.name,
    price: input.price,
    stock: input.stock,
    category: input.category,
    tags: input.tags,
    description: input.description,
    status: input.status,
    featured: input.featured,
    releaseDate: input.releaseDate ? formatDateOnly(input.releaseDate) : null,
    publishedAt: input.publishedAt ? formatDateTime(input.publishedAt) : null,
  };
}
