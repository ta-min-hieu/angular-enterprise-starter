import { CurrentUser } from './current-user.model';

// Payload JWT do Keycloak cấp (POST /v2/auth/login) — backend truyền thẳng token gốc của Keycloak,
// KHÔNG re-sign/rewrite claim (xem KeycloakAuthServiceImpl phía backend). Hoàn toàn khác payload
// phẳng {sub, roles} của token v1 tự ký (xem legacy/auth.service.v1.ts.bak).
export interface KeycloakAccessTokenPayload {
  readonly sub: string;
  readonly preferred_username?: string;
  readonly email?: string;
  readonly realm_access?: {
    readonly roles?: readonly string[];
  };
  readonly exp?: number;
  readonly iat?: number;
}

// permissions luôn để rỗng ở đây — AuthService populate riêng sau khi gọi GET /v1/rbac/me/permissions
// (token Keycloak không tự mang permission, chỉ có role ở realm_access.roles).
export function toCurrentUser(payload: KeycloakAccessTokenPayload): CurrentUser {
  return {
    id: payload.sub,
    username: payload.preferred_username ?? payload.sub,
    roles: payload.realm_access?.roles ?? [],
    permissions: [],
  };
}
