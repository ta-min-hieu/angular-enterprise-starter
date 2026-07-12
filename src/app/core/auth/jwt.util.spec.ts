import { describe, expect, it } from 'vitest';
import { decodeJwtPayload } from './jwt.util';

function createFakeJwt(payload: Record<string, unknown>): string {
  const base64url = (value: string): string =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${base64url(JSON.stringify({ alg: 'RS512' }))}.${base64url(JSON.stringify(payload))}.signature`;
}

describe('decodeJwtPayload', () => {
  it('decodes the base64url-encoded payload segment of a JWT', () => {
    const token = createFakeJwt({ sub: 'testuser', roles: ['USER'] });

    expect(decodeJwtPayload(token)).toEqual({ sub: 'testuser', roles: ['USER'] });
  });

  it('handles payloads whose base64 length requires padding', () => {
    const token = createFakeJwt({ sub: 'a' });

    expect(decodeJwtPayload<{ sub: string }>(token).sub).toBe('a');
  });
});
