export function decodeJwtPayload<T>(token: string): T {
  const payload = token.split('.')[1] ?? '';
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  return JSON.parse(atob(padded)) as T;
}
