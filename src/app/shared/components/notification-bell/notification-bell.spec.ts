import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { describe, expect, it, vi } from 'vitest';
import { NotificationBell } from './notification-bell';
import { NotificationService } from '../../../core/notification/notification.service';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('NotificationBell', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [NotificationBell],
      providers: [
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
        { provide: NzMessageService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(NotificationBell);
    const notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();

    return { fixture, notificationService };
  }

  it('formats a timestamp as a short local time', () => {
    const { fixture } = setup();

    const formatted = fixture.componentInstance.formatTime(
      new Date('2026-01-01T08:05:00').getTime(),
    );

    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it('marks every notification as read when the bell is opened', () => {
    const { fixture, notificationService } = setup();
    notificationService.success('common.notification.save_success');
    expect(notificationService.unreadCount()).toBe(1);

    fixture.componentInstance.onVisibleChange(true);

    expect(notificationService.unreadCount()).toBe(0);
  });

  it('does not touch unread state when the bell is closed', () => {
    const { fixture, notificationService } = setup();
    notificationService.success('common.notification.save_success');

    fixture.componentInstance.onVisibleChange(false);

    expect(notificationService.unreadCount()).toBe(1);
  });

  it('renders without a populated history', () => {
    const { fixture } = setup();

    expect(fixture.nativeElement).toBeTruthy();
  });

  it('renders after history and detectChanges with a populated history', () => {
    const { fixture, notificationService } = setup();

    notificationService.success('common.notification.save_success');
    notificationService.error('common.notification.delete_error');
    fixture.detectChanges();

    expect(fixture.nativeElement).toBeTruthy();
  });
});
