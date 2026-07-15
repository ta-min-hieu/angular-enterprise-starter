import { Role, RoleInput } from './role.model';
import { RoleDto, RolePayloadDto } from './role-api.model';

export function toRole(dto: RoleDto): Role {
  return {
    id: String(dto.id),
    roleKey: dto.roleKey,
    roleName: dto.roleName,
    description: dto.description ?? '',
    dataScope: dto.dataScope,
    status: dto.status,
    sortOrder: dto.sortOrder ?? 0,
  };
}

export function toRolePayload(input: RoleInput): RolePayloadDto {
  return {
    roleKey: input.roleKey,
    roleName: input.roleName,
    description: input.description,
    dataScope: input.dataScope,
    status: input.status,
    sortOrder: input.sortOrder,
  };
}
