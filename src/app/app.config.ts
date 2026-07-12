import {
  ApplicationConfig,
  ErrorHandler,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './routes/app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { nzConfig } from './core/theme/nz-config.token';
import { REGISTERED_ICONS } from './core/icons/icon-registration';
import { initializeAppConfig } from './core/config/app-config.initializer';
import { authInterceptor } from './core/http/auth.interceptor';
import { correlationIdInterceptor } from './core/http/correlation-id.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { GlobalErrorHandler } from './core/error/global-error-handler';
import { LOG_SINKS } from './core/logger/log-sink';
import { ConsoleLogSink } from './core/logger/console-log-sink';
import { TOKEN_STORAGE } from './core/storage/token-storage';
import { LocalTokenStorage } from './core/storage/local-token-storage';
import { NAV_MENU_ITEMS } from './core/navigation/nav-menu-items.token';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([correlationIdInterceptor, authInterceptor, errorInterceptor]),
    ),
    provideNzI18n(en_US),
    provideNzConfig(nzConfig),
    provideNzIcons(REGISTERED_ICONS),
    provideAppInitializer(initializeAppConfig),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: LOG_SINKS, useClass: ConsoleLogSink, multi: true },
    { provide: TOKEN_STORAGE, useClass: LocalTokenStorage },
    {
      provide: NAV_MENU_ITEMS,
      multi: true,
      useValue: [{ label: 'Sản phẩm', route: '/products', icon: 'shopping' }],
    },
  ],
};
