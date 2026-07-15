import { describe, expect, it } from 'vitest';
import {
  buildMenuTree,
  flattenMenuDtoTree,
  toMenu,
  toMenuPayload,
  toTreeNodeOptions,
} from './menu.mapper';
import { Menu, MenuInput } from './menu.model';
import { MenuDto } from './menu-api.model';

const DTO: MenuDto = {
  id: 2,
  parentId: 1,
  name: 'Người dùng',
  path: '/system/users',
  component: 'system/user/user-list',
  icon: 'user',
  menuType: 'MENU',
  sortOrder: 1,
  visible: true,
  status: 'ACTIVE',
};

describe('menu.mapper', () => {
  it('maps a backend DTO to the frontend Menu model', () => {
    expect(toMenu(DTO)).toEqual({
      id: '2',
      name: 'Người dùng',
      path: '/system/users',
      component: 'system/user/user-list',
      icon: 'user',
      menuType: 'MENU',
      parentId: '1',
      sortOrder: 1,
      visible: true,
      status: 'ACTIVE',
    });
  });

  it('maps nullable fields to safe defaults', () => {
    const menu = toMenu({
      ...DTO,
      component: null,
      icon: null,
      parentId: null,
      sortOrder: null,
      visible: null,
    });

    expect(menu.component).toBe('');
    expect(menu.icon).toBe('');
    expect(menu.parentId).toBeNull();
    expect(menu.sortOrder).toBe(0);
    expect(menu.visible).toBe(true);
  });

  it('maps a MenuInput back to the backend payload shape', () => {
    const input: MenuInput = {
      name: 'Người dùng',
      path: '/system/users',
      component: 'system/user/user-list',
      icon: 'user',
      menuType: 'MENU',
      parentId: '1',
      sortOrder: 1,
      visible: true,
      status: 'ACTIVE',
    };

    expect(toMenuPayload(input)).toEqual({ ...input, parentId: 1 });
  });

  it('maps a null parentId on MenuInput to null in the payload', () => {
    const payload = toMenuPayload({
      name: 'Hệ thống',
      path: '/system',
      component: '',
      icon: 'setting',
      menuType: 'DIRECTORY',
      parentId: null,
      sortOrder: 0,
      visible: true,
      status: 'ACTIVE',
    });

    expect(payload.parentId).toBeNull();
  });

  describe('flattenMenuDtoTree', () => {
    it('returns an empty list for an empty tree', () => {
      expect(flattenMenuDtoTree([])).toEqual([]);
    });

    it('flattens a nested tree (as returned by GET /v1/rbac/menus) into a flat list', () => {
      const tree: MenuDto[] = [
        {
          ...DTO,
          id: 1,
          parentId: null,
          name: 'Hệ thống',
          children: [
            {
              ...DTO,
              id: 2,
              parentId: 1,
              children: [{ ...DTO, id: 3, parentId: 2, children: [] }],
            },
          ],
        },
      ];

      const flat = flattenMenuDtoTree(tree);

      expect(flat.map((node) => node.id)).toEqual([1, 2, 3]);
    });
  });

  describe('buildMenuTree', () => {
    it('returns an empty tree for an empty list', () => {
      expect(buildMenuTree([])).toEqual([]);
    });

    it('nests children under their parent and sorts each level by sortOrder', () => {
      const base = {
        path: '/',
        component: '',
        icon: '',
        menuType: 'MENU' as const,
        visible: true,
        status: 'ACTIVE' as const,
      };
      const menus: Menu[] = [
        { ...base, id: '1', name: 'Root', parentId: null, sortOrder: 0 },
        { ...base, id: '3', name: 'Second child', parentId: '1', sortOrder: 2 },
        { ...base, id: '2', name: 'First child', parentId: '1', sortOrder: 1 },
      ];

      const tree = buildMenuTree(menus);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('1');
      expect(tree[0].children.map((child) => child.id)).toEqual(['2', '3']);
    });

    it('treats a menu with an orphaned parentId (parent not in list) as a root node', () => {
      const menus: Menu[] = [
        {
          id: '5',
          name: 'Orphan',
          path: '/orphan',
          component: '',
          icon: '',
          menuType: 'MENU',
          parentId: '999',
          sortOrder: 0,
          visible: true,
          status: 'ACTIVE',
        },
      ];

      const tree = buildMenuTree(menus);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('5');
    });

    it('supports 3+ levels of nesting', () => {
      const base = {
        path: '/',
        component: '',
        icon: '',
        menuType: 'MENU' as const,
        visible: true,
        status: 'ACTIVE' as const,
        sortOrder: 0,
      };
      const menus: Menu[] = [
        { ...base, id: '1', name: 'L1', parentId: null },
        { ...base, id: '2', name: 'L2', parentId: '1' },
        { ...base, id: '3', name: 'L3', parentId: '2' },
      ];

      const tree = buildMenuTree(menus);

      expect(tree[0].children[0].children[0].id).toBe('3');
    });
  });

  describe('toTreeNodeOptions', () => {
    it('converts MenuTreeNode[] to nz-tree node options', () => {
      const tree = buildMenuTree([
        {
          id: '1',
          name: 'Root',
          path: '/',
          component: '',
          icon: 'home',
          menuType: 'DIRECTORY',
          parentId: null,
          sortOrder: 0,
          visible: true,
          status: 'ACTIVE',
        },
      ]);

      expect(toTreeNodeOptions(tree)).toEqual([
        { title: 'Root', key: '1', icon: 'home', isLeaf: true, children: [] },
      ]);
    });
  });
});
