import { describe, expect, it } from 'vitest';
import { toCreateUserPayload, toUpdateUserPayload, toUser } from './user.mapper';
import { UserDto } from './user-api.model';
import { RoleDto } from '../roles/role-api.model';

const ROLE_DTO: RoleDto = {
  id: 1,
  roleKey: 'ADMIN',
  roleName: 'Quản trị viên',
  description: '',
  dataScope: 'ALL',
  status: 'ACTIVE',
  sortOrder: 0,
};

const DTO: UserDto = {
  id: 7,
  username: 'qa_kc_admin',
  enabled: true,
  roles: [ROLE_DTO],
};

describe('user.mapper', () => {
  it('maps a backend DTO to the frontend User model, mapping embedded roles via the Role mapper', () => {
    expect(toUser(DTO)).toEqual({
      id: '7',
      username: 'qa_kc_admin',
      enabled: true,
      roles: [
        {
          id: '1',
          roleKey: 'ADMIN',
          roleName: 'Quản trị viên',
          description: '',
          dataScope: 'ALL',
          status: 'ACTIVE',
          sortOrder: 0,
        },
      ],
    });
  });

  it('maps an empty roles array', () => {
    expect(toUser({ ...DTO, roles: [] }).roles).toEqual([]);
  });

  it('maps a CreateUserInput to the create payload shape', () => {
    expect(toCreateUserPayload({ username: 'qa', password: 'secret1', enabled: true })).toEqual({
      username: 'qa',
      password: 'secret1',
      enabled: true,
    });
  });

  it('includes password in the update payload only when provided', () => {
    expect(toUpdateUserPayload({ enabled: false, password: 'newpass1' })).toEqual({
      enabled: false,
      password: 'newpass1',
    });
    expect(toUpdateUserPayload({ enabled: true })).toEqual({ enabled: true });
  });
});
