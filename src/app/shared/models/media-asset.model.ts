export type MediaType = 'image' | 'video';

// url là đường dẫn tương đối do backend trả về (vd '/v1/files/8', xem UploadFileResponse) —
// endpoint tải file yêu cầu Bearer token nên KHÔNG gán thẳng vào [src]; dùng directive
// appMediaSrc (shared/directives/media-src.directive.ts) để fetch có auth rồi tạo object URL.
export interface MediaAsset {
  readonly id: number;
  readonly type: MediaType;
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url: string;
}
