import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserService } from './user.service';
import { CreateUserInput, UpdateUserInput } from './user.model';
import { UserDto } from './user-api.model';

const DTO: UserDto = { id: 1, username: 'qa_kc_admin', enabled: true, roles: [] };

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load the full user list with no query params', () => {
    service.load().subscribe();

    const req = httpMock.expectOne('/api/rbac/users');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: '200', message: 'Success', data: [DTO] });

    expect(service.users()).toHaveLength(1);
    expect(service.loading()).toBe(false);
  });

  it('should fetch a single user by id', () => {
    let result: { id: string } | undefined;
    service.getById('1').subscribe((user) => (result = user));

    const req = httpMock.expectOne('/api/rbac/users/1');
    req.flush({ code: '200', message: 'Success', data: DTO });

    expect(result?.id).toBe('1');
  });

  it('should create a user via JSON POST without roleIds', () => {
    const input: CreateUserInput = { username: 'qa_kc_admin', password: 'secret1', enabled: true };
    service.add(input).subscribe();

    const req = httpMock.expectOne('/api/rbac/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should update a user via JSON PUT, omitting the password when not provided', () => {
    const input: UpdateUserInput = { enabled: false };
    service.update('1', input).subscribe();

    const req = httpMock.expectOne('/api/rbac/users/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should include the password in the update payload when changing it', () => {
    service.update('1', { enabled: true, password: 'newpass1' }).subscribe();

    const req = httpMock.expectOne('/api/rbac/users/1');
    expect(req.request.body).toEqual({ enabled: true, password: 'newpass1' });
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should remove a user', () => {
    service.remove('1').subscribe();

    const req = httpMock.expectOne('/api/rbac/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success' });
  });

  it('should replace assigned roles via PUT, converting ids to numbers', () => {
    service.updateRoles('1', ['1', '2']).subscribe();

    const req = httpMock.expectOne('/api/rbac/users/1/roles');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ roleIds: [1, 2] });
    req.flush({ code: '200', message: 'Success' });
  });
});
