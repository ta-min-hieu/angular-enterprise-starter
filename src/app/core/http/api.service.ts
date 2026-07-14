import {
  HttpClient,
  HttpContext,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, filter, map } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { mapApiErrorToAppError } from '../error/app-error.factory';
import { ApiResponse, PageMetadata } from './api-response.model';
import { UploadEvent } from './upload-event.model';

export interface ApiRequestOptions {
  readonly params?: Record<string, string | number | boolean>;
  readonly context?: HttpContext;
  // Tên domain API cấu hình trong AppConfig.apiBaseUrls; không truyền thì dùng apiBaseUrl mặc định.
  readonly apiName?: string;
}

export interface ApiPage<T> {
  readonly items: T;
  readonly metadata: PageMetadata;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.requestEnvelope<T>('GET', path, undefined, options).pipe(
      map((response) => response.data),
    );
  }

  getPage<T>(path: string, options?: ApiRequestOptions): Observable<ApiPage<T>> {
    return this.requestEnvelope<T>('GET', path, undefined, options).pipe(
      map((response) => ({
        items: response.data,
        metadata: response.metadata ?? { page: 0, size: 0, totalElements: 0, totalPages: 0 },
      })),
    );
  }

  post<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.requestEnvelope<T>('POST', path, body, options).pipe(
      map((response) => response.data),
    );
  }

  put<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.requestEnvelope<T>('PUT', path, body, options).pipe(
      map((response) => response.data),
    );
  }

  patch<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.requestEnvelope<T>('PATCH', path, body, options).pipe(
      map((response) => response.data),
    );
  }

  delete<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.requestEnvelope<T>('DELETE', path, undefined, options).pipe(
      map((response) => response.data),
    );
  }

  // Multipart upload (vd tạo/sửa Product kèm file) với tiến trình. Lưu ý: backend Fetch
  // (withFetch() trong app.config.ts) của Angular không phát UploadProgress event (giới hạn của
  // Fetch API) — percent trong trường hợp đó sẽ nhảy thẳng từ 0% lên 100% thay vì tăng dần.
  upload<T>(
    path: string,
    formData: FormData,
    options?: ApiRequestOptions & { method?: 'POST' | 'PUT' },
  ): Observable<UploadEvent<T>> {
    return defer(() => {
      const baseUrl = this.appConfigService.resolveApiBaseUrl(options?.apiName);
      const url = `${baseUrl}/${path.replace(/^\//, '')}`;

      return this.http.request<ApiResponse<T>>(options?.method ?? 'POST', url, {
        body: formData,
        context: options?.context,
        reportProgress: true,
        observe: 'events',
      });
    }).pipe(
      filter(
        (event) =>
          event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response,
      ),
      map((event): UploadEvent<T> => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { type: 'progress', percent };
        }

        const response = (event as HttpResponse<ApiResponse<T>>).body;
        if (!response || response.code !== '200') {
          throw mapApiErrorToAppError(
            response ?? { code: 'UPLOAD_FAILED', message: 'Upload failed', data: undefined as T },
          );
        }

        return { type: 'done', data: response.data };
      }),
    );
  }

  // PUT 1 chunk nhị phân thô (application/octet-stream) — dùng cho upload file lớn theo từng đoạn
  // (POST /v1/files/uploads/{uploadId}/chunks/{chunkIndex}). Khác upload() ở chỗ body là Blob thô,
  // không phải multipart FormData.
  uploadChunk<T>(
    path: string,
    chunk: Blob,
    options?: ApiRequestOptions,
  ): Observable<UploadEvent<T>> {
    return defer(() => {
      const baseUrl = this.appConfigService.resolveApiBaseUrl(options?.apiName);
      const url = `${baseUrl}/${path.replace(/^\//, '')}`;

      return this.http.request<ApiResponse<T>>('PUT', url, {
        body: chunk,
        context: options?.context,
        headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
        reportProgress: true,
        observe: 'events',
      });
    }).pipe(
      filter(
        (event) =>
          event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response,
      ),
      map((event): UploadEvent<T> => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { type: 'progress', percent };
        }

        const response = (event as HttpResponse<ApiResponse<T>>).body;
        if (!response || response.code !== '200') {
          throw mapApiErrorToAppError(
            response ?? { code: 'UPLOAD_FAILED', message: 'Upload failed', data: undefined as T },
          );
        }

        return { type: 'done', data: response.data };
      }),
    );
  }

  // Tải file nhị phân (ảnh/video đã upload) theo path TUYỆT ĐỐI-TỪ-ROOT do backend trả về
  // (vd MediaAsset.url = "/v1/files/8", ghép với AppConfig.mediaBaseUrl — KHÔNG đi qua
  // resolveApiBaseUrl()/apiName vì đây không phải path tương đối kiểu "products/1"). Endpoint này
  // yêu cầu Bearer token nên phải fetch qua ApiService (authInterceptor tự đính header) thay vì
  // gán thẳng URL vào [src] — xem shared/directives/media-src.directive.ts.
  getBlob(rootRelativePath: string): Observable<Blob> {
    return defer(() => {
      const url = `${this.appConfigService.mediaBaseUrl}${rootRelativePath}`;
      return this.http.get(url, { responseType: 'blob' });
    });
  }

  private requestEnvelope<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Observable<ApiResponse<T>> {
    // defer() để resolveApiBaseUrl() (có thể throw nếu apiName sai) chỉ chạy lúc subscribe,
    // qua đó lỗi luôn đi qua kênh error của Observable thay vì throw đồng bộ ngay khi gọi get()/post()...
    return defer(() => {
      const baseUrl = this.appConfigService.resolveApiBaseUrl(options?.apiName);
      const url = `${baseUrl}/${path.replace(/^\//, '')}`;
      let params: HttpParams | undefined;

      if (options?.params) {
        params = Object.entries(options.params).reduce(
          (acc, [key, value]) => acc.set(key, value),
          new HttpParams(),
        );
      }

      return this.http.request<ApiResponse<T>>(method, url, {
        body,
        params,
        context: options?.context,
      });
    }).pipe(
      map((response) => {
        if (response.code !== '200') {
          throw mapApiErrorToAppError(response);
        }

        return response;
      }),
    );
  }
}
