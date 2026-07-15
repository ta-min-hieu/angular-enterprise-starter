import { Role } from '../roles/role.model';

export interface User {
  readonly id: string;
  // username bất biến sau khi tạo — backend không có field này trên UpdateUserRequest.
  readonly username: string;
  readonly enabled: boolean;
  // Role đầy đủ (không chỉ id) — UserResponse trả kèm sẵn, tái dùng luôn thay vì phải cross-reference
  // qua RoleService riêng.
  readonly roles: readonly Role[];
}

export interface CreateUserInput {
  readonly username: string;
  readonly password: string;
  readonly enabled: boolean;
}

// password: để trống/undefined = giữ nguyên mật khẩu cũ.
export interface UpdateUserInput {
  readonly enabled: boolean;
  readonly password?: string;
}
