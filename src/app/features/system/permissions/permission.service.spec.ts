import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PermissionService } from './permission.service';
import { PermissionInput } from './permission.model';
import { PermissionDto } from './permission-api.model';

const BASE_INPUT: PermissionInput = {
  code: 'user.read',
  name: 'Xem người dùng',
  httpMethod: 'GET',
  urlPattern: '/v1/users/**',
  description: '',
  status: 'ACTIVE',
};

const DTO: PermissionDto = { id: 1, ...BASE_INPUT };

describe('PermissionService', () => {
  let service: PermissionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PermissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load the full permission list with no query params', () => {
    service.load().subscribe();

    const req = httpMock.expectOne('/api/rbac/permissions');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: '200', message: 'Success', data: [DTO] });

    expect(service.permissions()).toHaveLength(1);
    expect(service.loading()).toBe(false);
  });

  it('should fetch a single permission by id', () => {
    let result: { id: string } | undefined;
    service.getById('1').subscribe((permission) => (result = permission));

    const req = httpMock.expectOne('/api/rbac/permissions/1');
    req.flush({ code: '200', message: 'Success', data: DTO });

    expect(result?.id).toBe('1');
  });

  it('should create a permission via JSON POST', () => {
    service.add(BASE_INPUT).subscribe();

    const req = httpMock.expectOne('/api/rbac/permissions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(BASE_INPUT);
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should update a permission via JSON PUT', () => {
    service.update('1', BASE_INPUT).subscribe();

    const req = httpMock.expectOne('/api/rbac/permissions/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should remove a permission', () => {
    service.remove('1').subscribe();

    const req = httpMock.expectOne('/api/rbac/permissions/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success' });
  });
});
