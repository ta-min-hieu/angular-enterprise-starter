import { CommonStatus } from '../common-status.model';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | '*';

export interface Permission {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly httpMethod: HttpMethod;
  readonly urlPattern: string;
  readonly description: string;
  readonly status: CommonStatus;
}

export type PermissionInput = Omit<Permission, 'id'>;
