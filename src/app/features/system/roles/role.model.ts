import { CommonStatus } from '../common-status.model';

// Khớp enum DataScope phía backend — hiện chỉ lưu giá trị, CHƯA có logic lọc dữ liệu theo scope
// (placeholder cho mở rộng Data Permission trong tương lai, xem javadoc DataScope.java).
export type DataScope = 'ALL' | 'SELF' | 'DEPT' | 'CUSTOM';

export interface Role {
  readonly id: string;
  // roleKey bất biến sau khi tạo — backend bỏ qua field này trên PUT (RoleController javadoc).
  readonly roleKey: string;
  readonly roleName: string;
  readonly description: string;
  readonly dataScope: DataScope;
  readonly status: CommonStatus;
  readonly sortOrder: number;
}

// Không gồm permissionIds/menuIds — RoleResponse phía backend không trả các field này; danh sách
// permission/menu đang gán cho role được lấy riêng qua RoleService.getPermissions()/getMenus()
// (GET roles/{id}/permissions|menus) và cập nhật riêng qua updatePermissions()/updateMenus()
// (PUT roles/{id}/permissions|menus).
export type RoleInput = Omit<Role, 'id'>;
