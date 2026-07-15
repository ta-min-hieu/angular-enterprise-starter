import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { describe, expect, it, vi } from 'vitest';
import { UserFormPage } from './user-form-page';
import { UserFormSaveEvent } from '../user-form/user-form';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const BASE_SAVE_EVENT: UserFormSaveEvent = {
  username: 'qa_kc_admin',
  password: 'secret1',
  enabled: true,
  roleIds: ['1'],
};

const USER_DTO = { id: 1, username: 'qa_kc_admin', enabled: true, roles: [] };

describe('UserFormPage', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [UserFormPage],
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

    const fixture = TestBed.createComponent(UserFormPage);
    const router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    return { fixture, router };
  }

  function flushRoles() {
    const req = httpMock.expectOne('/api/rbac/roles');
    req.flush({ code: '200', message: 'Success', data: [] });
  }

  it('should be in create mode when no id is provided', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    flushRoles();

    expect(fixture.componentInstance.isEditMode()).toBe(false);
    expect(fixture.componentInstance.user()).toBeNull();
  });

  it('should fetch and expose the matching user when an id is provided', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    flushRoles();

    const req = httpMock.expectOne('/api/rbac/users/1');
    req.flush({ code: '200', message: 'Success', data: USER_DTO });
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.user()?.username).toBe('qa_kc_admin');
  });

  it('should create a user then assign its roles, navigating back on success', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();
    flushRoles();

    fixture.componentInstance.onSave(BASE_SAVE_EVENT);

    const createReq = httpMock.expectOne('/api/rbac/users');
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({
      username: 'qa_kc_admin',
      password: 'secret1',
      enabled: true,
    });
    createReq.flush({ code: '200', message: 'Success', data: USER_DTO });

    const rolesReq = httpMock.expectOne('/api/rbac/users/1/roles');
    expect(rolesReq.request.method).toBe('PUT');
    expect(rolesReq.request.body).toEqual({ roleIds: [1] });
    rolesReq.flush({ code: '200', message: 'Success' });

    expect(router.navigate).toHaveBeenCalledWith(['/system/users']);
    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should update the existing user then assign its roles', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    flushRoles();
    httpMock
      .expectOne('/api/rbac/users/1')
      .flush({ code: '200', message: 'Success', data: USER_DTO });
    fixture.detectChanges();

    fixture.componentInstance.onSave({ ...BASE_SAVE_EVENT, password: undefined });

    const updateReq = httpMock.expectOne('/api/rbac/users/1');
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual({ enabled: true });
    updateReq.flush({ code: '200', message: 'Success', data: USER_DTO });

    const rolesReq = httpMock.expectOne('/api/rbac/users/1/roles');
    rolesReq.flush({ code: '200', message: 'Success' });

    expect(router.navigate).toHaveBeenCalledWith(['/system/users']);
  });

  it('should show an error notification and stop saving when the save request fails', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    flushRoles();

    fixture.componentInstance.onSave(BASE_SAVE_EVENT);

    httpMock
      .expectOne('/api/rbac/users')
      .flush({ code: '500', message: 'Server error' }, { status: 500, statusText: 'Error' });

    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should redirect to the list when the id does not match any user', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', 'does-not-exist');
    fixture.detectChanges();
    flushRoles();

    const req = httpMock.expectOne('/api/rbac/users/does-not-exist');
    req.flush({ code: '404', message: 'User not found' }, { status: 404, statusText: 'Not Found' });

    expect(router.navigate).toHaveBeenCalledWith(['/system/users']);
  });

  it('should navigate back to the list on cancel', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();
    flushRoles();

    fixture.componentInstance.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/system/users']);
  });
});
