import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { I18nService } from '../i18n/i18n.service';
import {
  NotificationHistoryItem,
  NotificationHistoryType,
} from './notification-history-item.model';

// Giới hạn số lượng giữ lại trong chuông thông báo — chỉ lưu trong phiên hiện tại (không persist),
// không cần giới hạn lớn, tránh phình bộ nhớ nếu người dùng ở lại session rất lâu.
const HISTORY_LIMIT = 50;

// Wrapper mỏng quanh NzMessageService — nơi duy nhất gọi trực tiếp NzMessageService, các Feature
// gọi qua đây để không phụ thuộc trực tiếp vào ng-zorro (Dependency Rule, docs/14-architecture-principles.md).
// Đồng thời giữ lại lịch sử thông báo (chuông ở Admin Layout) — chỉ lưu trong bộ nhớ của phiên hiện
// tại, mất khi tải lại trang, không có yêu cầu nghiệp vụ nào cần bền vững hơn thế.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly i18nService = inject(I18nService);

  private readonly historySignal = signal<readonly NotificationHistoryItem[]>([]);

  readonly history = this.historySignal.asReadonly();
  readonly unreadCount = computed(() => this.historySignal().filter((item) => !item.read).length);

  success(key: string, params?: Record<string, unknown>): void {
    this.emit('success', key, params);
  }

  error(key: string, params?: Record<string, unknown>): void {
    this.emit('error', key, params);
  }

  // Dùng khi thông báo cần nói rõ vừa thao tác trên đối tượng nào (vd "Lưu Sản phẩm thành công"
  // thay vì chỉ "Lưu thành công") — messageKey phải chứa placeholder {{entity}}, entityKey là key
  // i18n của tên đối tượng (thường tái dùng chính key tiêu đề trang, vd 'products.title').
  successEntity(messageKey: string, entityKey: string): void {
    this.emit('success', messageKey, { entity: this.i18nService.translate(entityKey) }, entityKey);
  }

  errorEntity(messageKey: string, entityKey: string): void {
    this.emit('error', messageKey, { entity: this.i18nService.translate(entityKey) }, entityKey);
  }

  markAllRead(): void {
    this.historySignal.update((items) =>
      items.some((item) => !item.read) ? items.map((item) => ({ ...item, read: true })) : items,
    );
  }

  clearHistory(): void {
    this.historySignal.set([]);
  }

  private emit(
    type: NotificationHistoryType,
    key: string,
    params: Record<string, unknown> | undefined,
    entityKey?: string,
  ): void {
    const text = this.i18nService.translate(key, params);
    if (type === 'success') {
      this.nzMessageService.success(text);
    } else {
      this.nzMessageService.error(text);
    }
    this.pushHistory(type, key, entityKey);
  }

  private pushHistory(
    type: NotificationHistoryType,
    messageKey: string,
    entityKey: string | undefined,
  ): void {
    const item: NotificationHistoryItem = {
      id: crypto.randomUUID(),
      type,
      messageKey,
      entityKey,
      createdAt: Date.now(),
      read: false,
    };
    this.historySignal.update((items) => [item, ...items].slice(0, HISTORY_LIMIT));
  }
}
