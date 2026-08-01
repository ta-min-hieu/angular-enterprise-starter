import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NotificationService } from './notification.service';
import { provideTranslocoTesting } from '../i18n/testing/provide-transloco-testing';

describe('NotificationService', () => {
  function setup() {
    const nzMessageService = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ...provideTranslocoTesting(),
        { provide: NzMessageService, useValue: nzMessageService },
      ],
    });

    return { service: TestBed.inject(NotificationService), nzMessageService };
  }

  it('should show a translated success message with the entity name interpolated', () => {
    const { service, nzMessageService } = setup();

    service.successEntity('common.notification.save_success', 'products.title');

    expect(nzMessageService.success).toHaveBeenCalledWith('Lưu Sản phẩm thành công');
  });

  it('should show a translated error message with the entity name interpolated', () => {
    const { service, nzMessageService } = setup();

    service.errorEntity('common.notification.delete_error', 'users.title');

    expect(nzMessageService.error).toHaveBeenCalledWith('Xoá Người dùng thất bại');
  });

  it('records successEntity/errorEntity calls into history with their entityKey, most recent first', () => {
    const { service } = setup();

    service.successEntity('common.notification.save_success', 'products.title');
    service.errorEntity('common.notification.delete_error', 'users.title');

    const [latest, previous] = service.history();
    expect(latest.type).toBe('error');
    expect(latest.messageKey).toBe('common.notification.delete_error');
    expect(latest.entityKey).toBe('users.title');
    expect(previous.type).toBe('success');
    expect(previous.messageKey).toBe('common.notification.save_success');
    expect(previous.entityKey).toBe('products.title');
  });

  it('records plain success/error calls into history without an entityKey', () => {
    const { service } = setup();

    service.success('common.notification.save_success');

    expect(service.history()[0].entityKey).toBeUndefined();
  });

  it('marks every item unread until markAllRead is called', () => {
    const { service } = setup();

    service.successEntity('common.notification.save_success', 'products.title');
    service.errorEntity('common.notification.delete_error', 'users.title');
    expect(service.unreadCount()).toBe(2);

    service.markAllRead();

    expect(service.unreadCount()).toBe(0);
    expect(service.history().every((item) => item.read)).toBe(true);
  });

  it('empties the history on clearHistory', () => {
    const { service } = setup();

    service.successEntity('common.notification.save_success', 'products.title');
    service.clearHistory();

    expect(service.history()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });

  it('caps history at 50 entries, dropping the oldest', () => {
    const { service } = setup();

    for (let i = 0; i < 55; i++) {
      service.successEntity('common.notification.save_success', 'products.title');
    }

    expect(service.history()).toHaveLength(50);
  });
});
