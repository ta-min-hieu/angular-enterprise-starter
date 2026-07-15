import { CommonStatus } from '../common-status.model';
import { DataScope } from './role.model';

// Khớp RoleResponse phía backend (GET /v1/rbac/roles, /v1/rbac/roles/{id}).
export interface RoleDto {
  readonly id: number;
  readonly roleKey: string;
  readonly roleName: string;
  readonly description: string | null;
  readonly dataScope: DataScope;
  readonly status: CommonStatus;
  readonly sortOrder: number | null;
}

// Khớp RoleRequest phía backend — payload JSON tạo/sửa role. roleKey bị bỏ qua trên PUT (server-side)
// nhưng vẫn bắt buộc gửi vì @NotBlank áp dụng chung cho cả create/update.
export interface RolePayloadDto {
  readonly roleKey: string;
  readonly roleName: string;
  readonly description: string;
  readonly dataScope: DataScope;
  readonly status: CommonStatus;
  readonly sortOrder: number;
}
