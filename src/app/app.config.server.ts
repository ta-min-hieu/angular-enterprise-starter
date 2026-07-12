import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appConfig } from './app.config';
import { serverRoutes } from './routes/app.routes.server';
import { APP_CONFIG_OVERRIDE } from './core/config/app-config-override.token';
import { AppConfig, DEFAULT_APP_CONFIG } from './core/config/app-config.model';

function readRuntimeConfig(): AppConfig {
  try {
    const configPath = join(import.meta.dirname, '../browser/config.json');
    return JSON.parse(readFileSync(configPath, 'utf-8')) as AppConfig;
  } catch {
    return DEFAULT_APP_CONFIG;
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: APP_CONFIG_OVERRIDE, useValue: readRuntimeConfig() },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
