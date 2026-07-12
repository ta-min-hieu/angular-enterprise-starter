import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should GET and unwrap a successful response', () => {
    let result: { id: string } | undefined;
    service.get<{ id: string }>('users/1').subscribe((data) => (result = data));

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: '1' } });

    expect(result).toEqual({ id: '1' });
  });

  it('should serialize query params on GET', () => {
    service.get('users', { params: { page: 1, active: true } }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/users' && r.params.get('page') === '1' && r.params.get('active') === 'true',
    );
    req.flush({ success: true, data: [] });
  });

  it('should POST a body and unwrap the response', () => {
    let result: unknown;
    service.post('users', { name: 'alice' }).subscribe((data) => (result = data));

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'alice' });
    req.flush({ success: true, data: { id: '2' } });

    expect(result).toEqual({ id: '2' });
  });

  it('should PUT and PATCH using the same envelope contract', () => {
    service.put('users/1', { name: 'bob' }).subscribe();
    httpMock
      .expectOne((r) => r.method === 'PUT' && r.url === '/api/users/1')
      .flush({
        success: true,
        data: {},
      });

    service.patch('users/1', { name: 'bob' }).subscribe();
    httpMock
      .expectOne((r) => r.method === 'PATCH' && r.url === '/api/users/1')
      .flush({
        success: true,
        data: {},
      });
  });

  it('should DELETE a resource', () => {
    service.delete('users/1').subscribe();

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null });
  });

  it('should throw a mapped AppError when the envelope reports success=false', () => {
    let error: unknown;
    service.get('users/1').subscribe({ error: (err) => (error = err) });

    const req = httpMock.expectOne('/api/users/1');
    req.flush({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    expect(error).toMatchObject({ code: 'NOT_FOUND', message: 'User not found' });
  });
});
