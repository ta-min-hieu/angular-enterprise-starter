import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Menu, MenuInput, MenuTreeNode } from './menu.model';
import { MenuDto, MenuPayloadDto } from './menu-api.model';

export function toMenu(dto: MenuDto): Menu {
  return {
    id: String(dto.id),
    name: dto.name,
    path: dto.path,
    component: dto.component ?? '',
    icon: dto.icon ?? '',
    menuType: dto.menuType,
    parentId: dto.parentId !== null ? String(dto.parentId) : null,
    sortOrder: dto.sortOrder ?? 0,
    visible: dto.visible ?? true,
    status: dto.status,
  };
}

export function toMenuPayload(input: MenuInput): MenuPayloadDto {
  return {
    parentId: input.parentId !== null ? Number(input.parentId) : null,
    name: input.name,
    path: input.path,
    component: input.component,
    icon: input.icon,
    menuType: input.menuType,
    sortOrder: input.sortOrder,
    visible: input.visible,
    status: input.status,
  };
}

// GET /v1/rbac/menus trả về cây lồng nhau sẵn (backend tự dựng qua buildTree()) — làm phẳng lại ở
// đây (mỗi node tự mang parentId của chính nó) để tái dùng buildMenuTree() dựng lại cây ở client
// (cần cho menu-form loại trừ hậu duệ, role-menu-assign, ...) mà không phải viết lại logic 2 lần.
export function flattenMenuDtoTree(dtos: readonly MenuDto[]): readonly MenuDto[] {
  const flat: MenuDto[] = [];

  function walk(nodes: readonly MenuDto[]): void {
    for (const node of nodes) {
      flat.push(node);
      if (node.children?.length) {
        walk(node.children);
      }
    }
  }

  walk(dtos);
  return flat;
}

// Dựng cây từ danh sách phẳng (parentId) — parentId trỏ tới id không tồn tại trong danh sách
// (mồ côi) được coi như node gốc thay vì bị loại bỏ hoặc throw. Mỗi cấp được sắp theo sortOrder.
export function buildMenuTree(flatList: readonly Menu[]): readonly MenuTreeNode[] {
  const ids = new Set(flatList.map((menu) => menu.id));
  const byParent = new Map<string | null, Menu[]>();

  for (const menu of flatList) {
    const parentKey = menu.parentId !== null && ids.has(menu.parentId) ? menu.parentId : null;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(menu);
    byParent.set(parentKey, siblings);
  }

  function build(parentKey: string | null): MenuTreeNode[] {
    const siblings = byParent.get(parentKey) ?? [];
    return [...siblings]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => ({ ...menu, children: build(menu.id) }));
  }

  return build(null);
}

// Chuyển MenuTreeNode[] sang shape nz-tree cần (dùng chung cho menus-page và menu-form).
export function toTreeNodeOptions(nodes: readonly MenuTreeNode[]): NzTreeNodeOptions[] {
  return nodes.map((node) => ({
    title: node.name,
    key: node.id,
    icon: node.icon || undefined,
    isLeaf: node.children.length === 0,
    children: toTreeNodeOptions(node.children),
  }));
}
