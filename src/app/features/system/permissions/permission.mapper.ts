import { Permission, PermissionInput } from './permission.model';
import { PermissionDto, PermissionPayloadDto } from './permission-api.model';

export function toPermission(dto: PermissionDto): Permission {
  return {
    id: String(dto.id),
    code: dto.code,
    name: dto.name,
    httpMethod: dto.httpMethod,
    urlPattern: dto.urlPattern,
    description: dto.description ?? '',
    status: dto.status,
  };
}

export function toPermissionPayload(input: PermissionInput): PermissionPayloadDto {
  return {
    code: input.code,
    name: input.name,
    httpMethod: input.httpMethod,
    urlPattern: input.urlPattern,
    description: input.description,
    status: input.status,
  };
}
