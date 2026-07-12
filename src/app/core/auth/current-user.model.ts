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

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  readonly user: CurrentUser;
}
