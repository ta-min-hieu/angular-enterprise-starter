import { RoleDto } from '../roles/role-api.model';

// Khớp UserResponse phía backend (GET /v1/rbac/users, /v1/rbac/users/{id}) — roles luôn là mảng
// (rỗng nếu chưa gán), không null.
export interface UserDto {
  readonly id: number;
  readonly username: string;
  readonly enabled: boolean;
  readonly roles: readonly RoleDto[];
}

// Khớp CreateUserRequest phía backend — payload JSON tạo user (POST /v1/rbac/users). Không có
// roleIds — gán role sau, riêng, qua PUT /v1/rbac/users/{id}/roles.
export interface CreateUserPayloadDto {
  readonly username: string;
  readonly password: string;
  readonly enabled: boolean;
}

// Khớp UpdateUserRequest — payload JSON sửa user (PUT /v1/rbac/users/{id}). Không có username
// (bất biến) hay roleIds (gán riêng).
export interface UpdateUserPayloadDto {
  readonly enabled: boolean;
  readonly password?: string;
}
