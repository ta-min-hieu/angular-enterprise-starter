import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotificationService } from '../../../core/notification/notification.service';
import { NotificationHistoryItem } from '../../../core/notification/notification-history-item.model';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-notification-bell',
  imports: [NzIconModule, NzDropDownModule, NzBadgeModule, TranslocoPipe],
  templateUrl: './notification-bell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell {
  protected readonly notificationService = inject(NotificationService);
  private readonly i18nService = inject(I18nService);

  // Mở chuông thì coi như đã xem hết — đúng UX phổ biến của badge thông báo (Gmail, GitHub...).
  onVisibleChange(visible: boolean): void {
    if (visible) {
      this.notificationService.markAllRead();
    }
  }

  // KHÔNG dùng pipe transloco trực tiếp trong template được vì entity cần dịch TRƯỚC rồi mới nội
  // suy vào messageKey (2 bước) — tự gọi I18nService.translate() 2 lần ở đây. Vẫn phản ứng đúng khi
  // đổi ngôn ngữ nhờ `reRenderOnLangChange: true` (app.config.ts), giống cách AdminLayout.labelMatches
  // đang làm.
  resolveMessage(item: NotificationHistoryItem): string {
    const params = item.entityKey
      ? { entity: this.i18nService.translate(item.entityKey) }
      : undefined;
    return this.i18nService.translate(item.messageKey, params);
  }

  formatTime(createdAt: number): string {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
