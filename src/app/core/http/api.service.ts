import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { mapApiErrorToAppError } from '../error/app-error.factory';
import { ApiResponse } from './api-response.model';

export interface ApiRequestOptions {
  readonly params?: Record<string, string | number | boolean>;
  readonly context?: HttpContext;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options?: ApiRequestOptions,
  ): Observable<T> {
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

          return response.data;
        }),
      );
  }
}
