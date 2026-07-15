import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { UserForm } from './user-form';
import { Role } from '../../roles/role.model';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const ROLES: Role[] = [
  {
    id: '1',
    roleKey: 'ADMIN',
    roleName: 'Quản trị viên',
    description: '',
    dataScope: 'ALL',
    status: 'ACTIVE',
    sortOrder: 0,
  },
];

describe('UserForm', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });
    return TestBed.createComponent(UserForm);
  }

  it('should default to an empty form and require a password in create mode', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      username: '',
      password: '',
      enabled: true,
      roleIds: [],
    });
    expect(fixture.componentInstance.form.controls.username.disabled).toBe(false);

    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.form.controls.password.errors).toBeTruthy();
  });

  it('should disable username and not require a password when editing an existing user', () => {
    const fixture = setup();
    fixture.componentRef.setInput('user', {
      id: '1',
      username: 'qa_kc_admin',
      enabled: true,
      roles: [ROLES[0]],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.username.disabled).toBe(true);
    expect(fixture.componentInstance.form.controls.password.errors).toBeNull();
    expect(fixture.componentInstance.form.controls.roleIds.value).toEqual(['1']);
    expect(fixture.componentInstance.isEditMode()).toBe(true);
  });

  it('should enforce a minimum password length of 6 when a password is provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('user', { id: '1', username: 'qa', enabled: true, roles: [] });
    fixture.detectChanges();

    fixture.componentInstance.form.controls.password.setValue('abc');
    expect(fixture.componentInstance.form.controls.password.errors).toBeTruthy();
  });

  it('should map roles to non-translated select options', () => {
    const fixture = setup();
    fixture.componentRef.setInput('roles', ROLES);
    fixture.detectChanges();

    expect(fixture.componentInstance.roleOptions()).toEqual([
      { label: 'Quản trị viên', value: '1' },
    ]);
  });

  it('should not emit save when the form is invalid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).not.toHaveBeenCalled();
  });

  it('should emit save including the password when creating a user', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);
    fixture.componentInstance.form.setValue({
      username: 'qa_kc_admin',
      password: 'secret1',
      enabled: true,
      roleIds: ['1'],
    });

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      username: 'qa_kc_admin',
      password: 'secret1',
      enabled: true,
      roleIds: ['1'],
    });
  });

  it('should emit save without a password when editing and leaving it blank', () => {
    const fixture = setup();
    fixture.componentRef.setInput('user', {
      id: '1',
      username: 'qa_kc_admin',
      enabled: true,
      roles: [],
    });
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      username: 'qa_kc_admin',
      password: undefined,
      enabled: true,
      roleIds: [],
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
