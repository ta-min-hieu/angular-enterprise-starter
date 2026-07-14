import { describe, expect, it } from 'vitest';
import { toMediaAsset } from './media-asset.mapper';
import { UploadFileResponseDto } from './upload-api.model';

describe('media-asset.mapper', () => {
  it('maps an image UploadFileResponse to a MediaAsset', () => {
    const dto: UploadFileResponseDto = {
      id: 7,
      originalFileName: 'photo.png',
      fileCategory: 'image',
      contentType: 'image/png',
      fileSize: 1024,
      url: '/v1/files/7',
    };

    expect(toMediaAsset(dto)).toEqual({
      id: 7,
      type: 'image',
      name: 'photo.png',
      size: 1024,
      mimeType: 'image/png',
      url: '/v1/files/7',
    });
  });

  it('maps a video UploadFileResponse to a MediaAsset', () => {
    const dto: UploadFileResponseDto = {
      id: 8,
      originalFileName: 'clip.mp4',
      fileCategory: 'video',
      contentType: 'video/mp4',
      fileSize: 300000,
      url: '/v1/files/8',
    };

    expect(toMediaAsset(dto).type).toBe('video');
  });
});
