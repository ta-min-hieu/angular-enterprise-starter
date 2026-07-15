import { describe, expect, it } from 'vitest';
import { toRole, toRolePayload } from './role.mapper';
import { RoleDto } from './role-api.model';
import { RoleInput } from './role.model';

const DTO: RoleDto = {
  id: 1,
  roleKey: 'ADMIN',
  roleName: 'Quản trị viên',
  description: 'Toàn quyền hệ thống',
  dataScope: 'ALL',
  status: 'ACTIVE',
  sortOrder: 1,
};

describe('role.mapper', () => {
  it('maps a backend DTO to the frontend Role model', () => {
    expect(toRole(DTO)).toEqual({
      id: '1',
      roleKey: 'ADMIN',
      roleName: 'Quản trị viên',
      description: 'Toàn quyền hệ thống',
      dataScope: 'ALL',
      status: 'ACTIVE',
      sortOrder: 1,
    });
  });

  it('maps nullable fields to safe defaults', () => {
    const role = toRole({ ...DTO, description: null, sortOrder: null });

    expect(role.description).toBe('');
    expect(role.sortOrder).toBe(0);
  });

  it('maps a RoleInput back to the backend payload shape', () => {
    const input: RoleInput = {
      roleKey: 'ADMIN',
      roleName: 'Quản trị viên',
      description: 'desc',
      dataScope: 'ALL',
      status: 'ACTIVE',
      sortOrder: 1,
    };

    expect(toRolePayload(input)).toEqual(input);
  });
});
