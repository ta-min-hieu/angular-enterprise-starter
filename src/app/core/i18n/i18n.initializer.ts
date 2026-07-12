import { inject } from '@angular/core';
import { I18nService } from './i18n.service';

const DEFAULT_LOCALE = 'vi';

export function initializeLocale(): void {
  const i18nService = inject(I18nService);
  i18nService.setLocale(i18nService.resolveInitialLocale(DEFAULT_LOCALE));
}
