import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { AuthLayout } from './auth-layout';
import { REGISTERED_ICONS } from '../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../core/i18n/testing/provide-transloco-testing';

describe('AuthLayout', () => {
  // AuthLayout dùng @defer (on immediate) cho NetworkBackground — Angular biên dịch nội dung
  // deferred thành import() động, nên TestBed cần compileComponents() (async) trước khi tạo
  // component, khác với các component "should create" thông thường khác trong repo.
  it('should create', async () => {
    TestBed.configureTestingModule({
      imports: [AuthLayout],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(AuthLayout);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
