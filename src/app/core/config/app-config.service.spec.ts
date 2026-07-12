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
});
