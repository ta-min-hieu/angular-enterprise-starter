import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { describe, expect, it, vi } from 'vitest';
import { MenuFormPage } from './menu-form-page';
import { MenuFormSaveEvent } from '../menu-form/menu-form';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const BASE_SAVE_EVENT: MenuFormSaveEvent = {
  input: {
    name: 'Người dùng',
    path: '/system/users',
    component: 'system/user/user-list',
    icon: 'user',
    menuType: 'MENU',
    parentId: null,
    sortOrder: 0,
    visible: true,
    status: 'ACTIVE',
  },
};

const MENU_DTO = { id: 1, ...BASE_SAVE_EVENT.input };

describe('MenuFormPage', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [MenuFormPage],
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

    const fixture = TestBed.createComponent(MenuFormPage);
    const router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    return { fixture, router };
  }

  function flushAllMenus() {
    const req = httpMock.expectOne('/api/rbac/menus');
    req.flush({ code: '200', message: 'Success', data: [MENU_DTO] });
  }

  it('should be in create mode when no id is provided', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    flushAllMenus();

    expect(fixture.componentInstance.isEditMode()).toBe(false);
    expect(fixture.componentInstance.menu()).toBeNull();
  });

  it('should fetch and expose the matching menu when an id is provided', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    flushAllMenus();

    const req = httpMock.expectOne('/api/rbac/menus/1');
    req.flush({ code: '200', message: 'Success', data: MENU_DTO });
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.menu()?.name).toBe('Người dùng');
  });

  it('should create a new menu and navigate back when saving in create mode', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();
    flushAllMenus();

    fixture.componentInstance.onSave(BASE_SAVE_EVENT);

    const req = httpMock.expectOne('/api/rbac/menus');
    expect(req.request.method).toBe('POST');
    req.flush({ code: '200', message: 'Success', data: MENU_DTO });

    expect(router.navigate).toHaveBeenCalledWith(['/system/menus']);
    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should navigate back to the list on cancel', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();
    flushAllMenus();

    fixture.componentInstance.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/system/menus']);
  });
});
