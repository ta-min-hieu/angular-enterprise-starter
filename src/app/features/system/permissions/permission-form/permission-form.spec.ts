import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { PermissionForm } from './permission-form';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const EMPTY_FORM_VALUE = {
  code: '',
  name: '',
  httpMethod: 'GET',
  urlPattern: '',
  description: '',
  status: 'ACTIVE',
};

describe('PermissionForm', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [PermissionForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });
    return TestBed.createComponent(PermissionForm);
  }

  it('should default to an empty form when no permission is provided', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(EMPTY_FORM_VALUE);
  });

  it('should patch the form when editing an existing permission', () => {
    const fixture = setup();
    fixture.componentRef.setInput('permission', {
      id: '1',
      code: 'user.read',
      name: 'Xem người dùng',
      httpMethod: 'GET',
      urlPattern: '/v1/users/**',
      description: 'Xem danh sách',
      status: 'ACTIVE',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      code: 'user.read',
      name: 'Xem người dùng',
      httpMethod: 'GET',
      urlPattern: '/v1/users/**',
      description: 'Xem danh sách',
      status: 'ACTIVE',
    });
  });

  it('should not emit save when the form is invalid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.get('code')?.touched).toBe(true);
  });

  it('should emit save with the permission input when the form is valid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);
    fixture.componentInstance.form.setValue({
      code: 'user.read',
      name: 'Xem người dùng',
      httpMethod: 'GET',
      urlPattern: '/v1/users/**',
      description: '',
      status: 'ACTIVE',
    });

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      input: {
        code: 'user.read',
        name: 'Xem người dùng',
        httpMethod: 'GET',
        urlPattern: '/v1/users/**',
        description: '',
        status: 'ACTIVE',
      },
    });
  });

  it('should emit cancelled when cancel is triggered', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onCancel = vi.fn();
    fixture.componentInstance.cancelled.subscribe(onCancel);

    fixture.componentInstance.onCancel();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
