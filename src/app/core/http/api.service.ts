import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { mapApiErrorToAppError } from '../error/app-error.factory';
import { ApiResponse, PageMetadata } from './api-response.model';

export interface ApiRequestOptions {
  readonly params?: Record<string, string | number | boolean>;
  readonly context?: HttpContext;
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

  private requestEnvelope<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Observable<ApiResponse<T>> {
    const url = `${this.appConfigService.apiBaseUrl}/${path.replace(/^\//, '')}`;
    let params: HttpParams | undefined;

    if (options?.params) {
      params = Object.entries(options.params).reduce(
        (acc, [key, value]) => acc.set(key, value),
        new HttpParams(),
      );
    }

    return this.http
      .request<ApiResponse<T>>(method, url, {
        body,
        params,
        context: options?.context,
      })
      .pipe(
        map((response) => {
          if (response.code !== '200') {
            throw mapApiErrorToAppError(response);
          }

          return response;
        }),
      );
  }
}
