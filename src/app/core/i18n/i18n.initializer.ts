import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { I18nService } from './i18n.service';

const DEFAULT_LOCALE = 'vi';

export function initializeLocale(): Promise<void> {
  const i18nService = inject(I18nService);
  const translocoService = inject(TranslocoService);
  const locale = i18nService.resolveInitialLocale(DEFAULT_LOCALE);

  i18nService.setLocale(locale);

  // Chờ bản dịch thực sự có trong store trước khi bootstrap tiếp — nếu không, lần
  // change detection đầu tiên trên client chạy trước khi dữ liệu tải xong sẽ ghi đè
  // nội dung đã render đúng từ SSR bằng key thô trong thoáng chốc (FOUC).
  return firstValueFrom(translocoService.load(locale)).then(() => undefined);
}
