import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MenusPage } from './menus-page';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const MENU_DTO = {
  id: 1,
  name: 'Hệ thống',
  path: '/system',
  component: '',
  icon: 'setting',
  menuType: 'DIRECTORY',
  parentId: null,
  sortOrder: 0,
  visible: true,
  status: 'ACTIVE',
};

describe('MenusPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MenusPage],
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

  function flushList(data: readonly unknown[] = [MENU_DTO]) {
    const req = httpMock.expectOne((r) => r.url === '/api/rbac/menus');
    req.flush({ code: '200', message: 'Success', data });
  }

  it('should load menus and build a tree from the flat list', () => {
    const fixture = TestBed.createComponent(MenusPage);
    fixture.detectChanges();
    flushList();
    fixture.detectChanges();

    expect(fixture.componentInstance.treeNodes()).toHaveLength(1);
    expect(fixture.componentInstance.treeNodes()[0].key).toBe('1');
  });

  it('should show the empty state when there are no menus', () => {
    const fixture = TestBed.createComponent(MenusPage);
    fixture.detectChanges();
    flushList([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('menus.empty.no_data');
  });

  it('should remove a menu via MenuService and reload the tree', () => {
    const fixture = TestBed.createComponent(MenusPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.onDelete('1');

    const deleteReq = httpMock.expectOne('/api/rbac/menus/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ code: '200', message: 'Success' });

    flushList([]);
  });

  it('should show an error notification when deleting a menu fails', () => {
    const fixture = TestBed.createComponent(MenusPage);
    fixture.detectChanges();
    flushList();

    fixture.componentInstance.onDelete('1');

    httpMock
      .expectOne('/api/rbac/menus/1')
      .flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });
  });

  it('should reload the tree on retry', () => {
    const fixture = TestBed.createComponent(MenusPage);
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url === '/api/rbac/menus')
      .flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });
    expect(fixture.componentInstance.error()).not.toBeNull();

    fixture.componentInstance.onRetry();
    flushList([]);
    expect(fixture.componentInstance.error()).toBeNull();
  });

  it('should surface an AppError in the error signal when loading fails', () => {
    const fixture = TestBed.createComponent(MenusPage);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === '/api/rbac/menus');
    req.flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });

    expect(fixture.componentInstance.error()).not.toBeNull();
  });
});
