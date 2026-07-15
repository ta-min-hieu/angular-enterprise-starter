import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it, vi } from 'vitest';
import { RoleMenuAssign } from './role-menu-assign';
import { Menu } from '../../menus/menu.model';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const MENUS: Menu[] = [
  {
    id: '1',
    name: 'Hệ thống',
    path: '/system',
    component: '',
    icon: 'setting',
    menuType: 'DIRECTORY',
    parentId: null,
    sortOrder: 0,
    visible: true,
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Người dùng',
    path: '/system/users',
    component: '',
    icon: 'user',
    menuType: 'MENU',
    parentId: '1',
    sortOrder: 0,
    visible: true,
    status: 'ACTIVE',
  },
];

describe('RoleMenuAssign', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RoleMenuAssign],
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(RoleMenuAssign);
    fixture.componentRef.setInput('menus', MENUS);
    return fixture;
  }

  it('should build tree nodes from the flat menu list', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.treeNodes()).toHaveLength(1);
    expect(fixture.componentInstance.treeNodes()[0].children).toHaveLength(1);
  });

  it('should seed checked keys from assignedIds', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    expect(fixture.componentInstance.checkedKeys()).toEqual(['1']);
  });

  it('should update checked keys on change', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    fixture.componentInstance.onCheckedKeysChange(['1', '2']);

    expect(fixture.componentInstance.checkedKeys()).toEqual(['1', '2']);
  });

  it('should emit save with the currently checked menu ids', () => {
    const fixture = setup();
    fixture.componentRef.setInput('assignedIds', ['1']);
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({ menuIds: ['1'] });
  });
});
