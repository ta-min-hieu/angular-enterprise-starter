import { describe, expect, it } from 'vitest';
import { toCurrentUser } from './keycloak-token.util';

describe('keycloak-token.util', () => {
  it('maps a Keycloak access token payload to CurrentUser', () => {
    const user = toCurrentUser({
      sub: 'a1b2c3',
      preferred_username: 'qa_admin',
      email: 'qa_admin@example.com',
      realm_access: { roles: ['ADMIN'] },
      exp: 123,
      iat: 100,
    });

    expect(user).toEqual({
      id: 'a1b2c3',
      username: 'qa_admin',
      roles: ['ADMIN'],
      permissions: [],
    });
  });

  it('falls back to sub as username when preferred_username is absent', () => {
    const user = toCurrentUser({ sub: 'a1b2c3' });

    expect(user.username).toBe('a1b2c3');
  });

  it('defaults roles to an empty array when realm_access is absent', () => {
    const user = toCurrentUser({ sub: 'a1b2c3' });

    expect(user.roles).toEqual([]);
  });
});
