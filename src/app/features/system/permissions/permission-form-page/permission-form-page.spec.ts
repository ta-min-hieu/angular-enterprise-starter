import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { describe, expect, it, vi } from 'vitest';
import { PermissionFormPage } from './permission-form-page';
import { PermissionFormSaveEvent } from '../permission-form/permission-form';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const BASE_SAVE_EVENT: PermissionFormSaveEvent = {
  input: {
    code: 'user.read',
    name: 'Xem người dùng',
    httpMethod: 'GET',
    urlPattern: '/v1/users/**',
    description: '',
    status: 'ACTIVE',
  },
};

const PERMISSION_DTO = { id: 1, ...BASE_SAVE_EVENT.input };

describe('PermissionFormPage', () => {
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      imports: [PermissionFormPage],
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

    const fixture = TestBed.createComponent(PermissionFormPage);
    const router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    return { fixture, router };
  }

  it('should be in create mode when no id is provided', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(false);
    expect(fixture.componentInstance.permission()).toBeNull();
  });

  it('should fetch and expose the matching permission when an id is provided', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/rbac/permissions/1');
    req.flush({ code: '200', message: 'Success', data: PERMISSION_DTO });
    fixture.detectChanges();

    expect(fixture.componentInstance.isEditMode()).toBe(true);
    expect(fixture.componentInstance.permission()?.code).toBe('user.read');
  });

  it('should redirect to the list when the id does not match any permission', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', 'does-not-exist');
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/rbac/permissions/does-not-exist');
    req.flush(
      { code: '404', message: 'Permission not found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(router.navigate).toHaveBeenCalledWith(['/system/permissions']);
  });

  it('should create a new permission and navigate back when saving in create mode', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.onSave(BASE_SAVE_EVENT);

    const req = httpMock.expectOne('/api/rbac/permissions');
    expect(req.request.method).toBe('POST');
    req.flush({ code: '200', message: 'Success', data: PERMISSION_DTO });

    expect(router.navigate).toHaveBeenCalledWith(['/system/permissions']);
    expect(fixture.componentInstance.saving()).toBe(false);
  });

  it('should update the existing permission and navigate back when saving in edit mode', () => {
    const { fixture, router } = setup();
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    httpMock
      .expectOne('/api/rbac/permissions/1')
      .flush({ code: '200', message: 'Success', data: PERMISSION_DTO });
    fixture.detectChanges();

    fixture.componentInstance.onSave(BASE_SAVE_EVENT);

    const req = httpMock.expectOne('/api/rbac/permissions/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ code: '200', message: 'Success', data: PERMISSION_DTO });

    expect(router.navigate).toHaveBeenCalledWith(['/system/permissions']);
  });

  it('should navigate back to the list on cancel', () => {
    const { fixture, router } = setup();
    fixture.detectChanges();

    fixture.componentInstance.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/system/permissions']);
  });
});
