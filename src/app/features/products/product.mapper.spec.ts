import { describe, expect, it } from 'vitest';
import { toProduct, toProductPayload } from './product.mapper';
import { ProductDto } from './product-api.model';
import { ProductInput } from './product.model';

const DTO: ProductDto = {
  id: 3,
  name: 'Ban phim co',
  price: 1290000,
  stock: 24,
  category: 'accessories',
  tags: ['new', 'best-seller'],
  description: 'Ban phim co switch do',
  status: 'active',
  featured: true,
  releaseDate: '2025-01-15',
  publishedAt: '2025-01-15T09:00:00',
  files: [
    {
      id: 7,
      originalFileName: 'photo.jpg',
      fileCategory: 'image',
      contentType: 'image/jpeg',
      fileSize: 1024,
      url: '/v1/files/7',
    },
  ],
};

describe('product.mapper', () => {
  it('maps a backend DTO to the frontend Product model', () => {
    const product = toProduct(DTO);

    expect(product.id).toBe('3');
    expect(product.releaseDate).toEqual(new Date(2025, 0, 15));
    expect(product.publishedAt).toEqual(new Date(2025, 0, 15, 9, 0, 0));
    expect(product.files).toEqual([
      {
        id: 7,
        type: 'image',
        name: 'photo.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        url: '/v1/files/7',
      },
    ]);
  });

  it('maps null date fields to null', () => {
    const product = toProduct({ ...DTO, releaseDate: null, publishedAt: null });

    expect(product.releaseDate).toBeNull();
    expect(product.publishedAt).toBeNull();
  });

  it('maps nullable fields returned by the live API (description/tags/files) to safe defaults', () => {
    const product = toProduct({ ...DTO, description: null, tags: null, files: null });

    expect(product.description).toBe('');
    expect(product.tags).toEqual([]);
    expect(product.files).toEqual([]);
  });

  it('maps a ProductInput back to the backend ProductRequest payload shape', () => {
    const input: ProductInput = {
      name: 'Ban phim co',
      price: 1290000,
      stock: 24,
      category: 'accessories',
      tags: ['new'],
      description: 'desc',
      status: 'active',
      featured: true,
      releaseDate: new Date(2025, 0, 15),
      publishedAt: new Date(2025, 0, 15, 9, 0, 0),
    };

    const payload = toProductPayload(input);

    expect(payload.releaseDate).toBe('2025-01-15');
    expect(payload.publishedAt).toBe('2025-01-15T09:00:00');
    expect(payload).not.toHaveProperty('files');
  });

  it('maps null dates on ProductInput to null in the payload', () => {
    const payload = toProductPayload({
      name: 'x',
      price: 1,
      stock: 1,
      category: 'other',
      tags: [],
      description: '',
      status: 'inactive',
      featured: false,
      releaseDate: null,
      publishedAt: null,
    });

    expect(payload.releaseDate).toBeNull();
    expect(payload.publishedAt).toBeNull();
  });
});
