import { MediaAsset } from '../../shared/models/media-asset.model';
import { UploadFileResponseDto } from './upload-api.model';

export function toMediaAsset(dto: UploadFileResponseDto): MediaAsset {
  return {
    id: dto.id,
    type: dto.fileCategory,
    name: dto.originalFileName,
    size: dto.fileSize,
    mimeType: dto.contentType,
    url: dto.url,
  };
}
