import { inject } from '@angular/core';
import { AppConfigService } from './app-config.service';

export function initializeAppConfig(): Promise<void> {
  return inject(AppConfigService).load();
}
