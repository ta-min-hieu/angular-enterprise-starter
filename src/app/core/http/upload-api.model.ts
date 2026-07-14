// Khớp UploadFileResponse phía backend (POST/PUT /v1/products, POST /v1/files/uploads/{id}/complete).
export interface UploadFileResponseDto {
  readonly id: number;
  readonly originalFileName: string;
  readonly fileCategory: 'image' | 'video';
  readonly contentType: string;
  readonly fileSize: number;
  readonly url: string;
}

// Khớp InitChunkedUploadRequest — gửi lên POST /v1/files/uploads.
export interface InitChunkedUploadRequestDto {
  readonly originalFileName: string;
  readonly contentType: string;
  readonly fileSize: number;
  readonly chunkSize: number;
}

// Khớp InitChunkedUploadResponse — nhận lại từ POST /v1/files/uploads.
export interface InitChunkedUploadResponseDto {
  readonly uploadId: string;
  readonly chunkSize: number;
  readonly totalChunks: number;
}

// Khớp ChunkUploadProgressResponse — nhận lại sau mỗi PUT /v1/files/uploads/{id}/chunks/{i}.
export interface ChunkUploadProgressResponseDto {
  readonly uploadId: string;
  readonly receivedChunks: number;
  readonly totalChunks: number;
  readonly completed: boolean;
}
