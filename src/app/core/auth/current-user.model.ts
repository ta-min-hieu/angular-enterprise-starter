export interface CurrentUser {
  readonly id: string;
  readonly username: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: CurrentUser;
}
