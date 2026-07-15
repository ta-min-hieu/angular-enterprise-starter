import { CommonStatus } from '../common-status.model';
import { HttpMethod } from './permission.model';

// Khớp PermissionResponse phía backend (GET /v1/rbac/permissions, /v1/rbac/permissions/{id}).
export interface PermissionDto {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly httpMethod: HttpMethod;
  readonly urlPattern: string;
  readonly description: string | null;
  readonly status: CommonStatus;
}

// Khớp PermissionRequest phía backend — payload JSON tạo/sửa permission.
export interface PermissionPayloadDto {
  readonly code: string;
  readonly name: string;
  readonly httpMethod: HttpMethod;
  readonly urlPattern: string;
  readonly description: string;
  readonly status: CommonStatus;
}
