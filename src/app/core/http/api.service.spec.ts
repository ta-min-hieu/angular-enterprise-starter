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
    req.flush({ code: '200', message: 'Success', data: { id: '1' } });

    expect(result).toEqual({ id: '1' });
  });

  it('should serialize query params on GET', () => {
    service.get('users', { params: { page: 1, active: true } }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/users' && r.params.get('page') === '1' && r.params.get('active') === 'true',
    );
    req.flush({ code: '200', message: 'Success', data: [] });
  });

  it('should POST a body and unwrap the response', () => {
    let result: unknown;
    service.post('users', { name: 'alice' }).subscribe((data) => (result = data));

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'alice' });
    req.flush({ code: '200', message: 'Success', data: { id: '2' } });

    expect(result).toEqual({ id: '2' });
  });

  it('should PUT and PATCH using the same envelope contract', () => {
    service.put('users/1', { name: 'bob' }).subscribe();
    httpMock
      .expectOne((r) => r.method === 'PUT' && r.url === '/api/users/1')
      .flush({
        code: '200',
        message: 'Success',
        data: {},
      });

    service.patch('users/1', { name: 'bob' }).subscribe();
    httpMock
      .expectOne((r) => r.method === 'PATCH' && r.url === '/api/users/1')
      .flush({
        code: '200',
        message: 'Success',
        data: {},
      });
  });

  it('should DELETE a resource', () => {
    service.delete('users/1').subscribe();

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success', data: null });
  });

  it('should throw a mapped AppError when the envelope code is not 200', () => {
    let error: unknown;
    service.get('users/1').subscribe({ error: (err) => (error = err) });

    const req = httpMock.expectOne('/api/users/1');
    req.flush({ code: 'NOT_FOUND', message: 'User not found', data: null });

    expect(error).toMatchObject({ code: 'NOT_FOUND', message: 'User not found' });
  });

  it('should GET a page and expose both items and pagination metadata', () => {
    let result: { items: unknown; metadata: unknown } | undefined;
    service
      .getPage('users', { params: { page: 0, size: 10 } })
      .subscribe((page) => (result = page));

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/users' && r.params.get('page') === '0' && r.params.get('size') === '10',
    );
    req.flush({
      code: '200',
      message: 'Success',
      data: [{ id: '1' }],
      metadata: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    });

    expect(result).toEqual({
      items: [{ id: '1' }],
      metadata: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    });
  });
});
