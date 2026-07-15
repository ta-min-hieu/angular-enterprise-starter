import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { describe, expect, it, vi } from 'vitest';
import { RoleFormPage } from './role-form-page';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const ROLE_DTO = {
  id: 1,
  roleKey: 'ADMIN',
  roleName: 'Quản trị viên',
  description: '',
  dataScope: 'ALL',
  status: 'ACTIVE',
  sortOrder: 0,
};

const PERMISSION_DTO = {
  id: 1,
  code: 'user.read',
  name: 'Xem người dùng',
  httpMethod: 'GET',
  urlPattern: '/v1/users/**',
  description: '',
  status: 'ACTIVE',
};

const MENU_DTO = {
  id: 2,
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

describe('RoleFormPage', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [RoleFormPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
        { provide: NzMessageService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(RoleFormPage);
    const router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    return { fixture, router };
  }

  function flushPreloads() {
    httpMock
      .expectOne('/api/rbac/permissions')
      .flush({ code: '200', message: 'Success', data: [] });
    httpMock.expectOne('/api/rbac/menus').flush({ code: '200', message: 'Success', data: [] });
  }

  it('should be in create mode when no id is provided and skip fetching assigned ids', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    flushPreloads();

    expect(fixture.componentInstance.isEditMode()).toBe(false);
    expect(fixture.componentInstance.role()).toBeNull();
    expect(fixture.componentInstance.assignedPermissionIds()).toEqual([]);
    expect(fixture.componentInstance.assignedMenuIds()).toEqual([]);
  });

  it('should fetch the role and its assigned permissions/menus when an id is provided', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    flushPreloads();

    httpMock
      .expectOne('/api/rbac/roles/1')
      .flush({ code: '200', message: 'Success', data: ROLE_DTO });
    fixture.detectChanges();

    httpMock
      .expectOne('/api/rbac/roles/1/permissions')
      .flush({ code: '200', message: 'Success', data: [PERMISSION_DTO] });
    httpMock
      .expectOne('/api/rbac/roles/1/menus')
      .flush({ code: '200', message: 'Success', data: [MENU_DTO] });

    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.assignedPermissionIds()).toEqual(['1']);
    expect(fixture.componentInstance.assignedMenuIds()).toEqual(['2']);
  });

  it('should do nothing when saving permission/menu assignments before a role is loaded', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    flushPreloads();

    fixture.componentInstance.onSavePermissions({ permissionIds: ['1'] });
    fixture.componentInstance.onSaveMenus({ menuIds: ['2'] });

    httpMock.verify();
  });

  it('should update permission assignments for the loaded role', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    flushPreloads();
    httpMock
      .expectOne('/api/rbac/roles/1')
      .flush({ code: '200', message: 'Success', data: ROLE_DTO });
    fixture.detectChanges();
    httpMock
      .expectOne('/api/rbac/roles/1/permissions')
      .flush({ code: '200', message: 'Success', data: [] });
    httpMock
      .expectOne('/api/rbac/roles/1/menus')
      .flush({ code: '200', message: 'Success', data: [] });

    fixture.componentInstance.onSavePermissions({ permissionIds: ['1'] });

    const req = httpMock.expectOne('/api/rbac/roles/1/permissions');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ permissionIds: [1] });
    req.flush({ code: '200', message: 'Success', data: [] });

    expect(fixture.componentInstance.savingPermissions()).toBe(false);
  });

  it('should update menu assignments for the loaded role', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    flushPreloads();
    httpMock
      .expectOne('/api/rbac/roles/1')
      .flush({ code: '200', message: 'Success', data: ROLE_DTO });
    fixture.detectChanges();
    httpMock
      .expectOne('/api/rbac/roles/1/permissions')
      .flush({ code: '200', message: 'Success', data: [] });
    httpMock
      .expectOne('/api/rbac/roles/1/menus')
      .flush({ code: '200', message: 'Success', data: [] });

    fixture.componentInstance.onSaveMenus({ menuIds: ['2'] });

    const req = httpMock.expectOne('/api/rbac/roles/1/menus');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ menuIds: [2] });
    req.flush({ code: '200', message: 'Success', data: [] });

    expect(fixture.componentInstance.savingMenus()).toBe(false);
  });

  it('should redirect to the list when the id does not match any role', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', 'does-not-exist');
    fixture.detectChanges();
    flushPreloads();

    const req = httpMock.expectOne('/api/rbac/roles/does-not-exist');
    req.flush({ code: '404', message: 'Role not found' }, { status: 404, statusText: 'Not Found' });

    expect(router.navigate).toHaveBeenCalledWith(['/system/roles']);
  });

  it('should create a new role and navigate back when saving in create mode', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();
    flushPreloads();

    fixture.componentInstance.onSave({
      input: {
        roleKey: 'ADMIN',
        roleName: 'Quản trị viên',
        description: '',
        dataScope: 'ALL',
        status: 'ACTIVE',
        sortOrder: 0,
      },
    });

    const req = httpMock.expectOne('/api/rbac/roles');
    expect(req.request.method).toBe('POST');
    req.flush({ code: '200', message: 'Success', data: ROLE_DTO });

    expect(router.navigate).toHaveBeenCalledWith(['/system/roles']);
    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should show an error notification and stop saving when the role save request fails', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    flushPreloads();

    fixture.componentInstance.onSave({
      input: {
        roleKey: 'ADMIN',
        roleName: 'Quản trị viên',
        description: '',
        dataScope: 'ALL',
        status: 'ACTIVE',
        sortOrder: 0,
      },
    });

    httpMock
      .expectOne('/api/rbac/roles')
      .flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });

    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should navigate back to the list on cancel', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();
    flushPreloads();

    fixture.componentInstance.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/system/roles']);
  });
});
