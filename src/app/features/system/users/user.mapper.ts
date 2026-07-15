import { toRole } from '../roles/role.mapper';
import { CreateUserInput, UpdateUserInput, User } from './user.model';
import { CreateUserPayloadDto, UpdateUserPayloadDto, UserDto } from './user-api.model';

export function toUser(dto: UserDto): User {
  return {
    id: String(dto.id),
    username: dto.username,
    enabled: dto.enabled,
    roles: dto.roles.map(toRole),
  };
}

export function toCreateUserPayload(input: CreateUserInput): CreateUserPayloadDto {
  return {
    username: input.username,
    password: input.password,
    enabled: input.enabled,
  };
}

export function toUpdateUserPayload(input: UpdateUserInput): UpdateUserPayloadDto {
  return input.password
    ? { enabled: input.enabled, password: input.password }
    : { enabled: input.enabled };
}
