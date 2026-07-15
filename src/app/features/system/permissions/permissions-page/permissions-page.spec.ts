import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsPage } from './permissions-page';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const PERMISSION_DTO = {
  id: 1,
  code: 'user.read',
  name: 'Xem người dùng',
  httpMethod: 'GET',
  urlPattern: '/v1/users/**',
  description: '',
  status: 'ACTIVE',
};

describe('PermissionsPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PermissionsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
        { provide: NzMessageService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  function flushList(data: readonly unknown[] = [PERMISSION_DTO]) {
    const req = httpMock.expectOne((r) => r.url === '/api/rbac/permissions');
    req.flush({ code: '200', message: 'Success', data });
  }

  it('should load and render permissions from the API on init', () => {
    const fixture = TestBed.createComponent(PermissionsPage);
    fixture.detectChanges();
    flushList();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('should filter client-side by keyword across code/name/urlPattern', () => {
    const fixture = TestBed.createComponent(PermissionsPage);
    fixture.detectChanges();
    flushList([
      PERMISSION_DTO,
      {
        ...PERMISSION_DTO,
        id: 2,
        code: 'role.read',
        name: 'Xem vai trò',
        urlPattern: '/v1/roles/**',
      },
    ]);
    fixture.detectChanges();

    fixture.componentInstance.list.onKeywordChange('role');
    fixture.detectChanges();

    expect(fixture.componentInstance.list.filteredItems()).toHaveLength(1);
    expect(fixture.componentInstance.list.filteredItems()[0].code).toBe('role.read');
  });

  it('should show an error notification when deleting a permission fails', () => {
    const fixture = TestBed.createComponent(PermissionsPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.list.onDelete('1');

    httpMock
      .expectOne('/api/rbac/permissions/1')
      .flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });
  });

  it('should remove a permission via PermissionService and reload the list', () => {
    const fixture = TestBed.createComponent(PermissionsPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.list.onDelete('1');

    const deleteReq = httpMock.expectOne('/api/rbac/permissions/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ code: '200', message: 'Success' });

    flushList([]);
  });

  it('should surface an AppError in the error signal when loading fails', () => {
    const fixture = TestBed.createComponent(PermissionsPage);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === '/api/rbac/permissions');
    req.flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });

    expect(fixture.componentInstance.list.error()).not.toBeNull();
  });
});
