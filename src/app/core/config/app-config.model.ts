export interface AppConfig {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  readonly authRedirectPath: string;
  readonly forbiddenPath: string;
  readonly features: Readonly<Record<string, boolean>>;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  production: false,
  apiBaseUrl: '/api',
  logLevel: 'debug',
  authRedirectPath: '/auth/login',
  forbiddenPath: '/forbidden',
  features: {},
};
