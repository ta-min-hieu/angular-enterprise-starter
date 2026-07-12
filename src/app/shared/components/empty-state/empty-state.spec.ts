import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('EmptyState', () => {
  it('should create with default message', () => {
    TestBed.configureTestingModule({
      imports: [EmptyState],
      providers: [...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(EmptyState);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.resolvedMessage()).toBe('Không có dữ liệu');
  });

  it('should render a custom message', () => {
    TestBed.configureTestingModule({
      imports: [EmptyState],
      providers: [...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('message', 'Chưa có đơn hàng nào');

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Chưa có đơn hàng nào');
  });
});
