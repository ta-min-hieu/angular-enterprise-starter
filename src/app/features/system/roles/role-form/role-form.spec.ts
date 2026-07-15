import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { RoleForm } from './role-form';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const EMPTY_FORM_VALUE = {
  roleKey: '',
  roleName: '',
  description: '',
  dataScope: 'ALL',
  status: 'ACTIVE',
  sortOrder: 0,
};

describe('RoleForm', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RoleForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });
    return TestBed.createComponent(RoleForm);
  }

  it('should default to an empty form when no role is provided', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(EMPTY_FORM_VALUE);
    expect(fixture.componentInstance.form.controls.roleKey.disabled).toBe(false);
  });

  it('should patch the form and disable roleKey when editing an existing role', () => {
    const fixture = setup();
    fixture.componentRef.setInput('role', {
      id: '1',
      roleKey: 'ADMIN',
      roleName: 'Quản trị viên',
      description: 'Toàn quyền',
      dataScope: 'ALL',
      status: 'ACTIVE',
      sortOrder: 1,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      roleKey: 'ADMIN',
      roleName: 'Quản trị viên',
      description: 'Toàn quyền',
      dataScope: 'ALL',
      status: 'ACTIVE',
      sortOrder: 1,
    });
    expect(fixture.componentInstance.form.controls.roleKey.disabled).toBe(true);
  });

  it('should not emit save when the form is invalid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.get('roleKey')?.touched).toBe(true);
  });

  it('should emit save with the role input (including a disabled roleKey via getRawValue) when valid', () => {
    const fixture = setup();
    fixture.componentRef.setInput('role', {
      id: '1',
      roleKey: 'ADMIN',
      roleName: 'Quản trị viên',
      description: '',
      dataScope: 'ALL',
      status: 'ACTIVE',
      sortOrder: 0,
    });
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);
    fixture.componentInstance.form.controls.roleName.setValue('Đã đổi');

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      input: {
        roleKey: 'ADMIN',
        roleName: 'Đã đổi',
        description: '',
        dataScope: 'ALL',
        status: 'ACTIVE',
        sortOrder: 0,
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
