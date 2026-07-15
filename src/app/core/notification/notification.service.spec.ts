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

  it('should show a translated success message', () => {
    const { service, nzMessageService } = setup();

    service.success('common.notification.save_success');

    expect(nzMessageService.success).toHaveBeenCalledWith('Lưu thành công');
  });

  it('should show a translated error message', () => {
    const { service, nzMessageService } = setup();

    service.error('common.notification.delete_error');

    expect(nzMessageService.error).toHaveBeenCalledWith('Xoá thất bại');
  });
});
