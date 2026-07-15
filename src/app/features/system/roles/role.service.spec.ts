import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoleService } from './role.service';
import { RoleInput } from './role.model';
import { RoleDto } from './role-api.model';
import { PermissionDto } from '../permissions/permission-api.model';
import { MenuDto } from '../menus/menu-api.model';

const BASE_INPUT: RoleInput = {
  roleKey: 'ADMIN',
  roleName: 'Quản trị viên',
  description: 'Toàn quyền',
  dataScope: 'ALL',
  status: 'ACTIVE',
  sortOrder: 1,
};

const DTO: RoleDto = { id: 1, ...BASE_INPUT };

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load the full role list with no query params', () => {
    service.load().subscribe();

    const req = httpMock.expectOne('/api/rbac/roles');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ code: '200', message: 'Success', data: [DTO] });

    expect(service.roles()).toHaveLength(1);
  });

  it('should fetch a single role by id', () => {
    let result: { id: string } | undefined;
    service.getById('1').subscribe((role) => (result = role));

    const req = httpMock.expectOne('/api/rbac/roles/1');
    req.flush({ code: '200', message: 'Success', data: DTO });

    expect(result?.id).toBe('1');
  });

  it('should create a role via JSON POST', () => {
    service.add(BASE_INPUT).subscribe();

    const req = httpMock.expectOne('/api/rbac/roles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(BASE_INPUT);
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should update a role via JSON PUT', () => {
    service.update('1', BASE_INPUT).subscribe();

    const req = httpMock.expectOne('/api/rbac/roles/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should remove a role', () => {
    service.remove('1').subscribe();

    const req = httpMock.expectOne('/api/rbac/roles/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success' });
  });

  it('should fetch permissions assigned to a role as full Permission objects', () => {
    const permissionDto: PermissionDto = {
      id: 5,
      code: 'user.read',
      name: 'Xem người dùng',
      httpMethod: 'GET',
      urlPattern: '/v1/users/**',
      description: '',
      status: 'ACTIVE',
    };
    let result: readonly { id: string }[] | undefined;
    service.getPermissions('1').subscribe((permissions) => (result = permissions));

    const req = httpMock.expectOne('/api/rbac/roles/1/permissions');
    expect(req.request.method).toBe('GET');
    req.flush({ code: '200', message: 'Success', data: [permissionDto] });

    expect(result?.map((permission) => permission.id)).toEqual(['5']);
  });

  it('should replace assigned permissions via PUT, converting ids to numbers', () => {
    service.updatePermissions('1', ['5', '6']).subscribe();

    const req = httpMock.expectOne('/api/rbac/roles/1/permissions');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ permissionIds: [5, 6] });
    req.flush({ code: '200', message: 'Success', data: [] });
  });

  it('should fetch menus assigned to a role as full Menu objects', () => {
    const menuDto: MenuDto = {
      id: 3,
      parentId: null,
      name: 'Hệ thống',
      path: '/system',
      component: '',
      icon: 'setting',
      menuType: 'DIRECTORY',
      sortOrder: 0,
      visible: true,
      status: 'ACTIVE',
    };
    let result: readonly { id: string }[] | undefined;
    service.getMenus('1').subscribe((menus) => (result = menus));

    const req = httpMock.expectOne('/api/rbac/roles/1/menus');
    expect(req.request.method).toBe('GET');
    req.flush({ code: '200', message: 'Success', data: [menuDto] });

    expect(result?.map((menu) => menu.id)).toEqual(['3']);
  });

  it('should replace assigned menus via PUT, converting ids to numbers', () => {
    service.updateMenus('1', ['3']).subscribe();

    const req = httpMock.expectOne('/api/rbac/roles/1/menus');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ menuIds: [3] });
    req.flush({ code: '200', message: 'Success', data: [] });
  });
});
