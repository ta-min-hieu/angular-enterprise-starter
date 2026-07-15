import { CommonStatus } from '../common-status.model';

// Khớp enum MenuType phía backend — DIRECTORY không có route riêng (chỉ chứa menu con), MENU có
// route thật (path + component), BUTTON là hành động UI mịn hơn menu, không có route riêng.
export type MenuType = 'DIRECTORY' | 'MENU' | 'BUTTON';

export interface Menu {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  // Tên component phía Angular tương ứng route (vd "system/role/role-list") — chỉ có ý nghĩa khi
  // menuType = 'MENU'.
  readonly component: string;
  readonly icon: string;
  readonly menuType: MenuType;
  readonly parentId: string | null;
  readonly sortOrder: number;
  readonly visible: boolean;
  readonly status: CommonStatus;
}

export type MenuInput = Omit<Menu, 'id'>;

export interface MenuTreeNode extends Menu {
  readonly children: readonly MenuTreeNode[];
}
