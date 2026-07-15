import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it, vi } from 'vitest';
import { RolePermissionAssign } from './role-permission-assign';
import { Permission } from '../../permissions/permission.model';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const PERMISSIONS: Permission[] = [
  {
    id: '1',
    code: 'user.read',
    name: 'Xem người dùng',
    httpMethod: 'GET',
    urlPattern: '/v1/users/**',
    description: '',
    status: 'ACTIVE',
  },
  {
    id: '2',
    code: 'user.write',
    name: 'Sửa người dùng',
    httpMethod: 'PUT',
    urlPattern: '/v1/users/*',
    description: '',
    status: 'ACTIVE',
  },
];

describe('RolePermissionAssign', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RolePermissionAssign],
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(RolePermissionAssign);
    fixture.componentRef.setInput('permissions', PERMISSIONS);
    return fixture;
  }

  it('should seed checked ids from assignedIds', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    expect(fixture.componentInstance.isChecked('1')).toBe(true);
    expect(fixture.componentInstance.isChecked('2')).toBe(false);
  });

  it('should re-seed checked ids when assignedIds changes', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    fixture.componentRef.setInput('assignedIds', ['2']);
    fixture.detectChanges();

    expect(fixture.componentInstance.isChecked('1')).toBe(false);
    expect(fixture.componentInstance.isChecked('2')).toBe(true);
  });

  it('should toggle a single permission', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    fixture.componentInstance.onToggle('2', true);

    expect(fixture.componentInstance.isChecked('2')).toBe(true);
  });

  it('should emit save with the currently checked permission ids', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({ permissionIds: ['1'] });
  });
});
