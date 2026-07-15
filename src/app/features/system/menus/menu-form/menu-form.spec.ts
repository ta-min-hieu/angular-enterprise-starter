import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { describe, expect, it, vi } from 'vitest';
import { MenuForm } from './menu-form';
import { Menu } from '../menu.model';
import { REGISTERED_ICONS } from '../../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../../core/i18n/testing/provide-transloco-testing';

const BASE: Omit<Menu, 'id' | 'name' | 'path' | 'parentId'> = {
  component: '',
  icon: '',
  menuType: 'MENU',
  sortOrder: 0,
  visible: true,
  status: 'ACTIVE',
};

const ALL_MENUS: Menu[] = [
  { ...BASE, id: '1', name: 'Hệ thống', path: '/system', icon: 'setting', parentId: null },
  { ...BASE, id: '2', name: 'Người dùng', path: '/system/users', icon: 'user', parentId: '1' },
  { ...BASE, id: '3', name: 'Con của Người dùng', path: '/system/users/x', parentId: '2' },
];

const EMPTY_FORM_VALUE = {
  name: '',
  path: '',
  component: '',
  icon: '',
  menuType: 'MENU',
  parentId: null,
  sortOrder: 0,
  visible: true,
  status: 'ACTIVE',
};

describe('MenuForm', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [MenuForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });
    return TestBed.createComponent(MenuForm);
  }

  it('should default to an empty form when no menu is provided', () => {
    const fixture = setup();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual(EMPTY_FORM_VALUE);
  });

  it('should default parentId to the provided defaultParentId in create mode', () => {
    const fixture = setup();
    fixture.componentRef.setInput('defaultParentId', '1');
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.parentId.value).toBe('1');
  });

  it('should patch the form when editing an existing menu', () => {
    const fixture = setup();
    fixture.componentRef.setInput('menu', ALL_MENUS[1]);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      name: 'Người dùng',
      path: '/system/users',
      component: '',
      icon: 'user',
      menuType: 'MENU',
      parentId: '1',
      sortOrder: 0,
      visible: true,
      status: 'ACTIVE',
    });
  });

  it('should exclude the menu being edited and its descendants from the parent picker', () => {
    const fixture = setup();
    fixture.componentRef.setInput('allMenus', ALL_MENUS);
    fixture.componentRef.setInput('menu', ALL_MENUS[1]);
    fixture.detectChanges();

    const keys = JSON.stringify(fixture.componentInstance.parentTreeNodes());
    expect(keys).not.toContain('"key":"2"');
    expect(keys).not.toContain('"key":"3"');
    expect(keys).toContain('"key":"1"');
  });

  it('should not emit save when the form is invalid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);

    fixture.componentInstance.onSubmit();

    expect(onSave).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.get('name')?.touched).toBe(true);
  });

  it('should emit save with the menu input when the form is valid', () => {
    const fixture = setup();
    fixture.detectChanges();

    const onSave = vi.fn();
    fixture.componentInstance.save.subscribe(onSave);
    fixture.componentInstance.form.setValue({
      name: 'Người dùng',
      path: '/system/users',
      component: 'system/user/user-list',
      icon: 'user',
      menuType: 'MENU',
      parentId: '1',
      sortOrder: 0,
      visible: true,
      status: 'ACTIVE',
    });

    fixture.componentInstance.onSubmit();

    expect(onSave).toHaveBeenCalledWith({
      input: {
        name: 'Người dùng',
        path: '/system/users',
        component: 'system/user/user-list',
        icon: 'user',
        menuType: 'MENU',
        parentId: '1',
        sortOrder: 0,
        visible: true,
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
