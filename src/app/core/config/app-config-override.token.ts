import { InjectionToken } from '@angular/core';
import { AppConfig } from './app-config.model';

/**
 * Cho phép bootstrap phía server (app.config.server.ts) nạp config.json trực tiếp
 * qua filesystem và tiêm thẳng vào AppConfigService, tránh việc SSR tự gọi HTTP
 * ngược lại chính nó (dễ vỡ khi có Reverse Proxy đổi Host/Port).
 */
export const APP_CONFIG_OVERRIDE = new InjectionToken<AppConfig>('APP_CONFIG_OVERRIDE');
