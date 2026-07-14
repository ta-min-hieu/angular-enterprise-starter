export interface AppConfig {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  // Domain API bổ sung ngoài apiBaseUrl (mặc định) — vd. { payment: "https://payment.example.com/v1" }.
  // Gọi qua ApiService bằng options.apiName; không truyền thì luôn dùng apiBaseUrl.
  readonly apiBaseUrls?: Readonly<Record<string, string>>;
  // Origin dùng để ghép URL tuyệt đối từ path tương đối mà backend trả về cho file media
  // (vd MediaAsset.url = "/v1/files/8") — KHÔNG gồm "/v1" như apiBaseUrl, vì path trả về đã có sẵn.
  // Endpoint tải file yêu cầu Bearer token nên phải fetch qua ApiService.getBlob(), không gán
  // thẳng vào [src] — xem shared/directives/media-src.directive.ts.
  readonly mediaBaseUrl: string;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  readonly authRedirectPath: string;
  readonly forbiddenPath: string;
  readonly features: Readonly<Record<string, boolean>>;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  production: false,
  apiBaseUrl: '/api',
  apiBaseUrls: {},
  mediaBaseUrl: '',
  logLevel: 'debug',
  authRedirectPath: '/auth/login',
  forbiddenPath: '/forbidden',
  features: {},
};
