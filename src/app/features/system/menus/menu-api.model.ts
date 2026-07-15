import { CommonStatus } from '../common-status.model';
import { MenuType } from './menu.model';

// Khớp MenuResponse phía backend (GET /v1/rbac/menus, /v1/rbac/menus/{id}) — GET /v1/rbac/menus trả
// về CÂY LỒNG NHAU (children được backend dựng sẵn qua MenuResponse.buildTree()), không phải danh
// sách phẳng. Mỗi node (kể cả node con) vẫn giữ parentId của chính nó — xem
// menu.mapper.ts#flattenMenuDtoTree() để làm phẳng lại, tái dùng buildMenuTree() ở client.
export interface MenuDto {
  readonly id: number;
  readonly parentId: number | null;
  readonly name: string;
  readonly path: string;
  readonly component: string | null;
  readonly icon: string | null;
  readonly menuType: MenuType;
  readonly sortOrder: number | null;
  readonly visible: boolean | null;
  readonly status: CommonStatus;
  readonly children?: readonly MenuDto[];
}

// Khớp MenuRequest phía backend — payload JSON tạo/sửa menu node.
export interface MenuPayloadDto {
  readonly parentId: number | null;
  readonly name: string;
  readonly path: string;
  readonly component: string;
  readonly icon: string;
  readonly menuType: MenuType;
  readonly sortOrder: number;
  readonly visible: boolean;
  readonly status: CommonStatus;
}
