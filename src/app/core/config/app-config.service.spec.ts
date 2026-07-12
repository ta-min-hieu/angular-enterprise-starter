import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppConfigService } from './app-config.service';
import { DEFAULT_APP_CONFIG } from './app-config.model';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should expose DEFAULT_APP_CONFIG before load() resolves', () => {
    expect(service.config()).toEqual(DEFAULT_APP_CONFIG);
  });

  it('should update config signal from config.json on successful load', async () => {
    const loadPromise = service.load();

    const req = httpMock.expectOne('config.json');
    req.flush({ ...DEFAULT_APP_CONFIG, apiBaseUrl: '/api/v2' });

    await loadPromise;

    expect(service.apiBaseUrl).toBe('/api/v2');
  });

  it('should fall back to DEFAULT_APP_CONFIG when config.json request fails', async () => {
    const loadPromise = service.load();

    const req = httpMock.expectOne('config.json');
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'error' });

    await loadPromise;

    expect(service.config()).toEqual(DEFAULT_APP_CONFIG);
  });

  it('should resolve apiBaseUrl when no apiName is given', () => {
    expect(service.resolveApiBaseUrl()).toBe(DEFAULT_APP_CONFIG.apiBaseUrl);
  });

  it('should resolve a named domain from apiBaseUrls when apiName is given', async () => {
    const loadPromise = service.load();
    const req = httpMock.expectOne('config.json');
    req.flush({
      ...DEFAULT_APP_CONFIG,
      apiBaseUrls: { payment: 'https://payment.example.com/v1' },
    });
    await loadPromise;

    expect(service.resolveApiBaseUrl('payment')).toBe('https://payment.example.com/v1');
  });

  it('should throw a clear error when apiName is not configured', () => {
    expect(() => service.resolveApiBaseUrl('does-not-exist')).toThrow(/does-not-exist/);
  });
});
