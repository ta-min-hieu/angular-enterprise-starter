export interface AppConfig {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  // Domain API bổ sung ngoài apiBaseUrl (mặc định) — vd. { payment: "https://payment.example.com/v1" }.
  // Gọi qua ApiService bằng options.apiName; không truyền thì luôn dùng apiBaseUrl.
  readonly apiBaseUrls?: Readonly<Record<string, string>>;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  readonly authRedirectPath: string;
  readonly forbiddenPath: string;
  readonly features: Readonly<Record<string, boolean>>;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  production: false,
  apiBaseUrl: '/api',
  apiBaseUrls: {},
  logLevel: 'debug',
  authRedirectPath: '/auth/login',
  forbiddenPath: '/forbidden',
  features: {},
};
