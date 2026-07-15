import { describe, expect, it } from 'vitest';
import { toPermission, toPermissionPayload } from './permission.mapper';
import { PermissionDto } from './permission-api.model';
import { PermissionInput } from './permission.model';

const DTO: PermissionDto = {
  id: 5,
  code: 'user.read',
  name: 'Xem người dùng',
  httpMethod: 'GET',
  urlPattern: '/v1/users/**',
  description: 'Xem danh sách người dùng',
  status: 'ACTIVE',
};

describe('permission.mapper', () => {
  it('maps a backend DTO to the frontend Permission model', () => {
    expect(toPermission(DTO)).toEqual({
      id: '5',
      code: 'user.read',
      name: 'Xem người dùng',
      httpMethod: 'GET',
      urlPattern: '/v1/users/**',
      description: 'Xem danh sách người dùng',
      status: 'ACTIVE',
    });
  });

  it('maps a null description to an empty string', () => {
    expect(toPermission({ ...DTO, description: null }).description).toBe('');
  });

  it('maps a PermissionInput back to the backend payload shape', () => {
    const input: PermissionInput = {
      code: 'user.write',
      name: 'Sửa người dùng',
      httpMethod: 'PUT',
      urlPattern: '/v1/users/*',
      description: '',
      status: 'ACTIVE',
    };

    expect(toPermissionPayload(input)).toEqual(input);
  });
});
