import { Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { I18nService } from '../i18n/i18n.service';

// Wrapper mỏng quanh NzMessageService — nơi duy nhất gọi trực tiếp NzMessageService, các Feature
// gọi qua đây để không phụ thuộc trực tiếp vào ng-zorro (Dependency Rule, docs/14-architecture-principles.md).
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly i18nService = inject(I18nService);

  success(key: string, params?: Record<string, unknown>): void {
    this.nzMessageService.success(this.i18nService.translate(key, params));
  }

  error(key: string, params?: Record<string, unknown>): void {
    this.nzMessageService.error(this.i18nService.translate(key, params));
  }
}
