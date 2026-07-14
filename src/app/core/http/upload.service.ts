import { Injectable, inject } from '@angular/core';
import { Observable, concat, from, map, switchMap, tap } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  ChunkUploadProgressResponseDto,
  InitChunkedUploadResponseDto,
  UploadFileResponseDto,
} from './upload-api.model';
import { toMediaAsset } from './media-asset.mapper';
import { MediaAsset } from '../../shared/models/media-asset.model';
import { UploadEvent, UploadProgressEvent } from './upload-event.model';

export interface ChunkedUploadOptions {
  // Kích thước mỗi chunk (bytes). Backend yêu cầu trong khoảng [256KB, 20MB] (STORAGE_MIN/MAX_CHUNK_SIZE).
  readonly chunkSizeBytes?: number;
  // Gọi ngay khi phiên upload được khởi tạo (biết uploadId) — dùng để lưu lại uploadId cho phép huỷ giữa chừng qua abort().
  readonly onInit?: (uploadId: string) => void;
}

const DEFAULT_CHUNK_SIZE_BYTES = 2 * 1024 * 1024;

// Khớp API upload theo từng đoạn thật của backend (POST/PUT/POST /v1/files/uploads/**, xem FileController).
// KHÔNG có endpoint upload 1 file đơn lẻ — file nhỏ được gửi trực tiếp cùng request tạo/sửa Product
// (xem ProductService.add/update), chỉ file lớn mới đi qua service này.
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly apiService = inject(ApiService);

  uploadChunked(file: File, options?: ChunkedUploadOptions): Observable<UploadEvent<MediaAsset>> {
    const chunkSizeBytes = options?.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE_BYTES;

    return this.init(file, chunkSizeBytes).pipe(
      tap((init) => options?.onInit?.(init.uploadId)),
      switchMap((init) => this.uploadAllChunks(file, init)),
    );
  }

  // Xoá phiên upload dở dang + dữ liệu tạm đã nhận (DELETE /v1/files/uploads/{uploadId}).
  abort(uploadId: string): Observable<void> {
    return this.apiService.delete<void>(`files/uploads/${uploadId}`);
  }

  private init(file: File, chunkSizeBytes: number): Observable<InitChunkedUploadResponseDto> {
    return this.apiService.post<InitChunkedUploadResponseDto>('files/uploads', {
      originalFileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      chunkSize: chunkSizeBytes,
    });
  }

  private uploadAllChunks(
    file: File,
    init: InitChunkedUploadResponseDto,
  ): Observable<UploadEvent<MediaAsset>> {
    const { uploadId, chunkSize, totalChunks } = init;
    const chunkIndexes = Array.from({ length: totalChunks }, (_, index) => index);

    const chunks$: Observable<UploadEvent<MediaAsset>> = from(chunkIndexes).pipe(
      concatMap((chunkIndex) =>
        this.uploadChunk(file, uploadId, chunkIndex, chunkSize, totalChunks),
      ),
    );

    const complete$: Observable<UploadEvent<MediaAsset>> = this.apiService
      .post<UploadFileResponseDto>(`files/uploads/${uploadId}/complete`, undefined)
      .pipe(map((dto): UploadEvent<MediaAsset> => ({ type: 'done', data: toMediaAsset(dto) })));

    return concat(chunks$, complete$);
  }

  // Mỗi chunk là 1 PUT nhị phân thô riêng — dù server chưa xong hết file, ta vẫn có mốc tiến trình
  // rõ ràng theo số chunk đã hoàn tất (không phụ thuộc UploadProgress event, vốn không được Fetch
  // backend của Angular phát ra — xem ghi chú trong api.service.ts).
  private uploadChunk(
    file: File,
    uploadId: string,
    chunkIndex: number,
    chunkSize: number,
    totalChunks: number,
  ): Observable<UploadProgressEvent> {
    const start = chunkIndex * chunkSize;
    // Ép content-type của Blob thành octet-stream (thay vì kế thừa mime gốc của file) để khớp
    // đúng `consumes = APPLICATION_OCTET_STREAM_VALUE` phía backend.
    const blob = file.slice(start, start + chunkSize, 'application/octet-stream');

    return this.apiService
      .uploadChunk<ChunkUploadProgressResponseDto>(
        `files/uploads/${uploadId}/chunks/${chunkIndex}`,
        blob,
      )
      .pipe(
        map((event): UploadProgressEvent => {
          const chunkFraction = event.type === 'progress' ? event.percent / 100 : 1;
          return {
            type: 'progress',
            percent: Math.round(((chunkIndex + chunkFraction) / totalChunks) * 100),
          };
        }),
      );
  }
}
