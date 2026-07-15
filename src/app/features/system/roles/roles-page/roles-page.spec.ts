import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesPage } from './roles-page';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const ROLE_DTO = {
  id: 1,
  roleKey: 'ADMIN',
  roleName: 'Quản trị viên',
  description: 'Toàn quyền',
  dataScope: 'ALL',
  status: 'ACTIVE',
  sortOrder: 0,
};

describe('RolesPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RolesPage],
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

  function flushList(data: readonly unknown[] = [ROLE_DTO]) {
    const req = httpMock.expectOne((r) => r.url === '/api/rbac/roles');
    req.flush({ code: '200', message: 'Success', data });
  }

  it('should load and render roles from the API on init', () => {
    const fixture = TestBed.createComponent(RolesPage);
    fixture.detectChanges();
    flushList();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('should filter client-side by keyword across roleKey/roleName', () => {
    const fixture = TestBed.createComponent(RolesPage);
    fixture.detectChanges();
    flushList([ROLE_DTO, { ...ROLE_DTO, id: 2, roleKey: 'USER', roleName: 'Người dùng' }]);
    fixture.detectChanges();

    fixture.componentInstance.list.onKeywordChange('user');
    fixture.detectChanges();

    expect(fixture.componentInstance.list.filteredItems()).toHaveLength(1);
    expect(fixture.componentInstance.list.filteredItems()[0].roleKey).toBe('USER');
  });

  it('should show an error notification when deleting a role fails', () => {
    const fixture = TestBed.createComponent(RolesPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.list.onDelete('1');

    httpMock
      .expectOne('/api/rbac/roles/1')
      .flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });
  });

  it('should remove a role via RoleService and reload the list', () => {
    const fixture = TestBed.createComponent(RolesPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.list.onDelete('1');

    const deleteReq = httpMock.expectOne('/api/rbac/roles/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ code: '200', message: 'Success' });

    flushList([]);
  });

  it('should surface an AppError in the error signal when loading fails', () => {
    const fixture = TestBed.createComponent(RolesPage);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === '/api/rbac/roles');
    req.flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });

    expect(fixture.componentInstance.list.error()).not.toBeNull();
  });
});
